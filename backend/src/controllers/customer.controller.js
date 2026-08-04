import { Customer ,Order,OrderItem  } from "../models/index.js";
import { Op } from 'sequelize';

export const getAllCustomers = async(req,res)=>{
    try{
        const tenant_id= req.user.tenant_id;
        const {search} = req.query;
        const where = {tenant_id,is_active:true};

        if(search){
            where[Op.or]=[
                {name:{[Op.like]:`%${search}%`}},
                {email:{[Op.like]:`%${search}%`}},
                {phone:{[Op.like]:`%${search}%`}}
            ];
        }

        const customers = await Customer.findAll({where,order:[['total_visits','DESC']]});

        return res.status(200).json({
            success:true,
            data:customers
        })
    }
    catch(err){
        console.log("Error in getAllCustomers",err)
        return res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
    }
}


export const getCustomerById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const customer = await Customer.findOne({where:{id,tenant_id,is_active:true}});

        if(!customer){
            return res.status(404).json({
                success:false,
                message:'Customer not found'
            })
        }

        return res.status(200).json({
            success:true,
            data:customer
        })
    }
    catch(error){
        console.log("Error in getCustomerById",error)
        return res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
    }
}


export const createCustomer = async(req,res)=>{
  try{
      const tenant_id = req.user.tenant_id;
    const {name,email,phone,birthdate,anniversary,notes} = req.body;

    if(!name || name.trim() === ''){
        return res.status(400).json({
            success:false,
            message:'Name is required'
        })
    }

    if(phone){
        const existing = await Customer.findOne({where:{tenant_id,phone,is_active:true}});
        if(existing){
            return res.status(400).json({
                success:false,
                message:'Phone number already exists'
            })
        }
    }

    const customer = await Customer.create({
        tenant_id,
        name:name.trim(),
        email:email || null,
        phone:phone || null,
        birthdate:birthdate || null,
        anniversary:anniversary || null,
        notes:notes || null
    })

    return res.status(200).json({
        success:true,
        message:'Customer created successfully',
        data:customer
    })

  }
  catch(error){
    console.log("createCustomer failed",error);
    return res.status(500).json({
        success:false,
        message:'Internal Server Error'
    })
  }

}

export const updateCustomer = async (req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {name,email,phone,birthdate,anniversary,notes}= req.body;

        const customer = await Customer.findOne({where:{id,tenant_id,is_active:true}})

        if(!customer){
            return res.status(404).json({
                success:false,
                message:'Customer not found'
            })
        }

        await customer.update({
            ...(name !==undefined && {name}),
            ...(email !==undefined && {email}),
            ...(phone !==undefined && {phone}),
            ...(birthdate !==undefined && {birthdate}),
            ...(anniversary !==undefined && {anniversary}),
            ...(notes !==undefined && {notes})
        })

        return res.status(200).json({
            success:true,
            message:'Customer updated successfully',
            data:customer
        })
    }
    catch(error){
        console.log("Error in updateCustomer",error);
        return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

export const deleteCustomer = async(req,res)=>{
    try{
        const {id} =req.params;
        const tenant_id = req.user.tenant_id;

        const customer = await Customer.findOne({
            where:{id,tenant_id,is_active:true}
        })

        if(!customer){
            return res.status(404).json({
                success:false,
                message:'Customer not found'
            })
        }

        await customer.update({
            is_active:false
        })

        return res.status(200).json({
            success:true,
            message:'Customer deleted successfully'
        })
    }
    catch(error){
        console.log("Error in deleteCustomer",error);
        return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

export const addLoyaltyPoints = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {points } = req.body;

        if(!points || points <= 0){
            return res.status(400).json({
                success:false,
                message:'Invalid Points'
            })
        }

        const customer = await Customer.findOne({
            where:{id,tenant_id,is_active:true}
        })

        if(!customer){
            return res.status(404).json({
                success:false,
                message:'Customer not found'
            })
        }

        const new_points = customer.loyalty_points + parseInt(points);
        await customer.update({loyalty_points:new_points})


        return res.status(200).json({
            success:true,
            message:'Loyalty points added successfully',
            data:{customer_name:customer.name,points:points,total_points:new_points}
        })
    }
    catch(error){
        console.log("addLoyaltyPoints failed",error);
        return res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
    }
}

export const redeemLoyaltyPoints = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {points} = req.body;

        if(!points || points <= 0){
            return res.status(400).json({
                success:false,
                message:'Invalid points'
            })
        }

        const customer = await Customer.findOne({where:{id,tenant_id,is_active:true}});

        if(!customer){
            return res.status(404).json({
                success:false,
                message:'Customer not found'
            })
        }

        if(customer.loyalty_points < points){
            return res.status(400).json({
                success:false,
                message:`Insufficient points only ${customer.loyalty_points} available` 
            })
        }

        const newPoints = customer.loyalty_points - points;
        await customer.update({loyalty_points:newPoints});

        return res.status(200).json({
            success:true,
            message:`${points} Points redeemed successfully`,
            data: { customer_name: customer.name, points_redeemed: points, remaining_points: newPoints }

        })


    }
    catch(error){
        console.log("redeemLoyaltyPoints Error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getTodaySpecialDates = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const today     = new Date();
    const month     = String(today.getMonth() + 1).padStart(2, '0');
    const day       = String(today.getDate()).padStart(2, '0');
    const mmdd      = `${month}-${day}`;

    const customers = await Customer.findAll({
      where: { tenant_id, is_active: true }
    });

    const birthdays     = customers.filter(c => c.birthday    && c.birthday.slice(5)    === mmdd);
    const anniversaries = customers.filter(c => c.anniversary && c.anniversary.slice(5) === mmdd);

    return res.status(200).json({
      success: true,
      data: { birthdays, anniversaries }
    });
  } catch (error) {
    console.error('getTodaySpecialDates failed:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};