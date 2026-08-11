import { v4 as uuidv4 } from 'uuid';
import { Tables, MenuCategory, MenuItem, MenuVariant, Order, OrderItem, ResturantProfile, sequelize } from '../models/index.js';

// Public — no auth — customer QR scan karta hai
export const getPublicMenu = async (req, res) => {
  try {
    const { tenant_id, table } = req.query;
    if (!tenant_id) return res.status(400).json({ success: false, message: 'tenant_id required' });

    const profile   = await ResturantProfile.findOne({ where: { tenant_id } });
    const tableInfo = table
      ? await Table.findOne({ where: { tenant_id, table_number: table, is_active: true } })
      : null;

    const menu = await MenuCategory.findAll({
      where: { tenant_id, is_active: true },
      order: [['sort_order', 'ASC']],
      include: [{
        model:    MenuItem,
        where:    { tenant_id, is_active: true, is_available: true },
        required: false,
        include:  [{ model: MenuVariant, where: { is_active: true }, required: false }]
      }]
    });

    return res.status(200).json({
      success: true,
      data: {
        restaurant: {
          name:            profile?.restaurant_name || 'Restaurant',
          logo:            profile?.logo_url,
          currency_symbol: profile?.currency_symbol || '₹'
        },
        table: tableInfo ? { id: tableInfo.id, table_number: tableInfo.table_number } : null,
        menu
      }
    });
  } catch (error) {
    console.error('getPublicMenu failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Customer places order via QR
export const placeQROrder = async (req, res) => {
  // FIX — validate BEFORE starting transaction
  const { tenant_id, table_id, items, customer_name, customer_phone } = req.body;

  if (!tenant_id) {
    return res.status(400).json({ success: false, message: 'tenant_id required' });
  }

  // FIX — items.lenght typo fixed to items.length
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one item required' });
  }

  // FIX — validate table before transaction
  if (table_id) {
    const table = await Table.findOne({ where: { id: table_id, tenant_id, is_active: true } });
    if (!table) {
      return res.status(400).json({ success: false, message: 'Invalid table' });
    }
  }

  const transaction = await sequelize.transaction();
  try {
    const profile = await ResturantProfile.findOne({ where: { tenant_id } });
    const taxRate = profile ? parseFloat(profile.tax_percentage) / 100 : 0.05;

    // FIX — UUID based order number — no race condition
    const shortId    = uuidv4().split('-')[0].toUpperCase();
    const date       = new Date();
    const dateStr    = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
    const order_number = `QR-${dateStr}-${shortId}`;

    let subtotal = 0;
    const itemDetails  = [];
    const unavailable  = [];

    for (const item of items) {
      // FIX — consistent field name: item.menu_item_id
      const menuItem = await MenuItem.findOne({
        where: { id: item.menu_item_id, tenant_id, is_active: true, is_available: true }
      });

      if (!menuItem) {
        unavailable.push(item.menu_item_id);
        continue;
      }

      let unit_price = parseFloat(menuItem.price);

      if (item.menu_variant_id) {
        // FIX — validate variant belongs to menu_item AND tenant
        const variant = await MenuVariant.findOne({
          where: {
            id:           item.menu_variant_id,
            menu_item_id: item.menu_item_id,
            is_active:    true
          }
        });
        if (variant) unit_price = parseFloat(variant.price);
      }

      const quantity    = parseInt(item.quantity) || 1;
      const total_price = unit_price * quantity;
      subtotal         += total_price;

      itemDetails.push({
        tenant_id,
        menu_item_id:    item.menu_item_id,
        menu_variant_id: item.menu_variant_id || null,
        name:            menuItem.name,
        quantity,
        unit_price,
        total_price,
        status:          'pending',
        note:            item.note || null
      });
    }

    // FIX — tell customer which items are unavailable
    if (itemDetails.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success:           false,
        message:           'No valid items found',
        unavailable_items: unavailable
      });
    }

    if (unavailable.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success:           false,
        message:           'Some items are unavailable',
        unavailable_items: unavailable
      });
    }

    const tax_amount   = subtotal * taxRate;
    const total_amount = subtotal + tax_amount;

    const order = await Order.create({
      tenant_id,
      table_id:        table_id || null,
      order_number,
      status:          'pending',
      order_type:      table_id ? 'dine_in' : 'takeaway',
      subtotal,
      tax_amount,
      discount_amount: 0,
      total_amount,
      payment_status:  'pending',
      note:            customer_name ? `Customer: ${customer_name} ${customer_phone || ''}`.trim() : null,
      served_by:       null
    }, { transaction });

    for (const item of itemDetails) {
      await OrderItem.create({ ...item, order_id: order.id }, { transaction });
    }

    if (table_id) {
      await Table.update(
        { status: 'occupied' },
        { where: { id: table_id, tenant_id }, transaction }
      );
    }

    await transaction.commit();

    return res.status(201).json({
      success:      true,
      message:      'Order placed! Waiter will serve you soon.',
      data:         { order_number, total_amount, items: itemDetails.length }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('placeQROrder failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Track QR order — by order_number only (no tenant_id exposure)
export const trackQROrder = async (req, res) => {
  try {
    const { order_number, tenant_id } = req.query;

    if (!order_number || !tenant_id) {
      return res.status(400).json({ success: false, message: 'order_number and tenant_id required' });
    }

    const order = await Order.findOne({
      where: { order_number, tenant_id },
      include: [{
        model:      OrderItem,
        attributes: ['name', 'quantity', 'status', 'total_price']
      }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        order_number:   order.order_number,
        status:         order.status,
        total_amount:   order.total_amount,
        payment_status: order.payment_status,
        items:          order.OrderItems
      }
    });
  } catch (error) {
    console.error('trackQROrder failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};