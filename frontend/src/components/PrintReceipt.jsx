import { useEffect, useState } from 'react';
import api from '../api';

// type: 'kot' | 'bill'
// orderId: the order's id
// onClose: called when the modal is dismissed
const PrintReceipt = ({ type, orderId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/orders/${orderId}/${type}`);
        setData(res.data.data);
        if (res.data.data?.customer_email) setEmailTo(res.data.data.customer_email);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load receipt');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, orderId]);

  const handlePrint = () => window.print();

  const handleEmailSend = async () => {
    if (!emailTo) return setEmailMsg('Enter an email address first');
    setSendingEmail(true);
    setEmailMsg('');
    try {
      const res = await api.post(`/orders/${orderId}/bill/email`, { to_email: emailTo });
      setEmailMsg(res.data.message || 'Bill emailed!');
    } catch (err) {
      setEmailMsg(err?.response?.data?.message || 'Could not send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={s.overlay}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .pr-print-area, .pr-print-area * { visibility: visible; }
          .pr-print-area { position: absolute; top: 0; left: 0; width: 80mm; padding: 8px; }
          .pr-no-print { display: none !important; }
        }
      `}</style>

      <div style={s.modal}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#B33F2C' }}>{error}</p>}

        {data && (
          <div className="pr-print-area" style={s.receipt}>
            {type === 'bill' && <h2 style={s.center}>{data.restaurant_name}</h2>}
            {type === 'kot' && <h2 style={s.center}>KITCHEN ORDER TICKET</h2>}

            <p style={s.line}>Order: {data.order_number}</p>
            <p style={s.line}>Table: {data.table}</p>
            <p style={s.line}>{new Date(data.created_at).toLocaleString()}</p>
            <hr />

            {data.items.map((item, i) => (
              <div key={i} style={s.itemRow}>
                <span>{item.quantity} x {item.name}</span>
                {type === 'bill' && <span>{data.currency_symbol}{item.total_price}</span>}
              </div>
            ))}
            {type === 'kot' && data.items.some(i => i.note) && (
              <>
                <hr />
                {data.items.filter(i => i.note).map((i, idx) => (
                  <p key={idx} style={s.note}>* {i.name}: {i.note}</p>
                ))}
              </>
            )}

            {type === 'bill' && (
              <>
                <hr />
                <div style={s.itemRow}><span>Subtotal</span><span>{data.currency_symbol}{data.subtotal}</span></div>
                <div style={s.itemRow}><span>Tax</span><span>{data.currency_symbol}{data.tax_amount}</span></div>
                {data.discount_amount > 0 && (
                  <div style={s.itemRow}><span>Discount</span><span>-{data.currency_symbol}{data.discount_amount}</span></div>
                )}
                <div style={{ ...s.itemRow, fontWeight: 700, fontSize: 16 }}>
                  <span>Total</span><span>{data.currency_symbol}{data.total_amount}</span>
                </div>
                {data.payment_method && <p style={s.line}>Paid via: {data.payment_method}</p>}
              </>
            )}
          </div>
        )}

        {type === 'bill' && data && (
          <div className="pr-no-print" style={s.emailBox}>
            <input
              type="email"
              placeholder="customer@email.com"
              value={emailTo}
              onChange={e => setEmailTo(e.target.value)}
              style={s.emailInput}
            />
            <button style={s.emailBtn} onClick={handleEmailSend} disabled={sendingEmail}>
              {sendingEmail ? 'Sending...' : '✉️ Email Bill'}
            </button>
            {emailMsg && <p style={s.emailMsg}>{emailMsg}</p>}
          </div>
        )}

        <div className="pr-no-print" style={s.actions}>
          <button style={s.printBtn} onClick={handlePrint} disabled={!data}>Print</button>
          <button style={s.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 8, padding: 20, width: 340, maxHeight: '85vh', overflowY: 'auto' },
  receipt: { fontFamily: 'monospace', fontSize: 13 },
  center: { textAlign: 'center', margin: '0 0 8px' },
  line: { margin: '2px 0' },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '2px 0' },
  note: { fontSize: 12, fontStyle: 'italic', margin: '2px 0' },
  actions: { display: 'flex', gap: 8, marginTop: 16 },
  printBtn: { flex: 1, background: '#1A1815', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 0', cursor: 'pointer', fontWeight: 700 },
  closeBtn: { flex: 1, background: '#fff', border: '1px solid #D8D1C2', borderRadius: 4, padding: '10px 0', cursor: 'pointer' },
  emailBox: { marginTop: 16, paddingTop: 12, borderTop: '1px dashed #D8D1C2' },
  emailInput: { width: '100%', boxSizing: 'border-box', padding: 8, border: '1px solid #D8D1C2', borderRadius: 4, marginBottom: 6, fontSize: 13 },
  emailBtn: { width: '100%', background: '#fff', border: '1px solid #1A1815', color: '#1A1815', borderRadius: 4, padding: '8px 0', cursor: 'pointer', fontWeight: 700 },
  emailMsg: { fontSize: 12, color: '#7A7264', marginTop: 6, textAlign: 'center' },
};

export default PrintReceipt;