import express from 'express';
import * as branchController from '../controllers/branch.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, branchController.getAllBranches);
router.post('/', authMiddleware, checkPermission('manage_settings'), branchController.createBranch);
router.put('/:id', authMiddleware, checkPermission('manage_settings'), branchController.updateBranch);
router.delete('/:id', authMiddleware, checkPermission('manage_settings'), branchController.deleteBranch);

export default router;