import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import  useAuthStore  from './store/authStore';

// Auth Pages
import Login    from './pages/Login';
import Register from './pages/Register';

// App Pages
import Dashboard       from './pages/Dashboard';
import RestaurantSetup from './pages/ResturantPage';
import Tables          from './pages/Tables';
import Menu            from './pages/Menu';
import Inventory       from './pages/Inventory';
import Suppliers       from './pages/Supplier';
import PurchaseOrders  from './pages/PurchaseOrder';
import Recipes         from './pages/Recipe';
import POS             from './pages/Pos';
import KDS             from './pages/KDS';
import Customers       from './pages/Customer';
import Reservations    from './pages/Reservation';
import Employees       from './pages/Employee';
import Expenses        from './pages/Expense';
import Reports         from './pages/Reports';
import Analytics       from './pages/Analytics';
import SuperAdmin      from './pages/SuperAdmin';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route wrapper — redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ──────────────────────────────── */}
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        {/* ── Protected Routes ───────────────────────────── */}
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
          <ProtectedRoute><Menu /></ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute><Inventory /></ProtectedRoute>
        } />
        <Route path="/suppliers" element={
          <ProtectedRoute><Suppliers /></ProtectedRoute>
        } />
        <Route path="/purchase-orders" element={
          <ProtectedRoute><PurchaseOrders /></ProtectedRoute>
        } />
        <Route path="/recipes" element={
          <ProtectedRoute><Recipes /></ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute><POS /></ProtectedRoute>
        } />
        <Route path="/kds" element={
          <ProtectedRoute><KDS /></ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute><Customers /></ProtectedRoute>
        } />
        <Route path="/reservations" element={
          <ProtectedRoute><Reservations /></ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute><Employees /></ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute><Expenses /></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute><Reports /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><Analytics /></ProtectedRoute>
        } />
        <Route path="/super-admin" element={
          <ProtectedRoute><SuperAdmin /></ProtectedRoute>
        } />

        {/* ── Default Redirects ───────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;