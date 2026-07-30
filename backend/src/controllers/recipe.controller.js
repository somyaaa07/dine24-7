import { Recipe, RecipeIngredients, MenuItem, InventoryItem, AuditLog, sequelize, StockTransaction } from "../models/index.js";

export const getAllReceips = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const recipes = await Recipe.findAll({
            where: {
                tenant_id,
                is_active: true
            },
            include: [{
                model: MenuItem,
                attributes: ['id', 'name', 'price']
            },
            {
                model: RecipeIngredients,
                include: [{
                    model: InventoryItem,
                    attributes: ['id', 'name', 'unit', 'current_quantity']
                }]

            }],
        })

        if (!recipes) {
            return res.status(404).json({
                success: false, message: "No recipes found"
            })
        }

        return res.status(200).json({
            success: true,
            data: recipes
        })
    }
    catch (error) {
        console.log("getAllReceips", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// get one single 

export const getRecipeById = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const recipe = await Recipe.findOne({
            where: {
                tenant_id,
                id,
                is_active: true
            },
            include: [{
                model: MenuItem,
                attributes: ['id', 'name', 'price']
            },
            {
                model: RecipeIngredients,
                include: [{
                    model: InventoryItem,
                    attributes: ['id', 'name', 'unit', 'current_quantity']
                }]
            }]
        });

        if (!recipe) {
            return res.status(404).json({
                success: false, message: "No recipe found"
            })
        }

        return res.status(200).json({
            success: true,
            data: recipe
        })
    }
    catch (error) {
        console.log("getOneRecipe", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getRecipeByMenuItem = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { menu_item_id } = req.params;

        const recipe = await Recipe.findOne({
            where: {
                tenant_id, menu_item_id, is_active: true
            },
            include: [{
                model: RecipeIngredients,
                include: [{
                    model: InventoryItem,
                    attributes: ['id', 'name', 'unit', 'current_quantity']
                }]
            }]

        })

        if (!recipe) {
            return res.status(404).json({
                success: false, message: "No recipe found"
            })
        }

        return res.status(200).json({
            success: true,
            data: recipe
        })
    }
    catch (error) {
        console.log("getRecipeByMenuItem failed", error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const createRecipe = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const tenant_id = req.user.tenant_id;
        const { menu_item_id, name, serving_size, preparation_time, ingredients } = req.body;

        if (!menu_item_id) {
            return res.status(400).json({
                success: false,
                message: "menu_item_id is required"
            })
        }

        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "name is required"
            })
        }

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                message: "ingredients is required"
            })
        }

        const menuItem = await MenuItem.findOne({
            where:{
            id: menu_item_id, tenant_id, is_active: true}
        })

        if (!menuItem) {
            return res.status(400).json({
                success: false,
                message: "menu_item_id is invalid"
            })
        }

        const existingRecipe = await Recipe.findOne({
            menu_item_id, tenant_id, is_active: true
        })

        if (existingRecipe) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "Recipe already exists"
            })
        }

        const recipe = await Recipe.create({
            tenant_id,
            menu_item_id,
            name: name.trim(),
            serving_size: serving_size || 1,
            preparation_time: preparation_time || 15
        }, {transaction})

  
      for (const ing of ingredients) {
    if (!ing.inventory_item_id || !ing.quantity) {
        continue;
    }

    const invItem = await InventoryItem.findOne({
        where: {
            id: ing.inventory_item_id,
            tenant_id,
            is_active: true
        }
    });

    if (!invItem) {
        continue;
    }

    await RecipeIngredients.create({
        tenant_id,
        recipe_id: recipe.id,
        inventory_item_id: ing.inventory_item_id,
        quantity: ing.quantity,
        unit: invItem.unit
    }, { transaction });
}

        await AuditLog.create({
            tenant_id,
            user_id: req.user.user_id,
            action: "RECEIPE_CREATED",
            ip_address: req.ip,
            details: { recipe_name: name, menu_item: menuItem.name }
        })

        await transaction.commit();

        const fullRecipe = await Recipe.findOne({
            where: {
                id: recipe.id
            },
            include: [{
                model: MenuItem,
                attributes: ['id', 'name']
            }, {
                model: RecipeIngredients,
                include: [{
                    model: InventoryItem,
                    attributes: ['id', 'name', 'unit']
                }]
            }]
        })

        return res.status(200).json({
            success: true,
            message: `${name} recipe created`,
            data: fullRecipe
        });
    }
    catch (error) {
        await transaction.rollback();
        console.log("failed to createRecipe", error);
        return res.status(500).json({
            success: false,
            message: "failed to create recipe"
        })

    }
}

export const updateRecipe = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const {
            name,
            serving_size,
            preparation_time,
            ingredients
        } = req.body;

        const recipe = await Recipe.findOne({
            where: {
                id,
                tenant_id,
                is_active: true
            }
        })

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "recipe not found"
            })
        }

        await recipe.update({
            ...(name !== undefined && { name }),
            ...(serving_size !== undefined && { serving_size }),
            ...(preparation_time !== undefined && { preparation_time })
        }, { transaction })

        if (ingredients && ingredients.length > 0) {
            await RecipeIngredients.destroy({
                where: {
                    recipe_id: id
                },
                transaction
            })
        }

        for(const ing of ingredients){
            if(!ing.inventory_item_id || !ing.quantity)
                continue
        

        const invItem = await InventoryItem.findOne({
            where:{
                id:ing.inventory_item_id,
                tenant_id,
                is_active:true
            }
        })

        if(!invItem){
            return res.status(404).json({
                success:false,
                message:"Inventory item not found"
            })
        }

        await RecipeIngredients.create({
            tenant_id,
            recipe_id:recipe.id,
            inventory_item_id:ing.inventory_item_id,
            quantity:ing.quantity,
            unit:ing.unit
        },{transaction})

        transaction.commit()
    }
    const updatedRecipe = await Recipe.findOne({
        where:{id:recipe.id},
        include:[
            {model:MenuItem,attributes:['id','name']},
            {
                model:RecipeIngredients,
                include:[{model:InventoryItem,attributes:['id','name','unit']}]
            }
        ]
    })

    return res.status(200).json({
        success:true,
        message:"Recipe created successfully",
        data:updatedRecipe
    })
    }
    catch(error){
        await transaction.rollback()
        console.log("Error in creating recipe",error)
        return res.status(500).json({
            success:false,
            message:"Error in creating recipe",
            data:error
        })
    }
}

export const deleteRecipe = async (req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const recipe = await Recipe.findOne({
            where:{tenant_id,id,is_active:true}
        })

        if(!recipe){
            return res.status(404).json({ success:false , message:"Recipe not found"})
        }

        await recipe.update({is_active:false})

        return res.status(200).json({ success:true , message:"Recipe deleted successfully"})
    }
    catch(error){
        console.log("Error in deleting recipe",error)
        return res.status(500).json({success:false , message :"Error in deleting recipe"})
    }
}


// checking availablitiy if we have the enough ingredients to make the recipe

export const checkAvailability = async(req,res)=>{
    try{
   const tenant_id = req.user.tenant_id;
   const {menu_item_id} = req.params;
   const quantity = parseInt(req.query.quantity) || 1 ;

   const recipe = await Recipe.findOne({
    where:{
        tenant_id,
        menu_item_id,
        is_active:true
    },
    include:[{
        model:RecipeIngredients,
        include:[{model:InventoryItem}]
    }]

   })

   if(!recipe){
    return res.status(404).json({ success:false,message:"Recipe not found"})
   }

   const missing = []

   for(const ing of recipe.RecipeIngredients){
    const required = parseFloat(ing.quantity)*quantity;
    const available = parseFloat(ing.InventoryItem.quantity);

    if(available<required){
        missing.push({
            item_name:ing.InventoryItem.name,
            required,
            available,
            shortage:required-available,
            unit:ing.unit
        })
    }
   }

   res.status(200).json({success:true,data:{
    available:missing.length===0,
    missing
   }})
    }

    catch(error){
        console.log("checkAvailability Error",error)
        res.status(500).json({
            success:false,
            message:"Internal Server error"
        })
    }
}

//stock deduction 

export const consumeIngredients = async (menu_item_id, tenant_id , quantity=1 , user_id , transaction)=>{
    try{
        const recipe = await Recipe.findOne({
            where:{
                tenant_id,
                menu_item_id,
                is_active:true
            },
            include:[{
                model:RecipeIngredients,
                include:[{
                    model:InventoryItem
                }]
            }],
        })

        if(!recipe) return ;

        for(const ing of recipe.RecipeIngredients){
            const toConsume = parseFloat(ing.quantity)*quantity;
            const invItem = ing.InventoryItem;

            const newQty = Math.max(0,parseFloat((invItem.current_quantity)-toConsume));

            await InventoryItem.update({
                current_quantity:newQty ,
                                where: { id: invItem.id }

            },
        {transaction})

        await StockTransaction.create({
            tenant_id,
            inventory_item_id:invItem.id,
            type: 'stock_out',
            quantity:toConsume,
            note:`Order:${menu_item_id}`,
            performed_by:user_id
        })
        }
    }

    catch(error){
        console.log("Error in consuming ingredients",error);
       throw error;
    }
    
}