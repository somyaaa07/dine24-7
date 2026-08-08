import {Order,OrderItem,Payroll,InventoryItem,Employee,Customer,Expense} from '../models/index.js';
import { Op,fn,col,literal } from 'sequelize';
import { sequelize } from '../models/index.js';

export const getReport = async(req,res)=>{
    try{
    const tenant_id = req.user.tenant_id;
    const {start_date,end_date,group_by='day'} = req.query;

    const where = {tenant_id,status:'paid'}
    if(start_date && end_date){
        where.createdAt = {[Op.between]:[new Date(start_date),new Date(end_date + 'T23:59:59')]};

    }
    else{
        const today = new Date();
        today.setHours(0,0,0,0);
        where.createdAt ={[Op.gte]: new Date(today.setDate(today.getDate)-30)}
    }

    const orders = await Order.findAll({
        where,
        include:[{model:OrderItem}],
        order:[['createdAt','ASC']]
    })

    const totalRevenue = orders.reduce((s,o)=>s+parseFloat(o.total_amount),0);
    const totalOrders = orders.length;
    const avgOrderValue = totalRevenue/totalOrders >0 ? totalRevenue/totalOrders : 0;
    const totalCovers = orders.reduce((s,o)=>s+(o.OrderItems?.length || 0),0)

    const byPaymentMethod = orders.reduce((acc,o)=>{
        const m = o.payment_method || 'unknown';
        acc[m] = (acc[m] || 0) + parseFloat(o.total_amount);
        return acc;
    },{})

    const byOrderType = orders.reduce((acc,o)=>{
        acc[o.order_type] = (acc[o.order_type] || 0) + parseFloat(o.total_amount);
        return acc;
    },{})

      const dailySales = orders.reduce((acc, o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { date: day, revenue: 0, orders: 0 };
      acc[day].revenue += parseFloat(o.total_amount);
      acc[day].orders  += 1;
      return acc;
    }, {});
      return res.status(200).json({
      success: true,
      data: {
        summary: { totalRevenue, totalOrders, avgOrderValue, totalCovers },
        byPaymentMethod,
        byOrderType,
        dailySales: Object.values(dailySales)
      }
    });
}
catch(error){
    console.log("getReport error",error);
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}
}

export const getTopSellingItems = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {limit=10,start_date,end_date} = req.query;

        const orderWhere = {tenant_id,status:'paid'};
        if(start_date && end_date){
            orderWhere.createdAt ={
                [Op.between]:[new Date(start_date),new Date(end_date + 'T23:59:59')]
            }
        }

        const items = await OrderItem.findAll({
            where:{tenant_id},
            include:[{
                model:Order,
                where:orderWhere,
                attributes:[]
            }],
            attributes:[
                'menu_item_id','name',
                   [fn('SUM', col('quantity')), 'total_qty'],
        [fn('SUM', col('total_price')), 'total_revenue'],
        [fn('COUNT', col('OrderItem.id')), 'order_count']
            ],
            group:['menu_item_id','name'],
            order:[['total_revenue','DESC']],
            limit:parseInt(limit)
        })

        return res.status(200).json({
            success:true,
            data:items  
        })
    }
    catch(error){
        console.log("getTopSellingItems error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getInventoryReport = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const items = await InventoryItem.findAll({
            where:{tenant_id,is_active:true},
            order:[['name','ASC']]
        })
            const lowStock    = items.filter(i => parseFloat(i.current_quantity) <= parseFloat(i.minimum_threshold));
    const totalValue  = items.reduce((s, i) => s + parseFloat(i.current_quantity) * parseFloat(i.purchase_price), 0);
     return res.status(200).json({
      success: true,
      data: {
        items,
        low_stock_count: lowStock.length,
        low_stock_items: lowStock,
        total_inventory_value: totalValue
      }
    });
    }
     catch (error) {
    console.error('getInventoryReport failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export const getFinancialReport = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { month, year } = req.query;

    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year)  || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate   = new Date(y, m, 0, 23, 59, 59);

    const orders = await Order.findAll({
      where: { tenant_id, status: 'paid', createdAt: { [Op.between]: [startDate, endDate] } }
    });

    const revenue   = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
    const taxColl   = orders.reduce((s, o) => s + parseFloat(o.tax_amount || 0), 0);
    const discounts = orders.reduce((s, o) => s + parseFloat(o.discount_amount || 0), 0);

    const expenses = await Expense.findAll({
      where: { tenant_id, expense_date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] } }
    });
    const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);

    const payrolls = await Payroll.findAll({
      where: { tenant_id, month: m, year: y, status: 'paid' }
    });
    const totalPayroll = payrolls.reduce((s, p) => s + parseFloat(p.net_salary), 0);

    const grossProfit = revenue - totalExpenses - totalPayroll;

    return res.status(200).json({
      success: true,
      data: {
        month: m, year: y,
        revenue, tax_collected: taxColl, discounts_given: discounts,
        total_expenses: totalExpenses, total_payroll: totalPayroll,
        gross_profit: grossProfit, orders_count: orders.length
      }
    });
  } catch (error) {
    console.error('getFinancialReport failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCustomerReport = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const customers = await Customer.findAll({ where: { tenant_id, is_active: true } });

    const totalCustomers    = customers.length;
    const totalLoyaltyPts   = customers.reduce((s, c) => s + c.loyalty_points, 0);
    const topCustomers      = [...customers].sort((a, b) => parseFloat(b.total_spent) - parseFloat(a.total_spent)).slice(0, 10);
    const mostFrequent      = [...customers].sort((a, b) => b.total_visits - a.total_visits).slice(0, 10);

    return res.status(200).json({
      success: true,
      data: { totalCustomers, totalLoyaltyPts, topCustomers, mostFrequent }
    });
  } catch (error) {
    console.error('getCustomerReport failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};