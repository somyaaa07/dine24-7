import { useEffect } from 'react';
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
import KDS             from './pages/Kds';
import Customers       from './pages/Customer';
import Reservations    from './pages/Reservation';
import Employees       from './pages/Employee';
import Expenses        from './pages/Expense';
import Reports         from './pages/Reports';
import Analytics       from './pages/Analytics';
import SuperAdmin      from './pages/SuperAdmin';
import Orders          from './pages/Order';

// Protected Route wrapper — waits for the initial /auth/me check before
// deciding, and (optionally) enforces a required role, e.g. requiredRole="super_admin".
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  if (isInitializing) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public Route wrapper — redirect to the right home if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  if (isInitializing) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!isAuthenticated) return children;
  return <Navigate to={user?.role === 'super_admin' ? '/super-admin' : '/dashboard'} replace />;
};

// Sends an already-authenticated user to their correct home page based on role.
// Used for "/" and any unmatched path, so super_admin never lands on the tenant dashboard.
const HomeRedirect = () => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  if (isInitializing) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'super_admin' ? '/super-admin' : '/dashboard'} replace />;
};

// If a super_admin somehow lands on the tenant /dashboard (bookmark, back button,
// stale link) send them to their real home instead of showing tenant data that
// doesn't apply to a platform-level account.
const DashboardGate = () => {
  const user = useAuthStore((s) => s.user);
  if (user?.role === 'super_admin') return <Navigate to="/super-admin" replace />;
  return <Dashboard />;
};

// Feature-gated route — even if someone types the URL directly or clicks an old
// bookmark, if the super admin hasn't enabled this feature for the tenant,
// bounce back to the dashboard. The backend enforces the same thing on the API
// (requireFeature middleware), this is just so the UI doesn't show a broken page.
const FeatureRoute = ({ feature, children }) => {
  const user = useAuthStore((s) => s.user);
  const enabledFeatures = user?.tenant?.enabled_features || [];
  if (!enabledFeatures.includes(feature)) return <Navigate to="/dashboard" replace />;
  return children;
};

const App = () => {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
          <ProtectedRoute><DashboardGate /></ProtectedRoute>
        } />
        <Route path="/restaurant-setup" element={
          <ProtectedRoute><RestaurantSetup /></ProtectedRoute>
        } />
        <Route path="/tables" element={
          <ProtectedRoute><FeatureRoute feature="tables"><Tables /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/menu" element={
          <ProtectedRoute><FeatureRoute feature="menu"><Menu /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute><FeatureRoute feature="inventory"><Inventory /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/suppliers" element={
          <ProtectedRoute><FeatureRoute feature="suppliers"><Suppliers /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/purchase-orders" element={
          <ProtectedRoute><FeatureRoute feature="purchase_orders"><PurchaseOrders /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/recipes" element={
          <ProtectedRoute><FeatureRoute feature="recipes"><Recipes /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute><FeatureRoute feature="pos"><POS /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/kds" element={
          <ProtectedRoute><FeatureRoute feature="kds"><KDS /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute><FeatureRoute feature="customers"><Customers /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/reservations" element={
          <ProtectedRoute><FeatureRoute feature="reservations"><Reservations /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute><FeatureRoute feature="employees"><Employees /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute><FeatureRoute feature="expenses"><Expenses /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute><FeatureRoute feature="reports"><Reports /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><FeatureRoute feature="analytics"><Analytics /></FeatureRoute></ProtectedRoute>
        } />
        <Route path="/super-admin" element={
          <ProtectedRoute requiredRole="super_admin"><SuperAdmin /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Orders/></ProtectedRoute>
        } />

        {/* ── Default Redirects ───────────────────────────── */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;