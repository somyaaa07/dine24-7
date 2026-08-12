import { Op } from 'sequelize';
import { AuditLog, User, Order, OrderItem, Tables, InventoryItem, Reservation } from '../models/index.js';

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

export const getStats = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { start, end } = getTodayRange();

        const todaysOrders = await Order.findAll({
            where: {
                tenant_id,
                createdAt: { [Op.between]: [start, end] },
                status: { [Op.ne]: 'cancelled' }
            }
        });

        const today_orders = todaysOrders.length;
        const today_sales = todaysOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        const avg_bill_value = today_orders > 0 ? today_sales / today_orders : 0;

        const total_tables = await Tables.count({ where: { tenant_id, is_active: true } });
        const active_tables = await Tables.count({ where: { tenant_id, is_active: true, status: 'occupied' } });

        return res.status(200).json({
            success: true,
            data: {
                today_sales,
                today_orders,
                total_tables,
                active_tables,
                avg_bill_value
            }
        });
    } catch (error) {
        console.log("dashboard stats error", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getLowStock = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const items = await InventoryItem.findAll({ where: { tenant_id, is_active: true } });

        const lowStock = items
            .filter(i => parseFloat(i.current_quantity) <= parseFloat(i.minimum_threshold))
            .map(i => ({
                item_name: i.name,
                current_quantity: i.current_quantity,
                unit: i.unit,
                threshold: i.minimum_threshold
            }));

        return res.status(200).json({
            success: true,
            data: lowStock
        });
    } catch (error) {
        console.log("dashboard low stock error", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getTodaysReservation = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const todayStr = new Date().toISOString().split('T')[0];

        const reservations = await Reservation.findAll({
            where: {
                tenant_id,
                reservation_date: todayStr,
                status: { [Op.notIn]: ['cancelled', 'no-show'] }
            },
            order: [['reservation_time', 'ASC']]
        });

        const data = reservations.map(r => ({
            customer_name: r.customer_name,
            time: r.reservation_time,
            guests: r.guests
        }));

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.log("dashboard todays reservation error", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getTopDishesh = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { start, end } = getTodayRange();

        const todaysOrders = await Order.findAll({
            where: {
                tenant_id,
                createdAt: { [Op.between]: [start, end] },
                status: { [Op.ne]: 'cancelled' }
            },
            attributes: ['id']
        });

        const orderIds = todaysOrders.map(o => o.id);

        if (orderIds.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const items = await OrderItem.findAll({
            where: { tenant_id, order_id: { [Op.in]: orderIds } }
        });

        const counts = {};
        items.forEach(item => {
            const name = item.name;
            counts[name] = (counts[name] || 0) + item.quantity;
        });

        const topDishes = Object.entries(counts)
            .map(([dish_name, order_count]) => ({ dish_name, order_count }))
            .sort((a, b) => b.order_count - a.order_count)
            .slice(0, 5);

        return res.status(200).json({
            success: true,
            data: topDishes
        });
    } catch (error) {
        console.log("dashboard top dishesh error", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getRecentActivity = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const recent_logs = await AuditLog.findAll(
            {
                where: { tenant_id },
                limit: 10,
                order: [['createdAt', 'DESC']],
                include: [{ model: User, attributes: ['name'] }]
            }
        );

        const formated = recent_logs.map((log => ({
            action: log.action,
            user_name: log.User ? log.User.name : "System",
            timestamp: log.createdAt
        })
        ));

        return res.status(200).json({
            success: true,
            data: formated
        });
    } catch (error) {
        console.log("dashboard recent activity error", error);
        return res.status(500).json({
            success: false,
            message: "internal server error"
        });
    }
};