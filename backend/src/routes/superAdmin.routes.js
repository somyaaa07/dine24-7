import express from 'express';
import * as superAdminController from '../controllers/superadmin.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware, superAdminController.superAdminMiddleware);

router.get('/stats',                  superAdminController.getPlatformStats);
router.get('/trend',                  superAdminController.getPlatformTrend);
router.get('/features',               superAdminController.getFeatureCatalog);
router.post('/tenants',               superAdminController.createTenant);
router.get('/tenants',                superAdminController.getAllTenants);
router.get('/tenants/:id',            superAdminController.getTenantById);
router.put('/tenants/:id/status',     superAdminController.updateTenantStatus);
router.put('/tenants/:id/plan',       superAdminController.updateTenantPlan);
router.delete('/tenants/:id',         superAdminController.deleteTenant);

router.get('/branches',               superAdminController.getAllBranches);
router.get('/branches/:id',           superAdminController.getBranchById);
router.put('/branches/:id/status',    superAdminController.updateBranchStatus);

router.get('/users',                  superAdminController.getAllUsers);
router.get('/users/:id',              superAdminController.getUserById);
router.put('/users/:id/status',       superAdminController.updateUserStatus);
router.put('/users/:id/role',         superAdminController.updateUserRole);

export default router;