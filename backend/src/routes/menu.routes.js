import express from 'express';
import * as menuController from '../controllers/menu.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';

const router = express.Router();

router.use(authMiddleware,requireFeature('menu'))

// Full Menu
router.get('/full', authMiddleware, menuController.getFullMenu);

// Categories
router.get('/categories',        authMiddleware, menuController.getAllCategories);
router.post('/categories',       authMiddleware, checkPermission('menu'), menuController.createCategory);
router.put('/categories/:id',    authMiddleware, checkPermission('menu'), menuController.updateCategory);
router.delete('/categories/:id', authMiddleware, checkPermission('menu'), menuController.deleteCategory);

// Items
router.get('/items',            authMiddleware, menuController.getAllItem);
router.get('/items/:id',        authMiddleware, menuController.getItemById);
router.post('/items',           authMiddleware, checkPermission('menu'), menuController.createItem);
router.put('/items/:id',        authMiddleware, checkPermission('menu'), menuController.updateItem);
router.put('/items/:id/toggle', authMiddleware, checkPermission('menu'), menuController.toggleActivity);
router.delete('/items/:id',     authMiddleware, checkPermission('menu'), menuController.deleteItem);

// Variants
router.post('/items/:item_id/variants', authMiddleware, checkPermission('menu'), menuController.addVariants);
router.delete('/variants/:id',          authMiddleware, checkPermission('menu'), menuController.deleteVarient);

export default router;