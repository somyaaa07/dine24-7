import {Order , OrderItem , Tables } from '../models/index.js';

export const getKDSOrders = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const orders = await Order.findAll({
            where:{
                tenant_id,
                        status:['pending','preparing','ready']

            },
            order:[['createdAt','DESC']],
            include:[{
                model:Tables,
                attributes:['id','section','table_number']
            },{
                model:OrderItem,
                where:{status:[
                    'pending','preparing'
                ]},
                required:false
            }]
        })

        return res.status(200).json({
            status:'success',
            data:orders
        })
    }
    catch(error){
        console.log("Error in getKDSOrders",error)
        return res.status(500).json({
            status:'false',
            message:'Internal Server Error'
        })
    }
}

export const updateOrderItemStatus = async(req,res)=>{
    try {
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {status} = req.body;

        const allowedStatus = ['preparing','ready']

        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                status:false,
                message:'Invalid Status on Kitchen only preparing and ready are allowed'
            })
        }

        const order = await Order.findOne({
            where:{id,tenant_id},
            include:[{
                model:OrderItem
            }]
        });

        if(!order){
            return res.status(404).json({
                status:false,
                message:'Order not found'
            })
        }

        await order.update({status});

        await OrderItem.update({
            status
        },{
            where:{order_id:id,
                status:['pending','preparing']
            }
        });

        return res.status(200).json({
            success:true,
            message:`Order ${status === 'preparing' ? 'is preparing':'is ready'}`,
            data:{id:order.id,status}
        })
    }catch(error){
        console.log("updateOrderItemStatus is failed",error)
        return res.status(500).json({
            status:false,
            message:'Internal Server Error'
        })
    }
}

export const updateItemStatus = async (req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {status} = req.body;

        const allowedStatus = ['preparing','ready','served']
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                status:false,
                message:'Invalid status'
            })
        }

        const item = await OrderItem.findOne({
            where:{id,tenant_id},
        });

        if(!item){
            return res.status(404).json({
                status:false,
                message:'Item not found'
            })
        }

        await item.update({
            status
        });

        // if all items are ready, then update the order status to ready
        const allItems = await OrderItem.findAll({
            where:{order_id:item.order_id}
        })

        const allReady = allItems.every(i=>i.status ==='ready' || i.status ==='served');

        if(allReady){
            await Order.update({
                status:'ready',
            },{
                                where:{tenant_id,id:item.order_id}

            })
        }

        return res.status(200).json({
            status:true,
            message:`Item ${status}`,
            data:{id:item.id,status}
        })
    }
    catch(error){
        console.log("updateItemStatus failed",error)
        return res.status(500).json({
            status:false,
            message:'Internal server error'
        })
    }
}