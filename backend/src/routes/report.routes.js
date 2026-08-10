import express from 'express';
import * as reportsController from '../controllers/report.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/sales',      authMiddleware, reportsController.getReport);
router.get('/top-items',  authMiddleware, reportsController.getTopSellingItems);
router.get('/inventory',  authMiddleware, reportsController.getInventoryReport);
router.get('/financial',  authMiddleware, reportsController.getFinancialReport);
router.get('/customers',  authMiddleware, reportsController.getCustomerReport);

export default router;