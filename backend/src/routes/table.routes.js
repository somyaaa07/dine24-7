import express from 'express';
const router = express.Router();
import * as tableController from '../controllers/table.controller.js'
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';

router.use(authMiddleware,requireFeature('tables'))

router.get('/',authMiddleware , tableController.getAllTables);
router.get('/:id',authMiddleware, tableController.getTableById);

// creating tables only by manager and owner 
router.post('/',authMiddleware,checkPermission('tables'),tableController.createTable);
router.post('/bulk',authMiddleware,checkPermission('tables'),tableController.createBulkTable);

//updating tables by manager and owner only 
router.put('/:id',authMiddleware,checkPermission('tables'),tableController.updateTable);

//update status that can be done by the waiter as well
router.put('/:id/status',authMiddleware,tableController.updateStatus);

//delete status that can be held by the owner only 
router.delete('/:id',authMiddleware,checkPermission('tables'),tableController.deleteTable);

export default router;