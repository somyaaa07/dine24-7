import { useEffect, useState } from 'react';
import useBranchStore from '../store/branchStore';
import api from '../api';

const EMPTY_FORM = { name: '', address: '', phone: '' };

const BranchSelector = () => {
  const { branches, selectedBranchId, setSelectedBranchId, fetchBranches, loading } = useBranchStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (branches.length === 0) fetchBranches();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Branch name is required');
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/branches', form);
      await fetchBranches();
      setSelectedBranchId(res.data.data.id);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not create branch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {!loading && branches.length > 1 && (
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            style={styles.select}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                🏢 {b.name}{b.is_main ? ' (Main)' : ''}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          style={styles.addBtn}
        >
          + Branch
        </button>
      </div>

      {showForm && (
        <div style={styles.popover}>
          <form onSubmit={handleCreate}>
            <input
              placeholder="Branch name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={styles.input}
              autoFocus
            />
            <input
              placeholder="Address (optional)"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={styles.input}
            />
            {error && <p style={styles.error}>{error}</p>}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button type="submit" disabled={saving} style={styles.saveBtn}>
                {saving ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(''); }} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  select: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #D8D1C2',
    background: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  addBtn: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #1A1815',
    background: '#fff',
    color: '#1A1815',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer'
  },
  popover: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: '#fff',
    border: '1px solid #D8D1C2',
    borderRadius: 8,
    padding: 12,
    width: 220,
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 50
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: 8,
    marginBottom: 6,
    border: '1px solid #D8D1C2',
    borderRadius: 4,
    fontSize: 13
  },
  saveBtn: {
    flex: 1,
    background: '#1A1815',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '8px 0',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13
  },
  cancelBtn: {
    flex: 1,
    background: '#fff',
    border: '1px solid #D8D1C2',
    borderRadius: 4,
    padding: '8px 0',
    cursor: 'pointer',
    fontSize: 13
  },
  error: {
    color: '#B33F2C',
    fontSize: 11,
    margin: '4px 0'
  }
};

export default BranchSelector;