import express from 'express';
import * as shiftController from '../controllers/shift.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';

const router = express.Router();
router.use(authMiddleware, requireFeature('employees'));

router.get('/', shiftController.getAllShifts);
router.post('/seed-defaults', checkPermission('manage_settings'), shiftController.seedDefaultShifts);
router.post('/', checkPermission('manage_settings'), shiftController.createShift);
router.put('/:id', checkPermission('manage_settings'), shiftController.updateShift);
router.delete('/:id', checkPermission('manage_settings'), shiftController.deleteShift);

export default router;