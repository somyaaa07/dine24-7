import express from 'express';
import * as poController from '../controllers/purchaseOrder.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';

const router = express.Router();
router.use(authMiddleware, requireFeature('purchase_order'));
router.get('/',     authMiddleware, poController.getAllPurchaseOrders);
router.get('/:id',  authMiddleware, poController.getPurchaseOrderById);
router.post('/',    authMiddleware, checkPermission('inventory'), poController.createPurchaseOrder);
router.put('/:id/status', authMiddleware, checkPermission('inventory'), poController.updateStatus);
router.put('/:id/cancel', authMiddleware, checkPermission('inventory'), poController.cancelOrder);

export default router;