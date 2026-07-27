import express from 'express';
const router = express.Router();
import *  as dashboardController from '../controllers/dashboard.controller.js';
import authMiddleware from '../middleware/auth.middleware.js'

router.get('/stats',authMiddleware,dashboardController.getStats);
router.get('/low-stock',authMiddleware,dashboardController.getLowStock);
router.get('/today-reservations',authMiddleware,dashboardController.getTodaysReservation);
router.get('/top-dishes',authMiddleware,dashboardController.getTopDishesh);
router.get('/recent-activity',authMiddleware,dashboardController.getRecentActivity);

export default router;