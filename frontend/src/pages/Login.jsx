import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser  = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const successMsg = location.state?.message || '';

  const [form, setForm] = useState({
    email:    '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.email.trim() || !form.password.trim()) {
      return setError('Email aur password zaroori hai');
    }

    try {
      setLoading(true);

      const res = await api.post('/auth/login', {
        email:    form.email,
        password: form.password
      });

      if (res.data.success) {
        const { access_token, refresh_token, user } = res.data.data;

        localStorage.setItem('access_token',  access_token);
        localStorage.setItem('refresh_token', refresh_token);

        setUser(user);
        navigate('/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login fail hua, dobara try karo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login Karo</h1>
        <p style={styles.subtitle}>Apne restaurant mein login karein</p>

        {successMsg && <div style={styles.success}>{successMsg}</div>}
        {error      && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ramesh@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Aapka password"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Login ho raha hai...' : 'Login Karo'}
          </button>
        </form>

        <p style={styles.bottom}>
          Account nahi hai?{' '}
          <Link to="/register" style={styles.link}>Register karo</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:     { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card:     { background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px' },
  title:    { fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 24px' },
  success:  { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  error:    { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  field:    { marginBottom: '16px' },
  label:    { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  input:    { width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn:      { width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  bottom:   { textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '20px', marginBottom: '0' },
  link:     { color: '#2563eb', fontWeight: '500', textDecoration: 'none' }
};

export default Login;