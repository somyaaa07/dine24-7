import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { connectDB, sequelize } from './config/database.js';
import authRoutes        from './routes/auth.routes.js';
import dashboardRoutes   from './routes/dashboard.route.js';
import resturantRoutes   from './routes/resturant.route.js';
import tableRoutes       from './routes/table.routes.js';
import menuRoutes        from './routes/menu.routes.js';
import inventoryRoutes   from './routes/inventory.routes.js';
import supplierRoutes    from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import recipeRoutes      from './routes/recipe.route.js';
import orderRoutes        from './routes/order.routes.js';
import kdsRoutes          from  './routes/kds.routes.js';
import customerRoutes    from   './routes/customer.route.js';
import reservationRoutes from './routes/reservation.routes.js';
import employeeRoutes        from './routes/employee.routes.js';
import expenseRoutes         from './routes/expense.routes.js';
import reportsRoutes         from './routes/report.routes.js';
import notificationsRoutes   from './routes/notification.routes.js';
import qrOrderRoutes         from './routes/qr.routes.js';
import analyticsRoutes       from './routes/analytics.routes.js';
import superAdminRoutes      from './routes/superAdmin.routes.js';

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  // origin: [process.env.APP_URL || 'http://localhost:5173','http://192.168.1.41:5173'],
    origin: [ 'http://localhost:5173','http://192.168.1.41:5173'],

  // origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/dashboard',  dashboardRoutes);
app.use('/api/v1/restaurant', resturantRoutes);
app.use('/api/v1/tables',     tableRoutes);
app.use('/api/v1/menu',       menuRoutes);
app.use('/api/v1/inventory',  inventoryRoutes);
app.use('/api/v1/supplier',   supplierRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/recipes',    recipeRoutes);
app.use('/api/v1/orders',     orderRoutes);
app.use('/api/v1/kds',         kdsRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/reservations',reservationRoutes);
app.use('/api/v1/employees',       employeeRoutes);
app.use('/api/v1/expenses',        expenseRoutes);
app.use('/api/v1/reports',         reportsRoutes);
app.use('/api/v1/notifications',   notificationsRoutes);
app.use('/api/v1/qr',              qrOrderRoutes);
app.use('/api/v1/analytics',       analyticsRoutes);
app.use('/api/v1/super-admin',     superAdminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is Running ✅' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync();
    console.log('Database now synced');
    app.listen(PORT, '0.0.0.0',() => {
      console.log(`Server started at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server didn't start:", error);
    process.exit(1);
  }
};

startServer();