import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    resturant_name:   '',
    owner_name:       '',
    email:            '',
    password:         '',
    confirm_password: '',
    phone:            ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      return setError('Dono passwords same hone chahiye');
    }
    if (form.password.length < 8) {
      return setError('Password kam se kam 8 characters ka hona chahiye');
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        resturant_name: form.resturant_name,
        owner_name:     form.owner_name,
        email:          form.email,
        password:       form.password,
        phone:          form.phone
      });

      if (res.data.success) {
        navigate('/login', {
          state: { message: 'Registration ho gayi! Ab login karo.' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch galat hua, dobara try karo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Restaurant Register Karo</h1>
        <p style={styles.subtitle}>14 din free trial — credit card nahi chahiye</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Restaurant Ka Naam *</label>
            <input
              name="resturant_name"
              value={form.resturant_name}
              onChange={handleChange}
              placeholder="Spice Garden"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Aapka Naam *</label>
            <input
              name="owner_name"
              value={form.owner_name}
              onChange={handleChange}
              placeholder="Ramesh Kumar"
              style={styles.input}
              required
            />
          </div>

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
            <label style={styles.label}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password Confirm Karo *</label>
            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Register ho raha hai...' : 'Free Trial Shuru Karo'}
          </button>
        </form>

        <p style={styles.bottom}>
          Pehle se account hai?{' '}
          <Link to="/login" style={styles.link}>Login karo</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page:     { minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card:     { background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px' },
  title:    { fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 24px' },
  error:    { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  field:    { marginBottom: '16px' },
  label:    { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  input:    { width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn:      { width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  bottom:   { textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '20px', marginBottom: '0' },
  link:     { color: '#2563eb', fontWeight: '500', textDecoration: 'none' }
};

export default Register;