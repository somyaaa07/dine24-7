import express from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import  authMiddleware  from '../middleware/auth.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();

router.use(authMiddleware,requireFeature('recipes'));
router.get('/', authMiddleware, recipeController.getAllReceips);
router.get('/menu-item/:menu_item_id', authMiddleware,recipeController.getRecipeByMenuItem);
router.get('/check/:menu_item_id',authMiddleware,recipeController.checkAvailability);
router.get('/:id', authMiddleware, recipeController.getRecipeById);

router.post('/' , authMiddleware, checkPermission('inventory'),recipeController.createRecipe);
router.put('/:id',authMiddleware, checkPermission('inventory'), recipeController.updateRecipe);
router.delete('/:id',authMiddleware,checkPermission('inventory'), recipeController.deleteRecipe)

export default router;