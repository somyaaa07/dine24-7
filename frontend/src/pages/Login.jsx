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
      return setError('Email and Password are required');
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
navigate(user.role === 'super_admin' ? '/super-admin' : '/dashboard');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again');
    } finally {
      setLoading(false);
    }
  };

  // Mock chits for the order rail — purely decorative, evokes a kitchen ticket line
  const rail = [
    { table: '04', item: 'Paneer Tikka x2', time: '7:41p' },
    { table: '11', item: 'Butter Chicken',  time: '7:44p' },
    { table: '07', item: 'Garlic Naan x3',  time: '7:46p' },
    { table: '02', item: 'Dal Makhani',     time: '7:49p' },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        .rlogin-rail-item {
          animation: rlogin-hang 5s ease-in-out infinite;
          transform-origin: top center;
        }
        .rlogin-rail-item:nth-child(2) { animation-delay: -1.3s; }
        .rlogin-rail-item:nth-child(3) { animation-delay: -2.6s; }
        .rlogin-rail-item:nth-child(4) { animation-delay: -3.8s; }
        @keyframes rlogin-hang {
          0%, 100% { transform: rotate(-1.2deg); }
          50% { transform: rotate(1.2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rlogin-rail-item { animation: none; }
        }

        .rlogin-input {
          font-family: 'JetBrains Mono', monospace;
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 2px solid #D8D1C2;
          padding: 10px 2px;
          font-size: 15px;
          color: #1A1815;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }
        .rlogin-input::placeholder { color: #B9B0A0; }
        .rlogin-input:focus { border-bottom-color: #A97E44; }

        .rlogin-btn {
          font-family: 'JetBrains Mono', monospace;
          width: 100%;
          background: #1A1815;
          color: #F7F5F0;
          border: none;
          border-radius: 3px;
          padding: 14px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .rlogin-btn:hover:not(:disabled) { background: #A97E44; }
        .rlogin-btn:active:not(:disabled) { transform: scale(0.99); }
        .rlogin-btn:disabled { cursor: not-allowed; }

        .rlogin-link { color: #A97E44; font-weight: 600; text-decoration: none; }
        .rlogin-link:hover { text-decoration: underline; }

        @media (max-width: 860px) {
          .rlogin-rail-panel { display: none; }
          .rlogin-form-panel { max-width: 460px !important; }
        }
      `}</style>

 

      {/* RIGHT — the login ticket */}
      <div className="rlogin-form-panel" style={styles.formPanel}>
        <div style={styles.ticketCard}>
          <div style={styles.perforation} />

          <span style={styles.eyebrow}>STAFF LOGIN</span>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to manage your restaurant</p>

          {successMsg && <div style={styles.success}>{successMsg}</div>}
          {error      && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email"
                className="rlogin-input"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="rlogin-input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="rlogin-btn">
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.bottom}>
            Don't have an account?{' '}
            <Link to="/register" className="rlogin-link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    background: '#F7F5F0',
    fontFamily: "'JetBrains Mono', monospace"
  },

  /* Left panel */
  railPanel: {
    flex: '0 0 42%',
    background: '#1A1815',
    color: '#F7F5F0',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden'
  },
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandMark: {
    width: '34px',
    height: '34px',
    borderRadius: '4px',
    background: '#A97E44',
    color: '#1A1815',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '20px'
  },
  brandName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '20px',
    letterSpacing: '0.12em',
    color: '#F7F5F0'
  },

  railWrap: { position: 'relative', flex: 1, margin: '40px 0', paddingLeft: '18px' },
  railLine: {
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    width: '2px',
    background: 'repeating-linear-gradient(to bottom, #A97E44 0, #A97E44 6px, transparent 6px, transparent 11px)'
  },
  ticket: {
    background: '#F7F5F0',
    color: '#1A1815',
    borderRadius: '2px',
    padding: '10px 14px 12px',
    width: '78%',
    marginBottom: '26px',
    marginLeft: '20px',
    boxShadow: '0 6px 14px rgba(0,0,0,0.35)',
    position: 'relative'
  },
  railClip: {
    position: 'absolute',
    top: '-8px',
    left: '-22px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#A97E44',
    boxShadow: '18px 0 0 0 rgba(0,0,0,0)'
  },
  ticketHead: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    letterSpacing: '0.08em',
    color: '#7A7264',
    fontWeight: '700'
  },
  ticketDivider: {
    borderTop: '1px dashed #D8D1C2',
    margin: '6px 0 8px'
  },
  ticketItem: { fontSize: '13px', fontWeight: '500' },

  tagline: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '26px',
    letterSpacing: '0.02em',
    color: '#F7F5F0',
    margin: 0,
    opacity: 0.9
  },

  /* Right panel */
  formPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  ticketCard: {
    background: '#FFFFFF',
    width: '100%',
    maxWidth: '420px',
    padding: '44px 40px 36px',
    borderRadius: '6px',
    border: '1px solid #E9E3D6',
    boxShadow: '0 1px 2px rgba(26,24,21,0.04), 0 12px 30px rgba(26,24,21,0.06)',
    position: 'relative'
  },
  perforation: {
    position: 'absolute',
    top: '-1px',
    left: 0,
    right: 0,
    height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px'
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.14em',
    color: '#A97E44',
    marginBottom: '10px'
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '32px',
    letterSpacing: '0.01em',
    color: '#1A1815',
    margin: '0 0 4px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#7A7264',
    margin: '0 0 26px'
  },
  success: {
    background: '#F0F7EE',
    border: '1px solid #CFE3C6',
    color: '#3F7D33',
    padding: '10px 14px',
    borderRadius: '4px',
    fontSize: '12.5px',
    fontWeight: '500',
    marginBottom: '18px'
  },
  error: {
    background: '#FBEEEB',
    border: '1px solid #EBC7BC',
    color: '#B33F2C',
    padding: '10px 14px',
    borderRadius: '4px',
    fontSize: '12.5px',
    fontWeight: '500',
    marginBottom: '18px'
  },
  field: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '10.5px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#7A7264',
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  bottom: {
    textAlign: 'center',
    fontSize: '12.5px',
    color: '#7A7264',
    marginTop: '24px',
    marginBottom: '0'
  }
};

export default Login;
