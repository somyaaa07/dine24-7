import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';

const router = express.Router();
router.use(authMiddleware,requireFeature('notifications'))
router.get('/settings',authMiddleware,notificationController.getNotificationSettings);
router.post('/low-stock-alert',authMiddleware,notificationController.lowStockNotification);
router.post('/order-confirmation',authMiddleware,notificationController.sendOrderConfirmation);
router.post('/custom-email',authMiddleware,notificationController.sendCustomEmail);

export default router;