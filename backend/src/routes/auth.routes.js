import express from 'express'
const router = express.Router();
import * as authcontroller from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

router.post('/register',authcontroller.register);
router.post('/login',authcontroller.login);
router.post('/refresh-token',authcontroller.refreshToken);

router.post('/logout', authMiddleware , authcontroller.logout);
router.get('/me',authMiddleware,authcontroller.getMe);

export default router;