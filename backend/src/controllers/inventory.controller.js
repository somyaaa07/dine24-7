// import { InventoryItem, StockTransaction, AuditLog, sequelize } from "../models/index.js";
// import { Op } from "sequelize";

// export const getAllItem = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { category, low_stock } = req.query;

//         const where = { tenant_id, is_active: true };

//         if (category) where.category = category;

//         // FIX: low_stock string comparison
//         if (low_stock === 'true') {
//             where[Op.and] = [{
//                 current_quantity: { [Op.lte]: sequelize.col('minimum_threshold') }
//             }];
//         }

//         const items = await InventoryItem.findAll({
//             where,
//             order: [['name', 'ASC']]
//         });

//         // FIX 9: minimum_threshold spelling fix
//         const itemsWithFlag = items.map(item => ({
//             ...item.toJSON(),
//             is_low_stock: parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold)
//         }));

//         return res.status(200).json({ success: true, data: itemsWithFlag });

//     } catch (error) {
//         console.log("failed to get all items", error);
//         return res.status(500).json({ success: false, message: "server error" });
//     }
// };

// export const getItemById = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id } = req.params;

//         const item = await InventoryItem.findOne({
//             where: { id, tenant_id, is_active: true }
//         });

//         if (!item) {
//             return res.status(404).json({ success: false, message: "Item not found" });
//         }

//         // FIX 2: item.StockTransaction.findAll → StockTransaction.findAll
//         const transactions = await StockTransaction.findAll({
//             where: { inventory_item_id: id, tenant_id },
//             order: [['createdAt', 'DESC']],
//             limit: 20
//         });

//         return res.status(200).json({
//             success: true,
//             data: {
//                 ...item.toJSON(),
//                 is_low_stock: parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold),
//                 transactions
//             }
//         });

//     } catch (error) {
//         console.log("getItemById Failed", error);
//         return res.status(500).json({ success: false, message: "server error" });
//     }
// };

// export const createItem = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { name, category, unit, minimum_threshold, current_quantity, purchase_price } = req.body;

//         // FIX 1: !name || name.trim() → !name || !name.trim()
//         if (!name || !name.trim()) {
//             return res.status(400).json({ success: false, message: "name is required" });
//         }

//         if (!unit) {
//             return res.status(400).json({ success: false, message: "unit is required" });
//         }

//         const existing = await InventoryItem.findOne({
//             where: { tenant_id, name: name.trim(), is_active: true }
//         });

//         if (existing) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Item "${name}" already exists`
//             });
//         }

//         const item = await InventoryItem.create({
//             tenant_id,
//             name:               name.trim(),
//             category:           category          || null,
//             unit,
//             minimum_threshold:  minimum_threshold || 0,
//             current_quantity:   current_quantity  || 0,
//             purchase_price:     purchase_price    || 0,
//         });

//         if (current_quantity && current_quantity > 0) {
//             await StockTransaction.create({
//                 tenant_id,
//                 inventory_item_id: item.id,
//                 type:              'stock_in',
//                 quantity:          current_quantity,
//                 note:              'Initial Stock',
//                 performed_by:      req.user.user_id
//             });
//         }

//         await AuditLog.create({
//             tenant_id,
//             user_id:    req.user.user_id,
//             action:     'INVENTORY_ITEM_CREATED',
//             ip_address: req.ip,
//             details:    { item_name: name, unit }
//         });

//         return res.status(201).json({
//             success: true,
//             message: 'Item created successfully',
//             data: item
//         });

//     } catch (error) {
//         console.log("createItem failed", error);
//         return res.status(500).json({ success: false, message: 'Server Error' });
//     }
// };

// export const updateItem = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         // FIX 3: req.params.id destructuring galat tha
//         const { id } = req.params;

//         const { name, category, unit, minimum_threshold, purchase_price } = req.body;

//         const item = await InventoryItem.findOne({
//             where: { id, tenant_id, is_active: true }
//         });

//         if (!item) {
//             return res.status(404).json({ success: false, message: 'Item not found' });
//         }

//         await item.update({
//             ...(name               !== undefined && { name }),
//             ...(category           !== undefined && { category }),
//             ...(unit               !== undefined && { unit }),
//             ...(minimum_threshold  !== undefined && { minimum_threshold }),
//             ...(purchase_price     !== undefined && { purchase_price })
//         });

//         return res.status(200).json({
//             success: true,
//             message: 'Item updated successfully',
//             data: item
//         });

//     } catch (error) {
//         console.log("Error updating item", error);
//         return res.status(500).json({ success: false, message: "server error" });
//     }
// };

// export const deleteItem = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id }    = req.params;

//         const item = await InventoryItem.findOne({
//             where: { id, tenant_id, is_active: true }
//         });

//         if (!item) {
//             return res.status(404).json({ success: false, message: "Item not found" });
//         }

//         await item.update({ is_active: false });

//         return res.status(200).json({ success: true, message: 'Item deleted successfully' });

//     } catch (error) {
//         console.log("Error deleting item", error);
//         return res.status(500).json({ success: false, message: "server error" });
//     }
// };

// export const stockIn = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id }    = req.params;
//         const { quantity, note } = req.body;

//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({ success: false, message: "Invalid quantity" });
//         }

//         const item = await InventoryItem.findOne({
//             where: { id, tenant_id, is_active: true }
//         });

//         if (!item) {
//             return res.status(404).json({ success: false, message: "Item not found" });
//         }

//         const newQuantity = parseFloat(item.current_quantity) + parseFloat(quantity);
//         await item.update({ current_quantity: newQuantity });

//         await StockTransaction.create({
//             tenant_id,
//             inventory_item_id: item.id,
//             type:              'stock_in',
//             quantity:          parseFloat(quantity),
//             note:              note || null,
//             performed_by:      req.user.user_id
//         });

//         return res.status(200).json({
//             success: true,
//             message: `${quantity} ${item.unit} stock in hua`,
//             data: {
//                 item_name:         item.name,
//                 previous_quantity: parseFloat(item.current_quantity) - parseFloat(quantity),
//                 added:             parseFloat(quantity),
//                 new_quantity:      newQuantity,
//                 unit:              item.unit
//             }
//         });

//     } catch (error) {
//         console.log("error in stockIn", error);
//         return res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

// export const stockOut = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id }    = req.params;
//         const { quantity, note } = req.body;

//         if (!quantity || quantity <= 0) {
//             return res.status(400).json({ success: false, message: "Invalid quantity" });
//         }

//         const item = await InventoryItem.findOne({
//             where: { id, tenant_id, is_active: true }
//         });

//         if (!item) {
//             return res.status(404).json({ success: false, message: "Item not found" });
//         }

//         if (parseFloat(item.current_quantity) < parseFloat(quantity)) {
//             return res.status(400).json({ success: false, message: "Not enough stock" });
//         }

//         const newQuantity = parseFloat(item.current_quantity) - parseFloat(quantity);
//         await item.update({ current_quantity: newQuantity });

//         await StockTransaction.create({
//             tenant_id,
//             inventory_item_id: item.id,
//             type:              'stock_out',
//             quantity:          parseFloat(quantity),
//             note:              note || null,
//             // FIX 5: req.user.id → req.user.user_id
//             performed_by:      req.user.user_id
//         });

//         // FIX 4: const missing tha
//         const isLowStock = newQuantity <= parseFloat(item.minimum_threshold);

//         return res.status(200).json({
//             success: true,
//             message: `${quantity} ${item.unit} stock out hua`,
//             data: {
//                 item_name:    item.name,
//                 new_quantity: newQuantity,
//                 unit:         item.unit,
//                 is_low_stock: isLowStock
//             }
//         });

//     } catch (error) {
//         console.log("stockOut failed", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// export const stockAdjustment = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;
//         const { id }    = req.params;
//         const { new_quantity, note } = req.body;

//         if (new_quantity === undefined || new_quantity < 0) {
//             return res.status(400).json({ success: false, message: "Invalid new quantity" });
//         }

//         const item = await InventoryItem.findOne({
//             where: { id, tenant_id, is_active: true }
//         });

//         if (!item) {
//             return res.status(404).json({ success: false, message: "Item not found" });
//         }

//         const oldQuantity      = parseFloat(item.current_quantity);
//         const differenceQty    = parseFloat(new_quantity) - oldQuantity;

//         await item.update({ current_quantity: new_quantity });

//         await StockTransaction.create({
//             tenant_id,
//             inventory_item_id: item.id,
//             type:              'adjustment',
//             // FIX 6: Math.abc → Math.abs
//             quantity:          Math.abs(differenceQty),
//             note:              note || `Adjustment: ${oldQuantity} → ${new_quantity}`,
//             // FIX 7: performed_by_by → performed_by
//             // FIX 8: req.user.id → req.user.user_id
//             performed_by:      req.user.user_id
//         });

//         await AuditLog.create({
//             tenant_id,
//             user_id:    req.user.user_id,
//             action:     'STOCK_ADJUSTED',
//             ip_address: req.ip,
//             details:    { item_name: item.name, from: oldQuantity, to: new_quantity }
//         });

//         return res.status(200).json({
//             success: true,
//             message: `Stock adjusted: ${oldQuantity} → ${new_quantity} ${item.unit}`,
//             data: item
//         });

//     } catch (error) {
//         console.log("stock adjustment failed", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// export const getLowStockItems = async (req, res) => {
//     try {
//         const tenant_id = req.user.tenant_id;

//         const items = await InventoryItem.findAll({
//             where: { tenant_id, is_active: true }
//         });

//         const lowStockItems = items
//             .filter(item => parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold))
//             .map(item => ({
//                 id:                item.id,
//                 name:              item.name,
//                 current_quantity:  item.current_quantity,
//                 minimum_threshold: item.minimum_threshold,
//                 unit:              item.unit,
//             }));

//         return res.status(200).json({ success: true, data: lowStockItems });

//     } catch (error) {
//         console.log("failed to get low stock items", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };
import { InventoryItem, StockTransaction, AuditLog, sequelize } from "../models/index.js";
import { Op } from "sequelize";

export const getAllItem = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { category, low_stock, branch_id } = req.query;

        const where = { tenant_id, is_active: true };
        const andConditions = [];

        if (category) where.category = category;

        // Branch-scoped items only show for their branch; items with no
        // branch_id are shared stock visible to every branch.
        if (branch_id) {
            andConditions.push({ [Op.or]: [{ branch_id }, { branch_id: null }] });
        }

        // FIX: low_stock string comparison
        if (low_stock === 'true') {
            andConditions.push({
                current_quantity: { [Op.lte]: sequelize.col('minimum_threshold') }
            });
        }

        if (andConditions.length > 0) {
            where[Op.and] = andConditions;
        }

        const items = await InventoryItem.findAll({
            where,
            order: [['name', 'ASC']]
        });

        // FIX 9: minimum_threshold spelling fix
        const itemsWithFlag = items.map(item => ({
            ...item.toJSON(),
            is_low_stock: parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold)
        }));

        return res.status(200).json({ success: true, data: itemsWithFlag });

    } catch (error) {
        console.log("failed to get all items", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
};

export const getItemById = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const item = await InventoryItem.findOne({
            where: { id, tenant_id, is_active: true }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        // FIX 2: item.StockTransaction.findAll → StockTransaction.findAll
        const transactions = await StockTransaction.findAll({
            where: { inventory_item_id: id, tenant_id },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        return res.status(200).json({
            success: true,
            data: {
                ...item.toJSON(),
                is_low_stock: parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold),
                transactions
            }
        });

    } catch (error) {
        console.log("getItemById Failed", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
};

export const createItem = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { name, category, unit, minimum_threshold, current_quantity, purchase_price, branch_id } = req.body;

        // FIX 1: !name || name.trim() → !name || !name.trim()
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "name is required" });
        }

        if (!unit) {
            return res.status(400).json({ success: false, message: "unit is required" });
        }

        const existing = await InventoryItem.findOne({
            where: { tenant_id, name: name.trim(), is_active: true }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Item "${name}" already exists`
            });
        }

        const item = await InventoryItem.create({
            tenant_id,
            branch_id:          branch_id || null,
            name:               name.trim(),
            category:           category          || null,
            unit,
            minimum_threshold:  minimum_threshold || 0,
            current_quantity:   current_quantity  || 0,
            purchase_price:     purchase_price    || 0,
        });

        if (current_quantity && current_quantity > 0) {
            await StockTransaction.create({
                tenant_id,
                inventory_item_id: item.id,
                type:              'stock_in',
                quantity:          current_quantity,
                note:              'Initial Stock',
                performed_by:      req.user.user_id
            });
        }

        await AuditLog.create({
            tenant_id,
            user_id:    req.user.user_id,
            action:     'INVENTORY_ITEM_CREATED',
            ip_address: req.ip,
            details:    { item_name: name, unit }
        });

        return res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: item
        });

    } catch (error) {
        console.log("createItem failed", error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateItem = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        // FIX 3: req.params.id destructuring galat tha
        const { id } = req.params;

        const { name, category, unit, minimum_threshold, purchase_price, branch_id } = req.body;

        const item = await InventoryItem.findOne({
            where: { id, tenant_id, is_active: true }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        await item.update({
            ...(name               !== undefined && { name }),
            ...(category           !== undefined && { category }),
            ...(unit               !== undefined && { unit }),
            ...(minimum_threshold  !== undefined && { minimum_threshold }),
            ...(purchase_price     !== undefined && { purchase_price }),
            ...(branch_id          !== undefined && { branch_id: branch_id || null })
        });

        return res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            data: item
        });

    } catch (error) {
        console.log("Error updating item", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id }    = req.params;

        const item = await InventoryItem.findOne({
            where: { id, tenant_id, is_active: true }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        await item.update({ is_active: false });

        return res.status(200).json({ success: true, message: 'Item deleted successfully' });

    } catch (error) {
        console.log("Error deleting item", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
};

export const stockIn = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id }    = req.params;
        const { quantity, note } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        const item = await InventoryItem.findOne({
            where: { id, tenant_id, is_active: true }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        const newQuantity = parseFloat(item.current_quantity) + parseFloat(quantity);
        await item.update({ current_quantity: newQuantity });

        await StockTransaction.create({
            tenant_id,
            inventory_item_id: item.id,
            type:              'stock_in',
            quantity:          parseFloat(quantity),
            note:              note || null,
            performed_by:      req.user.user_id
        });

        return res.status(200).json({
            success: true,
            message: `${quantity} ${item.unit} stock in hua`,
            data: {
                item_name:         item.name,
                previous_quantity: parseFloat(item.current_quantity) - parseFloat(quantity),
                added:             parseFloat(quantity),
                new_quantity:      newQuantity,
                unit:              item.unit
            }
        });

    } catch (error) {
        console.log("error in stockIn", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const stockOut = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id }    = req.params;
        const { quantity, note } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        const item = await InventoryItem.findOne({
            where: { id, tenant_id, is_active: true }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (parseFloat(item.current_quantity) < parseFloat(quantity)) {
            return res.status(400).json({ success: false, message: "Not enough stock" });
        }

        const newQuantity = parseFloat(item.current_quantity) - parseFloat(quantity);
        await item.update({ current_quantity: newQuantity });

        await StockTransaction.create({
            tenant_id,
            inventory_item_id: item.id,
            type:              'stock_out',
            quantity:          parseFloat(quantity),
            note:              note || null,
            // FIX 5: req.user.id → req.user.user_id
            performed_by:      req.user.user_id
        });

        // FIX 4: const missing tha
        const isLowStock = newQuantity <= parseFloat(item.minimum_threshold);

        return res.status(200).json({
            success: true,
            message: `${quantity} ${item.unit} stock out hua`,
            data: {
                item_name:    item.name,
                new_quantity: newQuantity,
                unit:         item.unit,
                is_low_stock: isLowStock
            }
        });

    } catch (error) {
        console.log("stockOut failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const stockAdjustment = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id }    = req.params;
        const { new_quantity, note } = req.body;

        if (new_quantity === undefined || new_quantity < 0) {
            return res.status(400).json({ success: false, message: "Invalid new quantity" });
        }

        const item = await InventoryItem.findOne({
            where: { id, tenant_id, is_active: true }
        });

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        const oldQuantity      = parseFloat(item.current_quantity);
        const differenceQty    = parseFloat(new_quantity) - oldQuantity;

        await item.update({ current_quantity: new_quantity });

        await StockTransaction.create({
            tenant_id,
            inventory_item_id: item.id,
            type:              'adjustment',
            // FIX 6: Math.abc → Math.abs
            quantity:          Math.abs(differenceQty),
            note:              note || `Adjustment: ${oldQuantity} → ${new_quantity}`,
            // FIX 7: performed_by_by → performed_by
            // FIX 8: req.user.id → req.user.user_id
            performed_by:      req.user.user_id
        });

        await AuditLog.create({
            tenant_id,
            user_id:    req.user.user_id,
            action:     'STOCK_ADJUSTED',
            ip_address: req.ip,
            details:    { item_name: item.name, from: oldQuantity, to: new_quantity }
        });

        return res.status(200).json({
            success: true,
            message: `Stock adjusted: ${oldQuantity} → ${new_quantity} ${item.unit}`,
            data: item
        });

    } catch (error) {
        console.log("stock adjustment failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getLowStockItems = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { branch_id } = req.query;

        const where = { tenant_id, is_active: true };
        if (branch_id) {
            where[Op.or] = [{ branch_id }, { branch_id: null }];
        }

        const items = await InventoryItem.findAll({ where });

        const lowStockItems = items
            .filter(item => parseFloat(item.current_quantity) <= parseFloat(item.minimum_threshold))
            .map(item => ({
                id:                item.id,
                name:              item.name,
                current_quantity:  item.current_quantity,
                minimum_threshold: item.minimum_threshold,
                unit:              item.unit,
            }));

        return res.status(200).json({ success: true, data: lowStockItems });

    } catch (error) {
        console.log("failed to get low stock items", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};