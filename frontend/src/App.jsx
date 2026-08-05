import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RestaurantSetup from './pages/ResturantPage';
import Tables from './pages/Tables';
import ProtectedRoute from './components/Protectedroutes';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Supplier';
import PurchaseOrders from './pages/PurchaseOrder';
import Recipes from './pages/Recipe';
import POS from './pages/Pos';
import Orders from './pages/Order';
import KDS from './pages/Kds';
import Customers from './pages/Customer';
import Reservations from './pages/Reservation';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/restaurant-setup" element={
          <ProtectedRoute><RestaurantSetup /></ProtectedRoute>
        } />

        <Route path="/tables" element={
          <ProtectedRoute><Tables /></ProtectedRoute>
        } />
            
        <Route path="/menu" element={
          <ProtectedRoute><Menu/></ProtectedRoute>
        }/>
         <Route path="/inventory" element={
          <ProtectedRoute><Inventory/></ProtectedRoute>
        }/>
           <Route path="/supplier" element={
          <ProtectedRoute><Suppliers/></ProtectedRoute>
        }/>
<Route path="/purchase-orders" element={
  <ProtectedRoute><PurchaseOrders /></ProtectedRoute>
} />
<Route path="/recipes" element={
  <ProtectedRoute><Recipes/></ProtectedRoute>
} />
<Route path="/pos" element={
  <ProtectedRoute><POS/></ProtectedRoute>
} />
  <Route path="/orders" element={
          <ProtectedRoute><Orders/></ProtectedRoute>
        }/>

  <Route path="/kds" element={
          <ProtectedRoute><KDS/></ProtectedRoute>
        }/>
  <Route path="/customer" element={
          <ProtectedRoute><Customers/></ProtectedRoute>
        }/>
  <Route path="/reservation" element={
          <ProtectedRoute><Reservations/></ProtectedRoute>
        }/>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    
      </Routes>
    </BrowserRouter>
  );
};

export default App;