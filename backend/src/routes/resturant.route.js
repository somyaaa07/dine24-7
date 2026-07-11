import express from 'express';
const router = express.Router();
import * as resturantController from '../controllers/resturant.controller.js';
import authmiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';


router.get('/profile',authmiddleware,resturantController.getProfile);
router.put('/profile',authmiddleware,checkPermission('manage_settings'),resturantController.updateProfile);
router.put('/logo',authmiddleware,checkPermission('manage_settings'),resturantController.updateLogo);

export default router;