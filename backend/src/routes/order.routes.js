import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();


router.use(authMiddleware,requireFeature('orders'));
//get router

router.get('/active',authMiddleware,orderController.getActiveOrders);
router.get('/',authMiddleware,orderController.getAllOrders);
router.get('/:id',authMiddleware,orderController.getOrderById);

//post router
router.post('/',authMiddleware,orderController.createOrder);
router.post('/:id/items',authMiddleware,orderController.addItems);

//put router 
router.put('/:id/status',authMiddleware,orderController.updateStatus);
router.put('/:id/payment',authMiddleware,orderController.processPayment);
router.put('/:id/cancel',authMiddleware,orderController.cancelOrder);

export default router;
