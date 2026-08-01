import {
    MenuCategory,
    MenuItem,
    MenuVariant,
    AuditLog
} from '../models/index.js';

export const getAllCategories = async (req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;

        const menu = await MenuCategory.findAll({
            where:{tenant_id,is_active:true},
            order:[['sort_order','ASC']],
            include:[{
                model:MenuItem,
                where:{tenant_id,is_active:true,is_available:true},
                required:false,
                order:[['sort_order','ASC']],
                include:[{
                    model:MenuVariant,
                    where:{is_active:true},
                    required:false
                }]
            }]
        });

        return res.status(200).json({
            success:true,
            data:menu
        })
    }
    catch(error){
        console.log("getting all categories failed",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const createCategory = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {name,description,sort_order}=req.body;

        if(!name || name.trim() === ''){
            return res.status(400).json({
                success:false,
                message:'Catgory name is necessary'
            });
        }

        const existing = await MenuCategory.findOne({
            where:{
                tenant_id,
                name:name.trim(),
                is_active:true
            }
        });

        if(existing){
            return res.status(400).json({
                success:false,
                message:`"${name}" category already exists`
            })
        }

        const category = await MenuCategory.create({
            tenant_id,
            name:name.trim(),
            description:description||null,
            sort_order:sort_order||0
        });

        return res.status(200).json({
            success:true,
            message:'Category created successfully',
            data:category
        })
    }
    catch(error){
        console.log("Error in creating category",error);
        return res.status(500).json({
            success:false,
            message:'server error'
        })
    }
}

export const updateCategory = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {name,description,sort_order,is_active}=req.body;

        const category = await MenuCategory.findOne({
            where:{
                id,
                tenant_id
            }
        })

        if(!category){
            return res.status(404).json({
                success:false,
                message:'Category not found'
            })
        }

        await category.update({
            ...(name  !== undefined && { name }),
            ...(description !== undefined && { description}),
            ...(sort_order !== undefined && {sort_order}),
            ...(is_active !== undefined && {is_active})
        });

        return res.status(200).json({
            success:true,
            message:'category updated successfully',
            data:category
        })
    }
    catch(error){
        console.log("Error in updating category",error);
        return res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

export const deleteCategory = async(req,res)=>
{
     try {
        const tenant_id = req.user.tenant_id;
        const {id} = req.params

        const category = await MenuCategory.findOne({
            where:{
                id,
                tenant_id,
                is_active:true
            }
        })

        if(!category){
            return res.status(404).json({
                success:false,
                message:'Category not found'
            })
        }

        const itemCount = await MenuItem.count({
            where:{
                category_id:id,
                is_active:true
            }
        })

        if(itemCount > 0){
            return res.status(400).json({
                success:false,
                message:`In this category the item is count is ${itemCount} - firstly remove it or delete it `
            })
        }

        await category.update({is_active:false});

        return res.status(200).json({
            success:true,
            message:'Category is deleted now'
        })
    }
      catch(error){
        console.log("deletion in category failed",error)
        return res.status(500).json({
            success:false,
            message:"internal server error"
        })
    }
 
};


export const getAllItem = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const category_id = req.query.category_id;

        const where = {tenant_id,is_active:true};
        if(category_id)
        {
            where.category_id=category_id
        }

        const items = await MenuItem.findAll({
            where,
            order:[[
                'sort_order','ASC'
            ],
        [
            'name','ASC'
        ]],
        include:[
            {
                model:MenuCategory,
                attributes:['id','name']
            },
            {
                model:MenuVariant,
                where:{is_active:true},
                required:false
            }
        ]
        });

        return res.status(200).json({
            success:true,
            data:items
        })   

    }

    catch(error){
        console.log("getAllItems Failed",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}

export const getItemById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        
        const item = await MenuItem.findOne({
            where :{
                id,
                tenant_id,
                is_active:true
            },
            include:[
                {
                    model:MenuCategory,
                    attributes:['id','name']
                },
                {
                    model:MenuVariant,
                    where:{
                        is_active:true
                    },
                    required:false
                }
            ]
        });

        if(!item){
            return res.status(404).json({
                success:false,
                message:"Did'nt find the Item"
            })
        }

        return res.status(200).json({
            success:true,
            data:item
        })
    }
    catch(error){
        console.log('getItemById failed',error)
        return res.status(500).json({
            success:false,
            message:'server error'
        })
    }
}

export const createItem = async(req,res)=>{
    try{
    const tenant_id = req.user.tenant_id;

    const {
        category_id,
        name,
        description,
        price,
        food_type,
        preparation_time,
        calories,
        sort_order,
        variants
    } = req.body;

    if(!name || name.trim() === '') {
        return res.status(400).json({
            success:false,
            message:"name is required"
        })
    }

    if(!category_id){
        return res.status(400).json({
            success:false,
            message:"select category"
        })
    }

    if(!price || price < 0){
        return res.status(400).json({
            success:false,
            message:"price must be valid"
        })
    }

    const category = await MenuCategory.findOne({
        where:{
            id:category_id,
            tenant_id,
            is_active:true
        }
    });

    if(!category){
        return res.status(404).json({
            success:false,
            message:"Did'nt find the category"
        })
    }

    const item = await MenuItem.create({
        tenant_id,
        category_id,
        name: name.trim(),
        description: description || null,
        price,
        food_type: food_type || 'veg',
        preparation_time:preparation_time || 15,
        calories:calories || null,
        sort_order:sort_order || 0,
        is_available:true
    })

    if(variants && variants.length > 0){
        const variantData = variants.map((v,index)=>({
            tenant_id,
            menu_item_id:item.id,
            name:v.name,
            price:v.price,
            is_default:  index === 0
        }));

        await MenuVariant.bulkCreate(variantData);
    }

    const itemWithVariants = await MenuItem.findOne({
        where:{id:item.id},
        include:[
            {model:MenuCategory, attributes:['id','name']},
            {model:MenuVariant , required:false}
        ]
    })

    await AuditLog.create({
        tenant_id,
        user_id:req.user.user_id,
        action:'MENU_ITEM_CREATED',
        ip_address:req.ip,
        details:{item_name:name,category_id}
    });

    return res.status(201).json({
        success:true,
        message:`"${name}" added in the menu`,
        data: itemWithVariants
    });
}
catch(error){
    console.log('Create Menu Item failed', error)
    return res.status(500).json({
        success:false,
        message:'Internal Server Error'
    })
}
};

export const updateItem = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const {
            name , description, price , category_id,food_type,preparation_time,is_available,calories,sort_order
        } = req.body

        const item = await MenuItem.findOne({
            where:{
                id,
                tenant_id,
                is_active:true
            }
        })

        if(!item){
            return res.status(400).json({
                success:false,
                message:"did'nt find the item"
            })
        }

        await item.update({
            ...(name !== undefined && {name}),
            ...(description !== undefined && {description}),
            ...(price !== undefined && {price}),
            ...(food_type !== undefined && {food_type}),
            ...(preparation_time !== undefined && {preparation_time}),
            ...(is_available !== undefined && {is_available}),
            ...(calories !== undefined && {calories}),
            ...(sort_order !== undefined && {sort_order})
        })

        return res.status(200).json({
            success:true,
            message:'Items are updated',
            data:item
        });
    }
    catch(error){
        console.log("updating menu item failed",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}

export const toggleActivity = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const item = await MenuItem.findOne({
            where:{
                id,
                tenant_id,
                is_active:true
            }
        })
        
        if(!item){
            return res.status(400).json({
                success:false,
                message:"unable to find items"
            })
        }

        await item.update({
            is_available: !item.is_available

        })

      return res.status(200).json({
        success:true,
        message:`"${item.name}" now ${item.is_available ? 'available' : 'unavailable'}`,
        data:{id:item.id,
            is_available:item.is_available
        }
      });
    }
    catch(error){
        console.log("toggleActivity Failed",error)
        return res.status(500).json({
            success:false,
            message:'Internal Server'
        })
    }
}

export const deleteItem = async(req,res)=>{
    try{
        const tenant_id=req.user.tenant_id;
        const {id}=req.params;

        const item = await MenuItem.findOne({
            where:{
                id,
                tenant_id,
                is_active:true
            }
        })

        if(!item){
            return res.status(400).json({
                success:false,
                message:"did'nt find the item"
            })
        }

        await item.update({
            is_active:false
        })

        await MenuVariant.update({
            is_active:false
        },{
            where:{menu_item_id:id}
        })

        return res.status(200).json({
            success:true,
            message:`"${item.name}" is deleted`
        })
    }

    catch(error){
        console.log("deleted item failed",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const addVariants = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {item_id} = req.params;
        const {name,price,is_default}= req.body;

        if(!name || !price){
            return res.status(400).json({
                success:false,
                message:'variant name and price is required'
            })
        }

        const item = await MenuItem.findOne({
            where:{
                id:item_id,
                tenant_id,
                is_active:true
            }
        });

        if(!item){
            return res.status(400).json({
                success:false,
                message:"did'nt find the item"
            })
        }

        if(is_default){
            await MenuVariant.update(
                {is_default:false},
                {where:{menu_item_id:item_id}}
            )
        }

        const variant = await MenuVariant.create({
            tenant_id,
            menu_item_id:item_id,
            name,
            price,
            is_default:is_default || false
        })

        return res.status(200).json({
            success:true,
            message:'Variant added already',
            data:variant
        })
    }
    catch(error){
        console.log("add variant failed",error)
        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}

export const deleteVarient = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id}=req.params

        const variant = await MenuVariant.findOne({
            where:{
                id,
                tenant_id,
                is_active:true
            }
        })

        if(!variant){
            return res.status(400).json({
                success:false,
                message:"Did'nt find the variant"
            })
        }

        await variant.update({
            is_active:false
        })

        return res.status(200).json({
            success:true,
            message:'Variant deleted'
        })
        }
        catch(error){
            console.log("Variant deleted failed",error)
            return res.status(500).json({
                success:false,
                message:'Server Error'
            })
        }
}


// full menu - For POS and QR 

// full menu - For POS and QR

export const getFullMenu = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const menu = await MenuCategory.findAll({
            where: {
                tenant_id,
                is_active: true
            },
            order: [['sort_order', 'ASC']],
            include: [{
                model: MenuItem,
                where: {
                    tenant_id,
                    is_active: true,
                    is_available: true
                },
                required: false,
                order: [['sort_order', 'ASC']],
                include: [{
                    model: MenuVariant,
                    where: { is_active: true },
                    required: false
                }]
            }]
        })

        return res.status(200).json({
            success: true,
            data: menu
        })
    }
    catch (error) {
        console.log("Error in getFullMenu", error)
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}