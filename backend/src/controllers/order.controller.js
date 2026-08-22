// import { Op } from 'sequelize';
// import { Order, OrderItem, Tables, MenuVariant, MenuItem, ResturantProfile, AuditLog, sequelize } from '../models/index.js';
// import { consumeIngredients } from './recipe.controller.js';
// import { sendEMail } from '../utils/mailer.js';

// const genrateOrderNumber = async (tenant_id) => {
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const count = await Order.count({ where: { tenant_id } });

//     return `ORD-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
// }


// export const getAllOrders = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { status, date } = req.query;

//         const where = { tenant_id };
//         if (status) {
//             where.status = status;
//         }

//         if (date === 'today') {
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             const tomorrow = new Date(today);
//             tomorrow.setDate(tomorrow.getDate() + 1);
//             where.createdAt = {
//                 [Op.gte]: today,
//                 [Op.lt]: tomorrow
//             }
//         }

//         const orders = await Order.findAll({
//             where,
//             order: [['createdAt', 'DESC']],
//             include: [{ model: Tables, attributes: ['id', 'table_number', 'section'] }, {
//                 model: OrderItem, attributes: ['id', 'name', 'quantity', 'unit_price', 'total_price', 'status', 'note']
//             }]
//         })

//         return res.status(200).json({
//             success: true,
//             data: orders
//         })
//     }
//     catch (error) {
//         console.log("getAllOrders failed", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         })
//     }
// }


// export const getOrderById = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;

//         const order = await Order.findOne({
//             where: {
//                 id, tenant_id
//             },
//             include: [{
//                 model: Tables, attributes: ['id', 'table_number', 'status']
//             },
//             {
//                 model: OrderItem
//             }]
//         })

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             })
//         }

//         return res.status(200).json({
//             success: true,
//             data: order
//         })
//     }
//     catch (error) {
//         console.log("getOrderById failed", error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal Server Error'
//         })
//     }
// }

// export const createOrder = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const tenant_id = req.user.tenant_id;
//         const {
//             table_id,
//             items,
//             order_type,
//             note,
//         } = req.body;

//         if (!items || items.length === 0) {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "Please select at least one item"
//             })
//         }

//         if (!order_type || order_type === 'dine_in') {
//             if (!table_id) {
//                 await transaction.rollback();
//                 return res.status(400).json({
//                     success: false,
//                     message: "Please select a table"
//                 })
//             }
//         }

//         if (table_id) {
//             const table = await Tables.findOne({
//                 where: {
//                     id: table_id,
//                     tenant_id,
//                     is_active: true
//                 }
//             })

//             if (!table) {
//                 await transaction.rollback();
//                 return res.status(400).json({
//                     success: false,
//                     message: "Table not found"
//                 })
//             }
//         }

//         const profile = await ResturantProfile.findOne({
//             where: {
//                 tenant_id
//             }
//         })

//         const taxRate = profile ? parseFloat(profile.tax_percentage) / 100 : 0.05

//         const order_number = await genrateOrderNumber(tenant_id);

//         // Step 1: build up item details and subtotal FIRST, before creating the order
//         let subTotal = 0;
//         const itemDetails = [];

//         for (const item of items) {
//             const menuItem = await MenuItem.findOne({
//                 where: {
//                     id: item.menu_item_id,
//                     tenant_id,
//                     is_active: true
//                 }
//             })

//             if (!menuItem) continue;
//             let unit_price = parseFloat(menuItem.price);

//             if (item.menu_variant_id) {
//                 const variant = await MenuVariant.findOne({
//                     where: {
//                         id: item.menu_variant_id, menu_item_id: item.menu_item_id
//                     }
//                 });

//                 if (variant) {
//                     unit_price = parseFloat(variant.price)
//                 }
//             }

//             const quantity = item.quantity || 1
//             const total_price = unit_price * quantity;

//             subTotal += total_price;

//             itemDetails.push({
//                 tenant_id,
//                 menu_item_id: item.menu_item_id,
//                 menu_variant_id: item.menu_variant_id,
//                 name: menuItem.name,
//                 unit_price,
//                 total_price,
//                 quantity,
//                 status: 'pending',
//                 note: item.note || null
//             })
//         }

//         if (itemDetails.length === 0) {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "None of the selected items could be found"
//             })
//         }

//         const tax_amount = subTotal * taxRate;
//         const total_amount = subTotal + tax_amount;

//         // Step 2: create the order ONCE, after totals are known
//         const order = await Order.create({
//             tenant_id,
//             table_id: table_id || null,
//             order_number,
//             status: 'pending',
//             order_type: (!order_type || order_type === 'dine_in') ? 'dine-in' : order_type,
//             subtotal: subTotal,
//             tax_amount,
//             total_amount,
//             discount_amount: 0,
//             payment_status: 'pending',
//             note: note || null,
//             served_by: req.user.user_id
//         }, { transaction })

//         // Step 3: create all order items against that single order
//         for (const item of itemDetails) {
//             await OrderItem.create({ ...item, order_id: order.id }, { transaction })
//         }

//         if (table_id) {
//             await Tables.update(
//                 { status: 'occupied' },
//                 { where: { id: table_id, tenant_id }, transaction }
//             )
//         }

//         for (const item of itemDetails) {
//             try {
//                 await consumeIngredients(
//                     item.menu_item_id,
//                     tenant_id,
//                     item.quantity,
//                     req.user.user_id,
//                     transaction
//                 )
//             }
//             catch (e) {
//                 console.log(`Recipe not found for item ${item.menu_item_id} - skipping inventory`)
//             }
//         }

//         await AuditLog.create({
//             tenant_id,
//             user_id: req.user.user_id,
//             action: 'ORDER_CREATED',
//             ip_address: req.ip,
//             details: { order_number, total_amount, items: itemDetails.length }
//         }, {
//             transaction
//         });

//         await transaction.commit();

//         const fullOrder = await Order.findOne({
//             where: { id: order.id },
//             include: [{ model: Tables, attributes: ['id', 'table_number'] }, {
//                 model: OrderItem
//             }],
//         });

//         return res.status(201).json({
//             success: true,
//             message: `Order ${order_number} created successfully`,
//             data: fullOrder
//         })
//     }
//     catch (error) {
//         await transaction.rollback();
//         console.log("Error creating order", error)
//         return res.status(500).json({
//             success: false,
//             message: "Server Error"
//         })
//     }
// }

// export const addItems = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;
//         const { items } = req.body;

//         if (!items || items.length === 0) {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "No items provided"
//             })
//         }

//         const order = await Order.findOne({
//             where: {
//                 id, tenant_id
//             }
//         })

//         if (!order) {
//             await transaction.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             })
//         }

//         if (['paid', 'cancelled'].includes(order.status)) {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "Cannot add items to an order that is already paid or cancelled"
//             })
//         }

//         let additionalAmount = 0;

//         for (const item of items) {
//             const menuItem = await MenuItem.findOne({
//                 where: {
//                     id: item.menu_item_id, tenant_id, is_active: true
//                 }
//             });

//             if (!menuItem) continue;

//             let unit_price = parseFloat(menuItem.price);
//             const quantity = item.quantity || 1;
//             const total_price = unit_price * quantity;
//             additionalAmount += total_price;

//             await OrderItem.create({
//                 tenant_id,
//                 order_id: order.id,
//                 menu_item_id: item.menu_item_id,
//                 menu_variant_id: item.menu_variant_id,
//                 name: menuItem.name,
//                 quantity,
//                 unit_price,
//                 total_price,
//                 status: 'pending',
//                 note: item.note || null
//             }, { transaction })

//             try {
//                 await consumeIngredients(item.menu_item_id, tenant_id, quantity, req.user.user_id, transaction);
//             }
//             catch (e) {
//                 console.log(`Recipe not found ${item.menu_item_id}`)
//             }
//         }

//         // updating the order
//         const profile = await ResturantProfile.findOne({ where: { tenant_id } });
//         const taxRate = profile ? parseFloat(profile.tax_percentage) / 100 : 0.05;
//         const newSubtotal = parseFloat(order.subtotal) + additionalAmount;
//         const newTax = newSubtotal * taxRate;
//         const newTotal = newSubtotal + newTax;

//         await order.update({
//            subtotal: newSubtotal,
//             tax_amount: newTax,
//             total_amount: newTotal
//         }, { transaction })

//         await transaction.commit();

//         const updatedOrder = await Order.findOne({
//             where: { id: order.id },
//             include: [{
//                 model: OrderItem
//             }]
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Order Updated Successfully",
//             data: updatedOrder
//         })
//     }
//     catch (error) {
//         await transaction.rollback();
//         console.log("addItems Failed", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         })
//     }
// }

// export const updateStatus = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;
//         const { status } = req.body;

//         const validStatuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled']
//         if (!validStatuses.includes(status)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid Status"
//             })
//         }

//         const order = await Order.findOne({
//             where: { id, tenant_id }
//         })

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             })
//         }

//         if (order.status === 'cancelled') {
//             return res.status(400).json({
//                 success: false,
//                 message: "Order is already cancelled and cannot be updated"
//             })
//         }

//         await order.update({
//             status
//         });

//         return res.status(200).json({
//             success: true,
//             message: `Order status updated successfully to ${status}`,
//             data: order
//         })
//     }
//     catch (error) {
//         console.log("updateStatus failed", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         })
//     }
// }

// export const processPayment = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;
//         const { payment_method, discount_amount } = req.body;

//         if (!payment_method) {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment method is required"
//             })
//         }

//         const order = await Order.findOne({
//             where: { id, tenant_id }
//         })

//         if (!order) {
//             await transaction.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             })
//         }

//         if (order.status === 'paid') {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "Order already paid"
//             })
//         }

//         const discount = parseFloat(discount_amount) || 0;
//         const final_amount = Math.max(0, parseFloat(order.total_amount) - discount);

//         await order.update({
//             status: 'paid',
//             payment_method,
//             payment_status: 'paid',
//             discount_amount: discount,
//             final_amount
//         }, { transaction })

//         if (order.table_id) {
//             await Tables.update(
//                 { status: 'cleaning' },
//                 { where: { id: order.table_id, tenant_id }, transaction }
//             )
//         }

//         await AuditLog.create({
//             tenant_id,
//             user_id: req.user.user_id,
//             action: "ORDER_PAID",
//             ip_address: req.ip,
//             details: {
//                 order_number: order.order_number,
//                 payment_method,
//                 amount: final_amount,
//             }
//         }, { transaction });

//         await transaction.commit();

//         return res.status(200).json({
//             success: true,
//             message: "Order Paid Successfully",
//             data: {
//                 order_number: order.order_number,
//                 payment_method,
//                 amount: final_amount,
//                 discount
//             }
//         })
//     }

//     catch (error) {
//         await transaction.rollback();
//         console.log("processPayment failed", error);
//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong",
//             error: error.message
//         })
//     }
// }


// export const cancelOrder = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;
//         const order = await Order.findOne({ where: { id, tenant_id } });

//         if (!order) {
//             await transaction.rollback();
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             })
//         }

//         if (order.status === 'paid') {
//             await transaction.rollback();
//             return res.status(400).json({
//                 success: false,
//                 message: "Order already paid"
//             })
//         }

//         await order.update({
//             status: 'cancelled'
//         }, { transaction })

//         if (order.table_id) {
//             await Tables.update(
//                 { status: 'available' },
//                 { where: { id: order.table_id, tenant_id }, transaction }
//             )
//         }

//         await transaction.commit();

//         return res.status(200).json({
//             success: true,
//             message: "Order cancelled successfully"
//         })
//     }
//     catch (error) {
//         await transaction.rollback();
//         console.log("cancelOrder Failed", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         })
//     }
// }

// // Kitchen Order Ticket - what the kitchen needs to prepare (no prices)
// export const getKOT = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;

//         const order = await Order.findOne({
//             where: { id, tenant_id },
//             include: [
//                 { model: Tables, attributes: ['id', 'table_number', 'section'] },
//                 { model: OrderItem, attributes: ['id', 'name', 'quantity', 'note', 'status'] }
//             ]
//         });

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         return res.status(200).json({
//             success: true,
//             data: {
//                 order_number: order.order_number,
//                 table: order.Table ? order.Table.table_number : 'Takeaway',
//                 order_type: order.order_type,
//                 created_at: order.createdAt,
//                 note: order.note,
//                 items: order.OrderItems.map(i => ({
//                     name: i.name,
//                     quantity: i.quantity,
//                     note: i.note
//                 }))
//             }
//         });
//     } catch (error) {
//         console.log("getKOT failed", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// // Customer bill/invoice - items + prices + tax + total
// const buildBillData = async (order, tenant_id) => {
//     const profile = await ResturantProfile.findOne({ where: { tenant_id } });

//     return {
//         restaurant_name: profile?.resturant_name || 'Restaurant',
//         currency_symbol: profile?.currency_symbol || '\u20b9',
//         order_number: order.order_number,
//         table: order.Table ? order.Table.table_number : 'Takeaway',
//         created_at: order.createdAt,
//         customer_name: order.customer_name,
//         customer_email: order.customer_email,
//         items: order.OrderItems.map(i => ({
//             name: i.name,
//             quantity: i.quantity,
//             unit_price: i.unit_price,
//             total_price: i.total_price
//         })),
//         subtotal: order.subtotal,
//         tax_amount: order.tax_amount,
//         discount_amount: order.discount_amount,
//         total_amount: order.final_amount || order.total_amount,
//         payment_method: order.payment_method,
//         payment_status: order.payment_status
//     };
// };

// const billHtml = (bill) => {
//     const rows = bill.items.map(i => `
//         <tr>
//             <td style="padding:6px 8px;border-bottom:1px solid #eee;">${i.name}</td>
//             <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
//             <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${bill.currency_symbol}${i.total_price}</td>
//         </tr>
//     `).join('');

//     return `
//     <div style="font-family:sans-serif;max-width:420px;margin:0 auto;color:#1A1815;">
//         <h2 style="margin-bottom:4px;">${bill.restaurant_name}</h2>
//         <p style="margin:0;color:#7A7264;font-size:13px;">Order #${bill.order_number} · ${bill.table}</p>
//         <p style="margin:0 0 12px;color:#7A7264;font-size:13px;">${new Date(bill.created_at).toLocaleString()}</p>
//         <table style="width:100%;border-collapse:collapse;font-size:14px;">
//             <thead>
//                 <tr>
//                     <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #1A1815;">Item</th>
//                     <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #1A1815;">Qty</th>
//                     <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #1A1815;">Amount</th>
//                 </tr>
//             </thead>
//             <tbody>${rows}</tbody>
//         </table>
//         <table style="width:100%;margin-top:8px;font-size:14px;">
//             <tr><td>Subtotal</td><td style="text-align:right;">${bill.currency_symbol}${bill.subtotal}</td></tr>
//             <tr><td>Tax</td><td style="text-align:right;">${bill.currency_symbol}${bill.tax_amount}</td></tr>
//             ${bill.discount_amount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${bill.currency_symbol}${bill.discount_amount}</td></tr>` : ''}
//             <tr style="font-weight:700;font-size:16px;"><td>Total</td><td style="text-align:right;">${bill.currency_symbol}${bill.total_amount}</td></tr>
//         </table>
//         <p style="margin-top:16px;color:#7A7264;font-size:12px;">Thank you for dining with us!</p>
//     </div>
//     `;
// };

// export const getBill = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;

//         const order = await Order.findOne({
//             where: { id, tenant_id },
//             include: [
//                 { model: Tables, attributes: ['id', 'table_number'] },
//                 { model: OrderItem, attributes: ['id', 'name', 'quantity', 'unit_price', 'total_price'] }
//             ]
//         });

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         const bill = await buildBillData(order, tenant_id);

//         return res.status(200).json({ success: true, data: bill });
//     } catch (error) {
//         console.log("getBill failed", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// // Email the bill to the customer - uses to_email from the request body if
// // given, otherwise falls back to whatever email the customer left when
// // ordering (e.g. via QR ordering).
// export const emailBill = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;
//         const { to_email } = req.body;

//         const order = await Order.findOne({
            // where: { id, tenant_id },
//             include: [
//                 { model: Tables, attributes: ['id', 'table_number'] },
//                 { model: OrderItem, attributes: ['id', 'name', 'quantity', 'unit_price', 'total_price'] }
//             ]
//         });

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         const recipient = to_email || order.customer_email;
//         if (!recipient) {
//             return res.status(400).json({ success: false, message: "No email address available for this order. Provide 'to_email'." });
//         }

//         const bill = await buildBillData(order, tenant_id);
//         const html = billHtml(bill);

//         const sent = await sendEMail(recipient, `Your bill from ${bill.restaurant_name} - Order #${bill.order_number}`, html);

//         if (!sent) {
//             return res.status(502).json({ success: false, message: "Could not send email. Check email settings." });
//         }

//         return res.status(200).json({ success: true, message: `Bill emailed to ${recipient}` });
//     } catch (error) {
//         console.log("emailBill failed", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// export const getActiveOrders = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const orders = await Order.findAll({
//             where: {
//                 tenant_id,
//                 status: { [Op.in]: ['pending', 'preparing', 'ready'] }
//             },
//             order: [['createdAt', 'DESC']],
//             include: [{
//                 model: Tables, attributes: ['id', 'table_number']
//             }, {
//                 model: OrderItem
//             }]
//         })
//         return res.status(200).json({
//             success: true,
//             message: "Active Orders fetched successfully",
//             data: orders
//         })

//     }
//     catch (error) {
//         console.log("getActiveOrders failed", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         })
//     }
// }

import { Op } from 'sequelize';
import { Order, OrderItem, Tables, MenuVariant, MenuItem, ResturantProfile, AuditLog, Branch, sequelize } from '../models/index.js';
import { consumeIngredients } from './recipe.controller.js';
import { sendEMail } from '../utils/mailer.js';
const genrateOrderNumber = async (tenant_id) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await Order.count({ where: { tenant_id } });

    return `ORD-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
}

// Every tenant should have at least a "main" branch. Single-location tenants
// who never touched the branch feature won't have created one explicitly, so
// fall back gracefully instead of forcing branch_id to be required everywhere.
const resolveMainBranchId = async (tenant_id) => {
    const mainBranch = await Branch.findOne({ where: { tenant_id, is_main: true } });
    return mainBranch ? mainBranch.id : null;
}


export const getAllOrders = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { status, date, branch_id } = req.query;

        const where = { tenant_id };
        if (status) {
            where.status = status;
        }
        if (branch_id) {
            where.branch_id = branch_id;
        }

        if (date === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            where.createdAt = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            }
        }

        const orders = await Order.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [{ model: Tables, attributes: ['id', 'table_number', 'section'] }, {
                model: OrderItem, attributes: ['id', 'name', 'quantity', 'unit_price', 'total_price', 'status', 'note']
            }]
        })

        return res.status(200).json({
            success: true,
            data: orders
        })
    }
    catch (error) {
        console.log("getAllOrders failed", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const getOrderById = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const order = await Order.findOne({
            where: {
                id, tenant_id
            },
            include: [{
                model: Tables, attributes: ['id', 'table_number', 'status']
            },
            {
                model: OrderItem
            }]
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: order
        })
    }
    catch (error) {
        console.log("getOrderById failed", error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const tenant_id = req.user.tenant_id;
        const {
            table_id,
            branch_id,
            items,
            order_type,
            note,
        } = req.body;

        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Please select at least one item"
            })
        }

        if (!order_type || order_type === 'dine_in') {
            if (!table_id) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Please select a table"
                })
            }
        }

        let resolvedBranchId = null;

        if (table_id) {
            const table = await Tables.findOne({
                where: {
                    id: table_id,
                    tenant_id,
                    is_active: true
                }
            })

            if (!table) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Table not found"
                })
            }

            resolvedBranchId = table.branch_id || await resolveMainBranchId(tenant_id);
        } else if (branch_id) {
            const branch = await Branch.findOne({ where: { id: branch_id, tenant_id } });
            if (!branch) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: "Branch not found"
                })
            }
            resolvedBranchId = branch.id;
        } else {
            resolvedBranchId = await resolveMainBranchId(tenant_id);
        }

        const profile = await ResturantProfile.findOne({
            where: {
                tenant_id
            }
        })

        const taxRate = profile ? parseFloat(profile.tax_percentage) / 100 : 0.05

        const order_number = await genrateOrderNumber(tenant_id);

        // Step 1: build up item details and subtotal FIRST, before creating the order
        let subTotal = 0;
        const itemDetails = [];

        for (const item of items) {
            const menuItem = await MenuItem.findOne({
                where: {
                    id: item.menu_item_id,
                    tenant_id,
                    is_active: true
                }
            })

            if (!menuItem) continue;
            let unit_price = parseFloat(menuItem.price);

            if (item.menu_variant_id) {
                const variant = await MenuVariant.findOne({
                    where: {
                        id: item.menu_variant_id, menu_item_id: item.menu_item_id
                    }
                });

                if (variant) {
                    unit_price = parseFloat(variant.price)
                }
            }

            const quantity = item.quantity || 1
            const total_price = unit_price * quantity;

            subTotal += total_price;

            itemDetails.push({
                tenant_id,
                menu_item_id: item.menu_item_id,
                menu_variant_id: item.menu_variant_id,
                name: menuItem.name,
                unit_price,
                total_price,
                quantity,
                status: 'pending',
                note: item.note || null
            })
        }

        if (itemDetails.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "None of the selected items could be found"
            })
        }

        const tax_amount = subTotal * taxRate;
        const total_amount = subTotal + tax_amount;

        // Step 2: create the order ONCE, after totals are known
        const order = await Order.create({
            tenant_id,
            branch_id: resolvedBranchId,
            table_id: table_id || null,
            order_number,
            status: 'pending',
            order_type: (!order_type || order_type === 'dine_in') ? 'dine-in' : order_type,
            subtotal: subTotal,
            tax_amount,
            total_amount,
            discount_amount: 0,
            payment_status: 'pending',
            note: note || null,
            served_by: req.user.user_id
        }, { transaction })

        // Step 3: create all order items against that single order
        for (const item of itemDetails) {
            await OrderItem.create({ ...item, order_id: order.id }, { transaction })
        }

        if (table_id) {
            await Tables.update(
                { status: 'occupied' },
                { where: { id: table_id, tenant_id }, transaction }
            )
        }

        for (const item of itemDetails) {
            try {
                await consumeIngredients(
                    item.menu_item_id,
                    tenant_id,
                    item.quantity,
                    req.user.user_id,
                    transaction
                )
            }
            catch (e) {
                console.log(`Recipe not found for item ${item.menu_item_id} - skipping inventory`)
            }
        }

        await AuditLog.create({
            tenant_id,
            user_id: req.user.user_id,
            action: 'ORDER_CREATED',
            ip_address: req.ip,
            details: { order_number, total_amount, items: itemDetails.length }
        }, {
            transaction
        });

        await transaction.commit();

        const fullOrder = await Order.findOne({
            where: { id: order.id },
            include: [{ model: Tables, attributes: ['id', 'table_number'] }, {
                model: OrderItem
            }],
        });

        return res.status(201).json({
            success: true,
            message: `Order ${order_number} created successfully`,
            data: fullOrder
        })
    }
    catch (error) {
        await transaction.rollback();
        console.log("Error creating order", error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}

export const addItems = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { items } = req.body;

        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "No items provided"
            })
        }

        const order = await Order.findOne({
            where: {
                id, tenant_id
            }
        })

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (['paid', 'cancelled'].includes(order.status)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Cannot add items to an order that is already paid or cancelled"
            })
        }

        let additionalAmount = 0;

        for (const item of items) {
            const menuItem = await MenuItem.findOne({
                where: {
                    id: item.menu_item_id, tenant_id, is_active: true
                }
            });

            if (!menuItem) continue;

            let unit_price = parseFloat(menuItem.price);
            const quantity = item.quantity || 1;
            const total_price = unit_price * quantity;
            additionalAmount += total_price;

            await OrderItem.create({
                tenant_id,
                order_id: order.id,
                menu_item_id: item.menu_item_id,
                menu_variant_id: item.menu_variant_id,
                name: menuItem.name,
                quantity,
                unit_price,
                total_price,
                status: 'pending',
                note: item.note || null
            }, { transaction })

            try {
                await consumeIngredients(item.menu_item_id, tenant_id, quantity, req.user.user_id, transaction);
            }
            catch (e) {
                console.log(`Recipe not found ${item.menu_item_id}`)
            }
        }

        // updating the order
        const profile = await ResturantProfile.findOne({ where: { tenant_id } });
        const taxRate = profile ? parseFloat(profile.tax_percentage) / 100 : 0.05;
        const newSubtotal = parseFloat(order.subtotal) + additionalAmount;
        const newTax = newSubtotal * taxRate;
        const newTotal = newSubtotal + newTax;

        await order.update({
           subtotal: newSubtotal,
            tax_amount: newTax,
            total_amount: newTotal
        }, { transaction })

        await transaction.commit();

        const updatedOrder = await Order.findOne({
            where: { id: order.id },
            include: [{
                model: OrderItem
            }]
        });

        return res.status(200).json({
            success: true,
            message: "Order Updated Successfully",
            data: updatedOrder
        })
    }
    catch (error) {
        await transaction.rollback();
        console.log("addItems Failed", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const updateStatus = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'preparing', 'ready', 'served', 'paid', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Status"
            })
        }

        const order = await Order.findOne({
            where: { id, tenant_id }
        })

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled and cannot be updated"
            })
        }

        await order.update({
            status
        });

        return res.status(200).json({
            success: true,
            message: `Order status updated successfully to ${status}`,
            data: order
        })
    }
    catch (error) {
        console.log("updateStatus failed", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const processPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { payment_method, discount_amount } = req.body;

        if (!payment_method) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Payment method is required"
            })
        }

        const order = await Order.findOne({
            where: { id, tenant_id }
        })

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.status === 'paid') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Order already paid"
            })
        }

        const discount = parseFloat(discount_amount) || 0;
        const final_amount = Math.max(0, parseFloat(order.total_amount) - discount);

        await order.update({
            status: 'paid',
            payment_method,
            payment_status: 'paid',
            discount_amount: discount,
            final_amount
        }, { transaction })

        if (order.table_id) {
            await Tables.update(
                { status: 'cleaning' },
                { where: { id: order.table_id, tenant_id }, transaction }
            )
        }

        await AuditLog.create({
            tenant_id,
            user_id: req.user.user_id,
            action: "ORDER_PAID",
            ip_address: req.ip,
            details: {
                order_number: order.order_number,
                payment_method,
                amount: final_amount,
            }
        }, { transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Order Paid Successfully",
            data: {
                order_number: order.order_number,
                payment_method,
                amount: final_amount,
                discount
            }
        })
    }

    catch (error) {
        await transaction.rollback();
        console.log("processPayment failed", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        })
    }
}


export const cancelOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const order = await Order.findOne({ where: { id, tenant_id } });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        if (order.status === 'paid') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Order already paid"
            })
        }

        await order.update({
            status: 'cancelled'
        }, { transaction })

        if (order.table_id) {
            await Tables.update(
                { status: 'available' },
                { where: { id: order.table_id, tenant_id }, transaction }
            )
        }

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully"
        })
    }
    catch (error) {
        await transaction.rollback();
        console.log("cancelOrder Failed", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// Kitchen Order Ticket - what the kitchen needs to prepare (no prices)
export const getKOT = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const order = await Order.findOne({
            where: { id, tenant_id },
            include: [
                { model: Tables, attributes: ['id', 'table_number', 'section'] },
                { model: OrderItem, attributes: ['id', 'name', 'quantity', 'note', 'status'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                order_number: order.order_number,
                table: order.Table ? order.Table.table_number : 'Takeaway',
                order_type: order.order_type,
                created_at: order.createdAt,
                note: order.note,
                items: order.OrderItems.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    note: i.note
                }))
            }
        });
    } catch (error) {
        console.log("getKOT failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Customer bill/invoice - items + prices + tax + total
export const getBill = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const order = await Order.findOne({
            where: { id, tenant_id },
            include: [
                { model: Tables, attributes: ['id', 'table_number'] },
                { model: OrderItem, attributes: ['id', 'name', 'quantity', 'unit_price', 'total_price'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const profile = await ResturantProfile.findOne({ where: { tenant_id } });

        return res.status(200).json({
            success: true,
            data: {
                restaurant_name: profile?.resturant_name || 'Restaurant',
                currency_symbol: profile?.currency_symbol || '\u20b9',
                order_number: order.order_number,
                table: order.Table ? order.Table.table_number : 'Takeaway',
                created_at: order.createdAt,
                items: order.OrderItems.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    total_price: i.total_price
                })),
                subtotal: order.subtotal,
                tax_amount: order.tax_amount,
                discount_amount: order.discount_amount,
                total_amount: order.final_amount || order.total_amount,
                payment_method: order.payment_method,
                payment_status: order.payment_status
            }
        });
    } catch (error) {
        console.log("getBill failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
const buildBillData = async (order, tenant_id) => {
    const profile = await ResturantProfile.findOne({ where: { tenant_id } });

    return {
        restaurant_name: profile?.resturant_name || 'Restaurant',
        currency_symbol: profile?.currency_symbol || '₹',
        order_number: order.order_number,
        table: order.Table ? order.Table.table_number : 'Takeaway',
        created_at: order.createdAt,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        items: order.OrderItems.map(i => ({
            name: i.name,
            quantity: i.quantity,
            unit_price: i.unit_price,
            total_price: i.total_price
        })),
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        discount_amount: order.discount_amount,
        total_amount: order.final_amount || order.total_amount,
        payment_method: order.payment_method,
        payment_status: order.payment_status
    };
};

const billHtml = (bill) => {
    const rows = bill.items.map(i => `
        <tr>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;">${i.name}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${bill.currency_symbol}${i.total_price}</td>
        </tr>
    `).join('');

    return `
    <div style="font-family:sans-serif;max-width:420px;margin:0 auto;color:#1A1815;">
        <h2 style="margin-bottom:4px;">${bill.restaurant_name}</h2>
        <p style="margin:0;color:#7A7264;font-size:13px;">Order #${bill.order_number} · ${bill.table}</p>
        <p style="margin:0 0 12px;color:#7A7264;font-size:13px;">${new Date(bill.created_at).toLocaleString()}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
                <tr>
                    <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #1A1815;">Item</th>
                    <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #1A1815;">Qty</th>
                    <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #1A1815;">Amount</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <table style="width:100%;margin-top:8px;font-size:14px;">
            <tr><td>Subtotal</td><td style="text-align:right;">${bill.currency_symbol}${bill.subtotal}</td></tr>
            <tr><td>Tax</td><td style="text-align:right;">${bill.currency_symbol}${bill.tax_amount}</td></tr>
            ${bill.discount_amount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${bill.currency_symbol}${bill.discount_amount}</td></tr>` : ''}
            <tr style="font-weight:700;font-size:16px;"><td>Total</td><td style="text-align:right;">${bill.currency_symbol}${bill.total_amount}</td></tr>
        </table>
        <p style="margin-top:16px;color:#7A7264;font-size:12px;">Thank you for dining with us!</p>
    </div>
    `;
};
export const emailBill = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { to_email } = req.body;

        const order = await Order.findOne({
            where: { id, tenant_id },
            include: [
                { model: Tables, attributes: ['id', 'table_number'] },
                { model: OrderItem, attributes: ['id', 'name', 'quantity', 'unit_price', 'total_price'] }
            ]
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const recipient = to_email || order.customer_email;
        if (!recipient) {
            return res.status(400).json({ success: false, message: "No email address available for this order. Provide 'to_email'." });
        }

        const bill = await buildBillData(order, tenant_id);
        const html = billHtml(bill);

        const sent = await sendEMail(recipient, `Your bill from ${bill.restaurant_name} - Order #${bill.order_number}`, html);

        if (!sent) {
            return res.status(502).json({ success: false, message: "Could not send email. Check email settings." });
        }

        return res.status(200).json({ success: true, message: `Bill emailed to ${recipient}` });
    } catch (error) {
        console.log("emailBill failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getActiveOrders = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { branch_id } = req.query;
        const where = {
            tenant_id,
            status: { [Op.in]: ['pending', 'preparing', 'ready'] }
        };
        if (branch_id) {
            where.branch_id = branch_id;
        }
        const orders = await Order.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [{
                model: Tables, attributes: ['id', 'table_number']
            }, {
                model: OrderItem
            }]
        })
        return res.status(200).json({
            success: true,
            message: "Active Orders fetched successfully",
            data: orders
        })

    }
    catch (error) {
        console.log("getActiveOrders failed", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}