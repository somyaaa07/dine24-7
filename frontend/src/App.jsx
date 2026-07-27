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


        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    
      </Routes>
    </BrowserRouter>
  );
};

export default App;