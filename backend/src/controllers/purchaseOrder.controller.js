import {
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  InventoryItem,
  StockTransaction,
  AuditLog
} from '../models/index.js';
import { sequelize } from '../models/index.js';

// ── PO Number generate karo ───────────────────────────────
const generatePONumber = async (tenant_id) => {
  const year  = new Date().getFullYear();
  const count = await PurchaseOrder.count({ where: { tenant_id } });
  return `PO-${year}-${String(count + 1).padStart(3, '0')}`;
};

// ═══════════════════════════════════════════════
//  GET ALL — Saare purchase orders
// ═══════════════════════════════════════════════
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { status } = req.query;

    const where = { tenant_id };
    if (status) where.status = status;

    const orders = await PurchaseOrder.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name', 'phone']
        },
        {
          model: PurchaseOrderItem,
          include: [{
            model: InventoryItem,
            attributes: ['id', 'name', 'unit']
          }]
        }
      ]
    });

    return res.status(200).json({ success: true, data: orders });

  } catch (error) {
    console.error('getAllPurchaseOrders failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
//  GET ONE
// ═══════════════════════════════════════════════
export const getPurchaseOrderById = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { id }    = req.params;

    const order = await PurchaseOrder.findOne({
      where: { id, tenant_id },
      include: [
        { model: Supplier },
        {
          model: PurchaseOrderItem,
          include: [{ model: InventoryItem, attributes: ['id', 'name', 'unit'] }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "did'nt find the purchase order" });
    }

    return res.status(200).json({ success: true, data: order });

  } catch (error) {
    console.error('getPurchaseOrderById failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
//  CREATE — Naya purchase order banao
// ═══════════════════════════════════════════════
export const createPurchaseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const tenant_id = req.user.tenant_id;
    const {
      supplier_id, items,
      expected_delivery, note
    } = req.body;

    // Validations
    if (!supplier_id) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Select the supplier' });
    }
    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'atleast add one item' });
    }

    // Supplier exist karta hai?
    const supplier = await Supplier.findOne({
      where: { id: supplier_id, tenant_id, is_active: true }
    });
    if (!supplier) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'did not find supplier' });
    }

    // PO number generate karo
    const po_number = await generatePONumber(tenant_id);

    // Total calculate karo
    let total_amount = 0;
    for (const item of items) {
      total_amount += parseFloat(item.quantity_ordered) * parseFloat(item.unit_price);
    }

    // Purchase order banao
    const order = await PurchaseOrder.create({
      tenant_id,
      supplier_id,
      po_number,
      status:            'draft',
      total_amount,
      expected_delivery: expected_delivery || null,
      note:              note              || null,
      created_by:        req.user.user_id
    }, { transaction });

    // Items banao
    for (const item of items) {
      // Inventory item exist karta hai?
      const invItem = await InventoryItem.findOne({
        where: { id: item.inventory_item_id, tenant_id, is_active: true }
      });
      if (!invItem) continue;

      const total_price = parseFloat(item.quantity_ordered) * parseFloat(item.unit_price);

      await PurchaseOrderItem.create({
        tenant_id,
        purchase_order_id: order.id,
        inventory_item_id: item.inventory_item_id,
        quantity_ordered:  item.quantity_ordered,
        quantity_received: 0,
        unit_price:        item.unit_price,
        total_price
      }, { transaction });
    }

    await AuditLog.create({
      tenant_id,
      user_id:    req.user.user_id,
      action:     'PO_CREATED',
      ip_address: req.ip,
      details:    { po_number, supplier: supplier.name }
    }, { transaction });

    await transaction.commit();

    // Full order fetch karo response ke liye
    const fullOrder = await PurchaseOrder.findOne({
      where: { id: order.id },
      include: [
        { model: Supplier, attributes: ['id', 'name'] },
        {
          model: PurchaseOrderItem,
          include: [{ model: InventoryItem, attributes: ['id', 'name', 'unit'] }]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: `Purchase Order ${po_number} created`,
      data: fullOrder
    });

  } catch (error) {
    await transaction.rollback();
    console.error('createPurchaseOrder failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
//  UPDATE STATUS — Draft → Sent → Received
// ═══════════════════════════════════════════════
export const updateStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const tenant_id = req.user.tenant_id;
    const { id }    = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'sent', 'received', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await PurchaseOrder.findOne({
      where: { id, tenant_id },
      include: [{
        model: PurchaseOrderItem,
        include: [{ model: InventoryItem }]
      }]
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Did not find the order' });
    }

    // Cancelled order change nahi ho sakta
    if (order.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Cancelled order not changed' });
    }

    // Already received change nahi ho sakta
    if (order.status === 'received') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Already received can not change the order' });
    }

    // RECEIVED — Inventory automatically update karo
    if (status === 'received') {
      for (const item of order.PurchaseOrderItems) {
        const invItem = item.InventoryItem;
        if (!invItem) continue;

        const newQty = parseFloat(invItem.current_quantity) + parseFloat(item.quantity_ordered);

        // Inventory update karo
        await invItem.update({ current_quantity: newQty }, { transaction });

        // Stock transaction banao
        await StockTransaction.create({
          tenant_id,
          inventory_item_id: invItem.id,
          type:              'stock_in',
          quantity:          parseFloat(item.quantity_ordered),
          note:              `PO received: ${order.po_number}`,
          performed_by:      req.user.user_id
        }, { transaction });

        // PO item mein received quantity update karo
        await item.update({
          quantity_received: item.quantity_ordered
        }, { transaction });
      }

      await order.update({
        status,
        received_at: new Date()
      }, { transaction });

    } else {
      await order.update({ status }, { transaction });
    }

    await AuditLog.create({
      tenant_id,
      user_id:    req.user.user_id,
      action:     'PO_STATUS_UPDATED',
      ip_address: req.ip,
      details:    { po_number: order.po_number, status }
    }, { transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `Order status → ${status}${status === 'received' ? ' — Inventory updated' : ''}`,
    });

  } catch (error) {
    await transaction.rollback();
    console.error('updateStatus failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════
//  CANCEL
// ═══════════════════════════════════════════════
export const cancelOrder = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { id }    = req.params;

    const order = await PurchaseOrder.findOne({ where: { id, tenant_id } });

    if (!order) {
      return res.status(404).json({ success: false, message: 'not able to find order' });
    }

    if (order.status === 'received') {
      return res.status(400).json({
        success: false,
        message: 'Received orders can not be cancelled'
      });
    }

    await order.update({ status: 'cancelled' });

    return res.status(200).json({
      success: true,
      message: `${order.po_number} Cancelled`
    });

  } catch (error) {
    console.error('cancelOrder failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};