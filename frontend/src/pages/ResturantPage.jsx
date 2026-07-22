import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday', thursday:'Thursday', friday:'Friday', saturday:'Saturday', sunday:'Sunday' };

const DEFAULT_HOURS = {
  monday:    { open: '09:00', close: '22:00', is_closed: false },
  tuesday:   { open: '09:00', close: '22:00', is_closed: false },
  wednesday: { open: '09:00', close: '22:00', is_closed: false },
  thursday:  { open: '09:00', close: '22:00', is_closed: false },
  friday:    { open: '09:00', close: '22:00', is_closed: false },
  saturday:  { open: '09:00', close: '22:00', is_closed: false },
  sunday:    { open: '09:00', close: '22:00', is_closed: true  },
};

const RestaurantSetup = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    restaurant_name:      '',
    email:                '',
    phone:                '',
    address:              '',
    city:                 '',
    state:                '',
    pincode:              '',
    gstin:                '',
    tax_percentage:       5,
    tax_inclusive:        false,
    currency:             'INR',
    currency_symbol:      '₹',
    receipt_header:       '',
    receipt_footer:       '',
    show_logo_on_receipt: true,
    working_hours:        DEFAULT_HOURS
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/restaurant/profile');
        const d   = res.data.data;
        setForm(prev => ({
          ...prev,
          ...d,
          working_hours: d.working_hours || DEFAULT_HOURS
        }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleHours = (day, field, value) => {
    setForm(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: { ...prev.working_hours[day], [field]: value }
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMsg({ type: '', text: '' });
      await api.put('/restaurant/profile', form);
      setMsg({ type: 'success', text: '✅ Profile saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rsetup-back-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        padding: 9px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .rsetup-back-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rsetup-tab {
        font-family: 'JetBrains Mono', monospace;
        padding: 10px 18px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #7A7264;
        margin-bottom: -1px;
        transition: color 0.15s ease, border-color 0.15s ease;
      }
      .rsetup-tab:hover { color: #1A1815; }
      .rsetup-tab-active { border-bottom-color: #A97E44 !important; color: #1A1815 !important; }

      .rsetup-input {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 2px solid #D8D1C2;
        padding: 9px 2px;
        font-size: 14px;
        color: #1A1815;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.15s ease;
      }
      .rsetup-input::placeholder { color: #B9B0A0; }
      .rsetup-input:focus { border-bottom-color: #A97E44; }
      select.rsetup-input { cursor: pointer; }
      textarea.rsetup-input { border: 1px solid #D8D1C2; border-radius: 4px; padding: 10px; }
      textarea.rsetup-input:focus { border-color: #A97E44; }

      .rsetup-time {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 12.5px;
        color: #1A1815;
        background: #FFFFFF;
      }
      .rsetup-time:focus { outline: none; border-color: #A97E44; }

      .rsetup-check {
        accent-color: #A97E44;
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .rsetup-save-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #1A1815;
        color: #F7F5F0;
        border: none;
        border-radius: 3px;
        padding: 13px 26px;
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        margin-top: 10px;
        transition: background 0.15s ease, transform 0.1s ease;
      }
      .rsetup-save-btn:hover:not(:disabled) { background: #A97E44; }
      .rsetup-save-btn:active:not(:disabled) { transform: scale(0.99); }
      .rsetup-save-btn:disabled { cursor: not-allowed; }

      @media (max-width: 640px) {
        .rsetup-two-col, .rsetup-three-col { grid-template-columns: 1fr !important; }
        .rsetup-top-bar { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rsetup-tabs { overflow-x: auto; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={styles.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING…
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'basic',   label: 'Basic Info' },
    { id: 'tax',     label: 'GST & Tax' },
    { id: 'hours',   label: 'Working Hours' },
    { id: 'receipt', label: 'Receipt' },
  ];

  return (
    <div style={styles.page}>
      <GlobalStyle />

      <div className="rsetup-top-bar" style={styles.topBar}>
        <div>
          <span style={styles.eyebrow}>RESTAURANT PROFILE</span>
          <h1 style={styles.title}>Restaurant Setup</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="rsetup-back-btn">
          ← Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="rsetup-tabs" style={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`rsetup-tab ${activeTab === t.id ? 'rsetup-tab-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.perforation} />

        {/* Message */}
        {msg.text && (
          <div style={{ ...styles.msg, ...(msg.type === 'success' ? styles.msgSuccess : styles.msgError) }}>
            {msg.text}
          </div>
        )}

        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div>
            <Field label="Restaurant Name *">
              <input name="restaurant_name" value={form.restaurant_name} onChange={handleChange} className="rsetup-input" />
            </Field>
            <div className="rsetup-two-col" style={styles.twoCol}>
              <Field label="Phone">
                <input name="phone" value={form.phone || ''} onChange={handleChange} className="rsetup-input" />
              </Field>
              <Field label="Email">
                <input type="email" name="email" value={form.email || ''} onChange={handleChange} className="rsetup-input" />
              </Field>
            </div>
            <Field label="Address">
              <textarea name="address" value={form.address || ''} onChange={handleChange} rows={2} className="rsetup-input" style={{ resize: 'vertical' }} />
            </Field>
            <div className="rsetup-three-col" style={styles.threeCol}>
              <Field label="City">
                <input name="city" value={form.city || ''} onChange={handleChange} className="rsetup-input" />
              </Field>
              <Field label="State">
                <input name="state" value={form.state || ''} onChange={handleChange} className="rsetup-input" />
              </Field>
              <Field label="Pincode">
                <input name="pincode" value={form.pincode || ''} onChange={handleChange} className="rsetup-input" />
              </Field>
            </div>
          </div>
        )}

        {/* GST & Tax */}
        {activeTab === 'tax' && (
          <div>
            <Field label="GSTIN Number">
              <input name="gstin" value={form.gstin || ''} onChange={handleChange}
                maxLength={15} placeholder="22AAAAA0000A1Z5" className="rsetup-input" />
              <span style={styles.hint}>Must be 15 characters</span>
            </Field>
            <Field label="Tax Percentage (%)">
              <input type="number" name="tax_percentage" value={form.tax_percentage}
                onChange={handleChange} min={0} max={100} step={0.5} className="rsetup-input" />
            </Field>
            <div style={styles.checkRow}>
              <input type="checkbox" id="tax_incl" name="tax_inclusive"
                checked={form.tax_inclusive} onChange={handleChange} className="rsetup-check" />
              <label htmlFor="tax_incl" style={styles.checkLabel}>
                Tax is inclusive (already included in price)
              </label>
            </div>
            <div className="rsetup-two-col" style={styles.twoCol}>
              <Field label="Currency">
                <select name="currency" value={form.currency} onChange={handleChange} className="rsetup-input">
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>
              </Field>
              <Field label="Symbol">
                <input name="currency_symbol" value={form.currency_symbol} onChange={handleChange} className="rsetup-input" />
              </Field>
            </div>
          </div>
        )}

        {/* Working Hours */}
        {activeTab === 'hours' && (
          <div>
            {DAYS.map(day => (
              <div key={day} style={styles.dayRow}>
                <span style={styles.dayName}>{DAY_LABELS[day]}</span>
                <input
                  type="checkbox"
                  checked={!form.working_hours[day].is_closed}
                  onChange={e => handleHours(day, 'is_closed', !e.target.checked)}
                  className="rsetup-check"
                />
                {!form.working_hours[day].is_closed ? (
                  <>
                    <input type="time" value={form.working_hours[day].open}
                      onChange={e => handleHours(day, 'open', e.target.value)} className="rsetup-time" />
                    <span style={{ color: '#B9B0A0', fontSize: '12.5px' }}>to</span>
                    <input type="time" value={form.working_hours[day].close}
                      onChange={e => handleHours(day, 'close', e.target.value)} className="rsetup-time" />
                  </>
                ) : (
                  <span style={{ color: '#B33F2C', fontSize: '12.5px', fontWeight: '600', letterSpacing: '0.04em' }}>CLOSED</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Receipt */}
        {activeTab === 'receipt' && (
          <div>
            <Field label="Receipt Header">
              <input name="receipt_header" value={form.receipt_header || ''}
                onChange={handleChange} placeholder="Thank you for visiting!" className="rsetup-input" />
            </Field>
            <Field label="Receipt Footer">
              <input name="receipt_footer" value={form.receipt_footer || ''}
                onChange={handleChange} placeholder="Visit us again!" className="rsetup-input" />
            </Field>
            <div style={styles.checkRow}>
              <input type="checkbox" id="show_logo" name="show_logo_on_receipt"
                checked={form.show_logo_on_receipt} onChange={handleChange} className="rsetup-check" />
              <label htmlFor="show_logo" style={styles.checkLabel}>
                Show logo on receipt
              </label>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="rsetup-save-btn">
          {saving ? 'Saving…' : 'Save →'}
        </button>
      </div>
    </div>
  );
};

// Helper component
const Field = ({ label, children }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{
      display: 'block',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '10.5px',
      fontWeight: '700',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#7A7264',
      marginBottom: '8px'
    }}>
      {label}
    </label>
    {children}
  </div>
);

const styles = {
  page: {
    padding: '32px',
    background: '#F7F5F0',
    minHeight: '100vh',
    fontFamily: "'JetBrains Mono', monospace"
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#F7F5F0'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.14em',
    color: '#A97E44',
    marginBottom: '6px'
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '28px',
    letterSpacing: '0.01em',
    color: '#1A1815',
    margin: 0
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '20px',
    borderBottom: '1px solid #E9E3D6'
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '6px',
    border: '1px solid #E9E3D6',
    padding: '28px',
    boxShadow: '0 1px 2px rgba(26,24,21,0.03), 0 12px 30px rgba(26,24,21,0.05)',
    maxWidth: '700px',
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
  msg: {
    padding: '10px 14px',
    borderRadius: '4px',
    fontSize: '12.5px',
    fontWeight: '500',
    marginBottom: '18px'
  },
  msgSuccess: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgError:   { background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },
  hint:       { fontSize: '11.5px', color: '#B9B0A0', marginTop: '6px', display: 'block' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  threeCol:   { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
  checkRow:   { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' },
  checkLabel: { fontSize: '13px', color: '#1A1815', cursor: 'pointer' },
  dayRow:     { display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 0', borderTop: '1px dashed #E9E3D6' },
  dayName:    { width: '100px', fontSize: '13px', fontWeight: '600', color: '#1A1815' },
};

export default RestaurantSetup;