import express from 'express';
import * as reservationController from '../controllers/reservation.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();

router.use(authMiddleware,requireFeature('reservations'))
router.get('/',authMiddleware,reservationController.getAllReservations);
router.get('/today',authMiddleware,reservationController.getTodayReservation);
router.get('/:id',authMiddleware,reservationController.getReservationId);
router.post('/',authMiddleware,reservationController.createReservation);
router.put('/:id',authMiddleware,reservationController.updateReservation);
router.put('/:id/status',authMiddleware,reservationController.updateStatus);
router.delete('/:id',authMiddleware,reservationController.deleteReservation);


export default router;

