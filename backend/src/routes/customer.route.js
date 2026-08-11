import express from 'express';
import * as customerController from '../controllers/customer.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();

router.use(authMiddleware, requireFeature('customer'));
router.get('/special-dates',authMiddleware, customerController.getTodaySpecialDates);
router.get('/',authMiddleware, customerController.getAllCustomers);
router.get('/:id',authMiddleware,customerController.getCustomerById);
router.post('/',authMiddleware,customerController.createCustomer);
router.put('/:id',authMiddleware,customerController.updateCustomer);
router.delete('/:id',authMiddleware,customerController.deleteCustomer);
router.post('/:id/loyalty/add',      authMiddleware, customerController.addLoyaltyPoints);
router.post('/:id/loyalty/redeem',   authMiddleware, customerController.redeemLoyaltyPoints);

export default router;

