import express from 'express';
import * as superAdminController from '../controllers/superadmin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats',                  authMiddleware, superAdminController.getPlatformStats);
router.get('/tenants',                authMiddleware, superAdminController.getAllTenants);
router.get('/tenants/:id',            authMiddleware, superAdminController.getTenantById);
router.put('/tenants/:id/status',     authMiddleware, superAdminController.updateTenantStatus);
router.put('/tenants/:id/plan',       authMiddleware, superAdminController.updateTenantPlan);
router.delete('/tenants/:id',         authMiddleware, superAdminController.deleteTenant);

export default router;