import { Supplier , AuditLog } from "../models/index.js";
// import { Op } from "sequelize";

export const getAllSuppliers = async(req,res)=>{
    try{
            const tenant_id = req.user.tenant_id;
            const suppliers = await Supplier.findAll({
                where:{
                    tenant_id,
                    is_active:true
                },
                order:[['name','ASC']]
            })

            return res.status(200).json({
                success:true,
                data:suppliers
            })
    }    
    catch(error){
        console.log("get all suppliers error",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getSupplierById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id}=req.params;

        const supplier = await Supplier.findOne({
            where:{
                tenant_id,
                id,
                is_active:true
            }
        })

        if(!supplier){
            return res.status(404).json({
                success:false,
                message:"Supplier not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:supplier
        })
    }
    catch(error){
        console.log("get supplier by id error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const createSupplier = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {
            name,
            contact_person,
            phone,
            email,
            address,
            payment_terms
        } = req.body;

        if(!name || name.trim() === ""){
            return res.status(404).json({
                success:false,
                message:"Name is required"
            })
        }
        const existing = await Supplier.findOne({
            where:{
                name,tenant_id,is_active:true
            }
        })

        if(existing){
            return res.status(404).json({
                success:false,
                message:"Supplier already exists"
            })
        }

        const supplier = await Supplier.create({
            tenant_id,
            name:name.trim(),
            contact_person : contact_person || null ,
            phone : phone || null,
            email : email || null,
            address : address || null,
            payment_terms : payment_terms || 'immediate'
        })

        await AuditLog.create({
            tenant_id,
            user_id:req.user.user_id,
            action:'CREATE',
            ip_address:req.ip,
            details:{supplier_name:name}
        })

        return res.status(200).json({
            success:true,
            data:supplier
        })
    }
    catch(error){
        console.log("Error in creating supplier",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })

    }

};

export const updateSupplier = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const {name,contact_person,phone,email,address,payment_terms} = req.body;

        const supplier = await Supplier.findOne({
            where:{
                id,tenant_id,is_active:true
            }
        })

        if(!supplier){
            return res.status(404).json({
                success:false,
                message:"Supplier not found"
            })
        }

        await supplier.update({
            ...(name !== undefined && {name}),
            ...(contact_person !== undefined && {contact_person}),
            ...(phone !== undefined && {phone}),
            ...(email !== undefined && {email}),
            ...(address !== undefined && {address}),
            ...(payment_terms !== undefined && {payment_terms})
        })
        return res.status(200).json({
            success:true,
            message:"Supplier updated successfully",
            data:supplier
        })
      
    }
    catch(error){
        console.log("Error in updateSupplier",error);
        return res.status(500).json
        ({
            success:false,
            message:"Internal server error",
        })
    }
}

export const deleteSupplier = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id}=req.params;

        const supplier = await Supplier.findOne({
            id,tenant_id,is_active:true
        })

        if(!supplier){
            return res.status(404).json({
                success:false,
                message:'Supplier not found'
            })
        }

        await supplier.update({
            is_active:false
        })

        return res.status(200).json({
            success:true,
            message:"Supplier deleted successfully"
        })

    }
    catch(error){
        console.log("Error in deleteSupplier",error);
        return res.status(500).json
        ({
            success:false,
            message:"Internal server error",
        })
    }
}

