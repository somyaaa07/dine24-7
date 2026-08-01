import express from 'express'
import * as KdsController from '../controllers/kds.controller.js'
import  authMiddleware  from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', authMiddleware, KdsController.getKDSOrders);
router.put('/orders/:id/status',authMiddleware,KdsController.updateOrderItemStatus);
router.put('/items/:id/status', authMiddleware, KdsController.updateItemStatus);
export default router;