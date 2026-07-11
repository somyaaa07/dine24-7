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
      setMsg({ type: 'success', text: '✅ Profile save ho gayi!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Save nahi hua' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.centered}><p>Load ho raha hai...</p></div>;

  const tabs = [
    { id: 'basic',   label: 'Basic Info' },
    { id: 'tax',     label: 'GST & Tax' },
    { id: 'hours',   label: 'Working Hours' },
    { id: 'receipt', label: 'Receipt' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.title}>Restaurant Setup</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Dashboard</button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        {/* Message */}
        {msg.text && (
          <div style={{ ...styles.msg, ...(msg.type === 'success' ? styles.msgSuccess : styles.msgError) }}>
            {msg.text}
          </div>
        )}

        {/* Basic Info */}
        {activeTab === 'basic' && (
          <div>
            <Field label="Restaurant Ka Naam *">
              <input name="restaurant_name" value={form.restaurant_name} onChange={handleChange} style={styles.input} />
            </Field>
            <div style={styles.twoCol}>
              <Field label="Phone">
                <input name="phone" value={form.phone || ''} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Email">
                <input type="email" name="email" value={form.email || ''} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
            <Field label="Address">
              <textarea name="address" value={form.address || ''} onChange={handleChange} rows={2} style={{ ...styles.input, resize: 'vertical' }} />
            </Field>
            <div style={styles.threeCol}>
              <Field label="City">
                <input name="city" value={form.city || ''} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="State">
                <input name="state" value={form.state || ''} onChange={handleChange} style={styles.input} />
              </Field>
              <Field label="Pincode">
                <input name="pincode" value={form.pincode || ''} onChange={handleChange} style={styles.input} />
              </Field>
            </div>
          </div>
        )}

        {/* GST & Tax */}
        {activeTab === 'tax' && (
          <div>
            <Field label="GSTIN Number">
              <input name="gstin" value={form.gstin || ''} onChange={handleChange}
                maxLength={15} placeholder="22AAAAA0000A1Z5" style={styles.input} />
              <span style={styles.hint}>15 characters ka hona chahiye</span>
            </Field>
            <Field label="Tax Percentage (%)">
              <input type="number" name="tax_percentage" value={form.tax_percentage}
                onChange={handleChange} min={0} max={100} step={0.5} style={styles.input} />
            </Field>
            <div style={styles.checkRow}>
              <input type="checkbox" id="tax_incl" name="tax_inclusive"
                checked={form.tax_inclusive} onChange={handleChange} />
              <label htmlFor="tax_incl" style={styles.checkLabel}>
                Tax inclusive hai (price mein already included)
              </label>
            </div>
            <div style={styles.twoCol}>
              <Field label="Currency">
                <select name="currency" value={form.currency} onChange={handleChange} style={styles.input}>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="AED">AED — UAE Dirham</option>
                </select>
              </Field>
              <Field label="Symbol">
                <input name="currency_symbol" value={form.currency_symbol} onChange={handleChange} style={styles.input} />
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
                <input type="checkbox" checked={!form.working_hours[day].is_closed}
                  onChange={e => handleHours(day, 'is_closed', !e.target.checked)} />
                {!form.working_hours[day].is_closed ? (
                  <>
                    <input type="time" value={form.working_hours[day].open}
                      onChange={e => handleHours(day, 'open', e.target.value)} style={styles.timeInput} />
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>to</span>
                    <input type="time" value={form.working_hours[day].close}
                      onChange={e => handleHours(day, 'close', e.target.value)} style={styles.timeInput} />
                  </>
                ) : (
                  <span style={{ color: '#ef4444', fontSize: '13px' }}>Closed</span>
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
                onChange={handleChange} placeholder="Thank you for visiting!" style={styles.input} />
            </Field>
            <Field label="Receipt Footer">
              <input name="receipt_footer" value={form.receipt_footer || ''}
                onChange={handleChange} placeholder="Visit us again!" style={styles.input} />
            </Field>
            <div style={styles.checkRow}>
              <input type="checkbox" id="show_logo" name="show_logo_on_receipt"
                checked={form.show_logo_on_receipt} onChange={handleChange} />
              <label htmlFor="show_logo" style={styles.checkLabel}>
                Receipt pe logo dikhao
              </label>
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Save ho raha hai...' : 'Save Karo'}
        </button>
      </div>
    </div>
  );
};

// Helper component
const Field = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
      {label}
    </label>
    {children}
  </div>
);

const styles = {
  page:       { padding: '24px', background: '#f8fafc', minHeight: '100vh' },
  centered:   { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' },
  topBar:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title:      { fontSize: '22px', fontWeight: '600', color: '#1e293b', margin: '0' },
  backBtn:    { background: '#fff', border: '1px solid #d1d5db', color: '#374151', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  tabs:       { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' },
  tab:        { padding: '8px 20px', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '14px', color: '#64748b', marginBottom: '-1px' },
  tabActive:  { borderBottomColor: '#2563eb', color: '#2563eb', fontWeight: '600' },
  card:       { background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: '700px' },
  msg:        { padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  msgSuccess: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' },
  msgError:   { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' },
  input:      { width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  hint:       { fontSize: '12px', color: '#9ca3af', marginTop: '4px', display: 'block' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  threeCol:   { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' },
  checkRow:   { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  checkLabel: { fontSize: '14px', color: '#374151', cursor: 'pointer' },
  dayRow:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' },
  dayName:    { width: '100px', fontSize: '14px', fontWeight: '500', color: '#374151' },
  timeInput:  { border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 10px', fontSize: '13px' },
  saveBtn:    { background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
};

export default RestaurantSetup;