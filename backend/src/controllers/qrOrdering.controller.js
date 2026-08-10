import {Tables , MenuCategory,MenuItem , ResturantProfile , Order, OrderItem , sequelize, MenuVariant} from '../models/index.js'

export const getPublicMenu = async(req,res)=>{
    try{
        const {table,tenant_id} = req.query;
        if(!tenant_id){
            return res.status(400).json({success:false,message:"tenant_id is required"})
        }

        const profile = await ResturantProfile.findOne({where:{tenant_id}});
        const tableInfo = table ? await Tables.findOne({where:{tenant_id,table_number:table,is_active:true}}):null;

        const menu = await MenuCategory.findAll({
            where:{tenant_id,is_active:true},
            order:[['sort_order','ASC']],
            include:[{
                model:MenuItem,
                where:{
                    tenant_id,
                    is_active:true,
                    is_available:true
                },required:false,
                order:[['sort_order','ASC']],
                include:[{
                    model:MenuVariant,
                    where:{tenant_id,is_active:true},
                    required:false
                }]
            }]
        })
        return res.status(200).json({success:true,
            data: {
        restaurant: { name: profile?.restaurant_name || 'Restaurant', logo: profile?.logo_url, currency_symbol: profile?.currency_symbol || '₹' },
        table: tableInfo ? { id: tableInfo.id, table_number: tableInfo.table_number } : null,
        menu
      }
        })

    }
    catch(error){
        console.log("getPublicMeny error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const placeQROrder = async (req,res)=>{
    const transaction = await sequelize.transaction();
    try{
        const {
            tenant_id,
            table_id,
            items,
            customer_name,
            customer_phone
        } = req.body;

        if(!tenant_id || !items || items.lenght === 0){
            return res.status(400).json({
                success:false,
                message:"tenant_id and items are required"
            })
        }

        const profile = await ResturantProfile.findOne({where:{
            tenant_id
        }})

        const taxRate = profile ? parseFloat(profile.tax_percenatge)/100 : 0.05;

        const date = new Date();

        const count = await Order.count({where:{tenant_id}});
        const order_number = `QR-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(count+1).padStart(3,'0')}`;

        let subtotal = 0;
        const itemDetails = []

        for (const item of items){
            const menuItem = await MenuItem.findOne({where:{
                id:item.menu.item.id,
                tenant_id,
                is_active:true,
                is_available:true
            }})

            if(!menuItem){
                continue
            }
              let unit_price = parseFloat(menuItem.price);
              if(item.menu_variant_id){
                const variant = await MenuVariant.findOne({
                    where:{
                        id:item.menu_variant_id
                    }
                })
                if(variant){
                    unit_price = parseFloat(variant.price)
                }
              }


              const quantity = item.quantity || 1;
              const total_price = unit_price * quantity;
              subtotal += total_price;
              
                itemDetails.push({
        tenant_id, menu_item_id: item.menu_item_id,
        menu_variant_id: item.menu_variant_id || null,
        name: menuItem.name, quantity, unit_price, total_price,
        status: 'pending', note: item.note || null
      });
    }
  if (itemDetails.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'No valid items found' });
    }

    const tax_amount = subtotal * taxRate;
    const total_amount = subtotal + tax_amount;

    const order = await Order.create({
      tenant_id, table_id: table_id || null, order_number,
      status: 'pending', order_type: table_id ? 'dine_in' : 'takeaway',
      subtotal, tax_amount, discount_amount: 0, total_amount,
      payment_status: 'pending', note: customer_name ? `Customer: ${customer_name} ${customer_phone || ''}` : null,
      served_by: null
    }, { transaction });

    for (const item of itemDetails) {
      await OrderItem.create({ ...item, order_id: order.id }, { transaction });
    }

    if (table_id) {
      await Tables.update({ status: 'occupied' }, { where: { id: table_id, tenant_id }, transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully! Waiter will serve you soon.',
      data: { order_number, total_amount, items: itemDetails.length }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('placeQROrder failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Track QR order status
export const trackQROrder = async (req, res) => {
  try {
    const { order_number, tenant_id } = req.query;
    if (!order_number || !tenant_id) {
      return res.status(400).json({ success: false, message: 'order_number and tenant_id required' });
    }

    const order = await Order.findOne({
      where: { order_number, tenant_id },
      include: [{ model: OrderItem, attributes: ['name', 'quantity', 'status', 'total_price'] }]
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    return res.status(200).json({
      success: true,
      data: {
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        items: order.OrderItems
      }
    });
  } catch (error) {
    console.error('trackQROrder failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
        
        

      
