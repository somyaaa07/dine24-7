import express from 'express';
import * as qrController from '../controllers/qrOrdering.controller.js';

const router = express.Router();

// All public — customer scans QR, no login needed
router.get('/menu',   qrController.getPublicMenu);
router.post('/order', qrController.placeQROrder);
router.get('/track',  qrController.trackQROrder);

export default router;