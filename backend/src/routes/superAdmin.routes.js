import express from 'express';
import * as superAdminController from '../controllers/superadmin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware, superAdminController.superAdminMiddleware);

router.get('/stats',                  superAdminController.getPlatformStats);
router.get('/tenants',                superAdminController.getAllTenants);
router.get('/tenants/:id',            superAdminController.getTenantById);
router.put('/tenants/:id/status',     superAdminController.updateTenantStatus);
router.put('/tenants/:id/plan',       superAdminController.updateTenantPlan);
router.delete('/tenants/:id',         superAdminController.deleteTenant);

export default router;