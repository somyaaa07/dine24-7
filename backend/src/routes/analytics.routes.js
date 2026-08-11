import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();

router.use(authMiddleware, requireFeature('analytics'));
router.get('/dashboard',         authMiddleware, analyticsController.getDashboardAnalytics);
router.get('/peak-hours',        authMiddleware, analyticsController.getPeakHours);
router.get('/revenue-by-day',    authMiddleware, analyticsController.getRevenueByDay);
router.get('/table-utilization', authMiddleware, analyticsController.getTableUtilization);
router.get('/customer-insights', authMiddleware, analyticsController.getCustomerInsights);

export default router;