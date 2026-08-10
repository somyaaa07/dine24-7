import nodemailer from 'nodemailer';
import {User , Tenant , Order,InventoryItem} from '../models/index.js';

const transporter = nodemailer.createTransport({
    host:process.env.EMAIL_HOST,
    port:process.env.EMAIL_PORT,
    secure:true,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendEMail = async(to,subject,html)=>{
    try{
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to,
            subject,
            html
        })

        return true
    }
    catch(error){
        console.log("email failed",error)
        return false
    }
}

export const lowStockNotification = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id
        const tenant = await Tenant.findByPk(tenant_id)

        const owner = await User.findOne({where:{tenant_id},include:[]})

        const items = await InventoryItem.findAll({tenant_id,is_active:true})
        const lowItems = items.filter(i=> parseFloat(i.current_quantity)<=parseFloat(i.minimum_thresshold));

        if(lowItems.length === 0){
            return res.status(200).json({
                success:false,
                message:"No items are low in stock"
            })
        }

        const itemList = lowItems.map(i=>`<li>${i.name}:${i.current_quantity} ${i.unit} remaining (min:${i.minimum_thresshold})</li>`).join('');
        const html = `<h2>
        Low Stock Alert - ${tenant.name} </h2>
        <ul>${itemList}</ul>
        <p>
        please order soon
        </p>`

        if(owner?.email) {
            await sendEMail(owner.email,`Low Stock Alert - ${tenant.name}`,html)
        }

        return res.status(200).json({
            success:true,
            message:`Low Stock alert sent for ${lowItems.length}`,
            data:lowItems
        })

    }
    catch(error){
        console.log("send low stock notification error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const sendOrderConfirmation = async(req,res)=>{
    try{
        const {order_id,
            customer_email,
            customer_name
        } = req.body;

        if(!order_id || !customer_email){
            return res.status(400).json({
                success:false,
                message:"Order id and customer email is required"
            })
        }

        const order = await Order.findByPk(order_id);

        if(!order){
            return res.status(400).json({
                success:false,
                message:"Order not found"
            })
        }
          const html = `
      <h2>Order Confirmation</h2>
      <p>Dear ${customer_name || 'Customer'},</p>
      <p>Your order <strong>${order.order_number}</strong> has been received.</p>
      <p>Total: <strong>₹${order.total_amount}</strong></p>
      <p>Status: ${order.status}</p>
      <p>Thank you for dining with us!</p>`;

      const sent = await sendEMail(customer_email,`order confirmation -${order.order_number}`,html);
      return res.status(200).json({ success:true , message: sent ? 'Email Sent':'Email Failed'})
    }
    catch(error){
        console.log("sendOrderConfirmation error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'to, subject, message required' });
    }
    const html = `<div style="font-family:Arial,sans-serif;padding:24px;">${message}</div>`;
    const sent = await sendEmail(to, subject, html);
    return res.status(200).json({ success: sent, message: sent ? 'Email sent' : 'Email failed' });
  } catch (error) {
    console.error('sendCustomEmail failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getNotificationSettings = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      low_stock_alert: true,
      order_confirmation: true,
      daily_summary: true,
      email_notifications: true
    }
  });
};