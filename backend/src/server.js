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

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
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
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server chal raha hai ✅' });
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
    app.listen(PORT, () => {
      console.log(`Server started at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server didn't start:", error);
    process.exit(1);
  }
};

startServer();