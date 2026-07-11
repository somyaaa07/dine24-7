import {Tenant , User , AuditLog} from '../models/index.js';

export const getStats = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const mockStats ={
            today_sales:18720,
            today_orders:47,
            total_tables:12,
            active_tables:5,
            avg_bill_value:400
        }

        return res.status(200).json({
            success:true,
            data:mockStats
        })
    }
    catch(error){
        console.log("dashboard stats error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
};

export const getLowStock = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const mockLowStock = [
            {
               item_name:"chicken",current_quantity:2.3 , unit:"kg" , threshold:5 
            },
            {
                item_name:"milk",current_quantity:1.3 , unit:"ltr" , threshold:3
            }
        ]

        return res.status(200).json({
            success:true,
            data:mockLowStock
        })
    }
    catch(error){
        console.log("dashboard low stock error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getTodaysReservation = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const mockTodaysReservation = [
            {
                customer_name:"sharma family",
                time:"12:00 PM", 
                guests:4
            },
            {
                customer_name:"jain family",
                time:"1:00 PM",
                guests:2
            }
        ]

        return res.status(200).json({
            success:true,
            data:mockTodaysReservation
        })
    }
    catch(error){
        console.log("dashboard todays reservation error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getTopDishesh = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const mockTopDishesh = [
            {
                dish_name:"chicken biryani",
                order_count:23
            },
            {
                dish_name:"paneer biryani",
                order_count:12
            },
            {
                dish_name:"mutton biryani",
                order_count:8
            }
        ]

        return res.status(200).json({
            success:true,
            data:mockTopDishesh
        })
    }
    catch(error){
        console.log("dashboard top dishesh error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getRecentActivity = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const recent_logs = await AuditLog.findAll(
            {
                where:{tenant_id},
                limit:10,
                order:[['createdAt','DESC']],
                include:[{model:User , attribute:['name']}]
            }
        )

        const formated = recent_logs.map((log=>({
            action:log.action,
            user_name:log.user?log.user.name:"System",
            timestamp:log.createdAt
        })      
        ))
         
        return res.status(200).json({
            success:true,
            data:formated
        })
    }
    catch(error){
        console.log("dashboard recent activity error",error);
        return res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
}