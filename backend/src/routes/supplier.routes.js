import express from 'express';
import * as supplierController from '../controllers/supplier.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';

const router = express.Router();
router.use(authMiddleware, requireFeature('suppliers'));
router.get('/', authMiddleware, supplierController.getAllSuppliers);
router.get('/:id', authMiddleware, supplierController.getSupplierById);
router.post('/', authMiddleware, checkPermission('inventory'), supplierController.createSupplier);
router.put('/:id', authMiddleware, checkPermission('inventory'), supplierController.updateSupplier);
router.delete('/:id', authMiddleware, checkPermission('inventory'), supplierController.deleteSupplier);

export default router;