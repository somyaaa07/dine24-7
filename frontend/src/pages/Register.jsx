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
      return setError('Both the Passwords must be same');
    }
    if (form.password.length < 8) {
      return setError('Password must be greater then 8 characters');
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
          state: { message: 'Registration Successful, Please Login' }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        .rreg-input {
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
        .rreg-input::placeholder { color: #B9B0A0; }
        .rreg-input:focus { border-bottom-color: #A97E44; }

        .rreg-btn {
          font-family: 'JetBrains Mono', monospace;
          width: 100%;
          background: #1A1815;
          color: #F7F5F0;
          border: none;
          border-radius: 3px;
          padding: 14px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .rreg-btn:hover:not(:disabled) { background: #A97E44; }
        .rreg-btn:active:not(:disabled) { transform: scale(0.99); }
        .rreg-btn:disabled { cursor: not-allowed; }

        .rreg-link { color: #A97E44; font-weight: 600; text-decoration: none; }
        .rreg-link:hover { text-decoration: underline; }

        .rreg-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 520px) {
          .rreg-row { grid-template-columns: 1fr; gap: 0; }
          .rreg-card { padding: 36px 26px 30px !important; }
        }
      `}</style>

      <div className="rreg-card" style={styles.ticketCard}>
        <div style={styles.perforation} />

        <div style={styles.brandRow}>
          <div style={styles.brandMark}>D</div>
          <span style={styles.brandName}>Dine 24/7</span>
        </div>

        <span style={styles.eyebrow}>NEW ACCOUNT · 14 DAYS FREE TRIAL</span>
        <h1 style={styles.title}>Restaurant Register </h1>
        {/* <p style={styles.subtitle}>Credit card nahi chahiye</p> */}

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Restaurant NAME</label>
            <input
              name="resturant_name"
              value={form.resturant_name}
              onChange={handleChange}
              placeholder="Resturant"
              className="rreg-input"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}> YOUR NAME *</label>
            <input
              name="owner_name"
              value={form.owner_name}
              onChange={handleChange}
              placeholder="name"
              className="rreg-input"
              required
            />
          </div>

          <div className="rreg-row">
            <div style={styles.field}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email"
                className="rreg-input"
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
                placeholder="mobile no."
                className="rreg-input"
              />
            </div>
          </div>

          <div style={styles.ticketDivider} />

          <div className="rreg-row">
            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="rreg-input"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password*</label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                className="rreg-input"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="rreg-btn">
            {loading ? 'Register Sucessfully…' : 'Starts free trail→'}
          </button>
        </form>

        <p style={styles.bottom}>
          Already have an account?{' '}
          <Link to="/login" className="rreg-link">Please Do Login </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F7F5F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'JetBrains Mono', monospace"
  },
  ticketCard: {
    background: '#FFFFFF',
    width: '100%',
    maxWidth: '480px',
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
  brandRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' },
  brandMark: {
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    background: '#A97E44',
    color: '#1A1815',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '17px'
  },
  brandName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '17px',
    letterSpacing: '0.12em',
    color: '#1A1815'
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#A97E44',
    marginBottom: '10px'
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '30px',
    letterSpacing: '0.01em',
    color: '#1A1815',
    margin: '0 0 4px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#7A7264',
    margin: '0 0 26px'
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
  ticketDivider: {
    borderTop: '1px dashed #D8D1C2',
    margin: '4px 0 20px'
  },
  bottom: {
    textAlign: 'center',
    fontSize: '12.5px',
    color: '#7A7264',
    marginTop: '24px',
    marginBottom: '0'
  }
};

export default Register;