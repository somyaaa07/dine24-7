import express from 'express';
import * as employeeController from '../controllers/employee.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
import { requireFeature } from '../middleware/planCheck.middleware.js';
const router = express.Router();

router.use(authMiddleware,requireFeature('employees'));
// attendance 
router.post('/attendance',authMiddleware,employeeController.markAttendance);
router.get('/attendance/records',authMiddleware,employeeController.getAttendance);
router.post('/payroll/generate',authMiddleware,employeeController.genratePayroll)
router.get('/payroll/list',authMiddleware,employeeController.getPayroll);
router.put('/payroll/:id/paid',authMiddleware,employeeController.markPayrollPaid);
router.get('/',authMiddleware,employeeController.getAllEmployee);
router.get('/:id',authMiddleware,employeeController.getEmployeeById);
router.post('/' , authMiddleware,employeeController.createEmployee);
router.put('/:id',authMiddleware,employeeController.updateEmployee);
router.delete('/:id',authMiddleware,employeeController.deleteEmployee);



export default router