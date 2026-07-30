import { Order ,OrderItem ,Tables, MenuVariant, MenuItem, ResturantProfile , AuditLog , sequelize} from '../models/index.js';
import { consumeIngredients } from './recipe.controller.js';

const genrateOrderNumber = async(tenant_id)=>{
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');
    const count = await Order.count({where:{tenant_id}});

    return `ORD-${year}${month}${day}-${string(count+1).padStart(3,'0')}`;
}


export const getAllOrders = async(req,res)=>{
 try{
    const tenant_id = req.user.tenant_id;
    const {status,date} = req.query;

    const {where} = {tenant_id};
    if(status){
        where.status = status;
    }

    if(date === 'today'){
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);
        where.createAt = {
            $gte:today , $lt:tomorrow
        }
    }

    const orders = await Order.findAll({
        where,
        order:[['createAt','DESC']],
        include:[{model:Tables,attributes:['id','table_number','section']},{
            model:OrderItem,attributes:['id','name','quantity','unit_price','total_price','status','note']
        }]
    })

    return res.status(200).json({
        success:true,
        data:orders
    })
 }  
 catch(error){
    console.log("getAllOrders failed",error);
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
 } 
}


export const getOrderById = async (req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const orders = await Order.findAll({
            where:{
                id,tenant_id
            },
            include:[{
                model:Tables,attributes:['id','table_number','status']
            },
        {
            model:OrderItem
        }]
        })

        if(!orders){
            return res.status(404).json({
                success:false,
                message:"Order not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:orders
        })
    }
    catch(error){
        console.log("getOrderById failed",error);
        return res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
    }
}

export const createOrder = async (req,res)=>{
    const transaction = await sequelize.transaction();
    try{
        const tenant_id = req.user.tenant_id;
        const {
            table_id,
            items,
            order_type,
            note,
        } = req.body;

        if(items || items.length ===0){
            await transaction.rollback();
            return res.status(400).json({
                success:false,
                message:"Please select at least one item"
            })
        }

        if(order_type === 'dine_in' || order_type){
            if(!table_id){
                await transaction.rollback();
                return res.status(400).json({
                    success:false,
                    message:"Please select a table"
                })
            }
        }

        const table = await Tables.findOne({
            where:{
                id,
                table_id,
                is_active:true
            }
        })

        if(!table){
            await transaction.rollback();
            return res.status(400).json({
                success:false,
                message:"Table not found"
            })
        }

        const profile = await ResturantProfile.findOne({
            where:{
                tenant_id
            }
        })

        const taxRate = profile ? parseFloat(profile.tax_percentage)/100 : 0.05

        const order_number = await genrateOrderNumber(tenant_id);

        let subTotal = 0;
        const itemDetails = [];

        for(const item of items){
            const menuItem = await MenuItem.findOne({
                where:{
                    id:item.menu_item_id,
                    tenant_id,
                    is_active:true
                }
            })

            if(!menuItem) continue;
            let unit_price = parseFloat(menuItem.price);

            if(item.menu_variant_id){
                const variant = await MenuVariant.findOne({
                    where:{
                        id:item.menu_variant_id,menu_item_id:item.menu_item_id
                    }
                });

                if(variant){
                    unit_price = parseFloat(variant.price)
                }
            }

            const quantity = item.quantity || 1
            const total_price = unit_price * quantity;

            subTotal += total_price;

            itemDetails.push({
                tenant_id,
                menu_item_id:item.menu_item_id,
                menu_variant_id:item.menu_variant_id,
                name :menuItem.name,
                unit_price,
                total_price,
                quantity,
                status:'pending',
                note: item.note || null
            })

            const tax_amount = subTotal * taxRate;
            const total_amount = subTotal + tax_amount;
            
            const order = await Order.create({
                tenant_id,
                table_id:table_id || null ,
                order_number,
                status:'pending',
                order_type:order_type || 'dine_in',
                subTotal,
                tax_amount,
                total_amount,
                discount_amount:0,
                payment_status:'pending',
                note:note || null,
                served_by:req.user.user_id
            },{transaction})

            for(const item of itemDetails){
                await OrderItem.create({...item,order_id:order.id},{transaction})
            }
        }

        if(table_id){
            await Tables.update({
                status:'occupied',

            },
        {
            where:{
                id:table_id,
                tenant_id
            },transaction
        })
        }

        for(const item of itemDetails){
            try{
                await consumeIngredients(
                    item.menu_item_id,
                    tenant_id,
                    item.quantity,
                    req.user.user_id,
                    transaction   
                )
            }
            catch(e){
                console.log(`Recipe not found for item ${item.menu_item_id} - skipping inventory`)
                        }
        }

        await AuditLog.create({
            tenant_id,
            user_id:req.user.user_id,
            action:'ORDER_CREATED',
            ip_address:req.ip,
            details:{order_number,total_amount,items:itemDetails.length}
        },{
            transaction
        });

        await transaction.commit();

        const fullOrder = await Order.findOne({
            where:{id:order_id},
            include:[{model:Tables,attributes:['id','table_number']},{
                model:OrderItem
            }],
        });

        return res.status(200).json({
            success:true,
            message:`Order ${order_number} created successfully`,
            data:fullOrder
        })
    }
    catch(error){
        console.log("Error creating order",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}

