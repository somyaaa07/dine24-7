import express from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();

router.use(authMiddleware,requireFeature('inventory'))
router.get('/',authMiddleware,inventoryController.getAllItem);
// SAHI ORDER ✅ — specific routes pehle, dynamic baad mein
router.get('/low-stock', authMiddleware, inventoryController.getLowStockItems);
router.get('/:id',       authMiddleware, inventoryController.getItemById);

router.post('/',authMiddleware,checkPermission('inventory'),inventoryController.createItem);
router.put('/:id',authMiddleware,checkPermission('inventory'),inventoryController.updateItem);
router.delete('/:id',authMiddleware,checkPermission('inventory'),inventoryController.deleteItem);

router.post('/:id/stock-in',authMiddleware,checkPermission('inventory'),inventoryController.stockIn);
router.post('/:id/stock-out',authMiddleware,checkPermission('inventory'),inventoryController.stockOut);
router.post('/:id/stock-adjustment',authMiddleware,checkPermission('inventory'),inventoryController.stockAdjustment);

export default router;

