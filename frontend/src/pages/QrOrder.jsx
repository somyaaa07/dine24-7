import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

// Public, no-auth page a customer lands on after scanning the table QR code.
// Expected URL: /order?tenant_id=<tenant uuid>&table=<table_number>
const QrOrder = () => {
  const [searchParams] = useSearchParams();
  const tenant_id = searchParams.get('tenant_id');
  const tableParam = searchParams.get('table');

  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({}); // { `${menuItemId}:${variantId||''}`: { menu_item_id, menu_variant_id, name, price, quantity } }
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [trackData, setTrackData] = useState(null);

  useEffect(() => {
    if (!tenant_id) {
      setError('Missing tenant_id in the QR link.');
      setLoading(false);
      return;
    }
    const fetchMenu = async () => {
      try {
        const params = { tenant_id };
        if (tableParam) params.table = tableParam;
        const res = await api.get('/qr/menu', { params });
        setMenuData(res.data.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load the menu. Please try scanning again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [tenant_id, tableParam]);

  const cartItems = Object.values(cart);
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [cartItems]
  );
  const cartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  const addToCart = (menuItem, variant) => {
    const key = `${menuItem.id}:${variant?.id || ''}`;
    setCart(prev => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          menu_item_id: menuItem.id,
          menu_variant_id: variant?.id || null,
          name: variant ? `${menuItem.name} (${variant.name})` : menuItem.name,
          price: parseFloat(variant ? variant.price : menuItem.price),
          quantity: existing ? existing.quantity + 1 : 1
        }
      };
    });
  };

  const changeQty = (key, delta) => {
    setCart(prev => {
      const item = prev[key];
      if (!item) return prev;
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { ...item, quantity: nextQty } };
    });
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacing(true);
    setError('');
    try {
      const payload = {
        tenant_id,
        table_id: menuData?.table?.id || null,
        items: cartItems.map(it => ({
          menu_item_id: it.menu_item_id,
          menu_variant_id: it.menu_variant_id,
          quantity: it.quantity
        })),
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined
      };
      const res = await api.post('/qr/order', payload);
      setPlacedOrder(res.data.data);
      setCart({});
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const trackOrder = async () => {
    if (!placedOrder?.order_number) return;
    try {
      const res = await api.get('/qr/track', { params: { order_number: placedOrder.order_number, tenant_id } });
      setTrackData(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not fetch order status.');
    }
  };

  if (loading) return <div style={s.centered}>Loading menu…</div>;

  if (error && !menuData) {
    return <div style={s.centered}><p style={{ color: '#B33F2C' }}>{error}</p></div>;
  }

  if (placedOrder) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h2 style={{ marginTop: 0 }}>✅ Order placed!</h2>
          <p>Order number: <strong>{placedOrder.order_number}</strong></p>
          <p>Total: <strong>₹{placedOrder.total_amount}</strong></p>
          <p style={{ color: '#7A7264' }}>The kitchen has received your order — sit back, someone will bring it out shortly.</p>
          <button style={s.primaryBtn} onClick={trackOrder}>Refresh status</button>
          {trackData && (
            <div style={{ marginTop: 16 }}>
              <p>Status: <strong>{trackData.status}</strong></p>
              <ul>
                {trackData.items?.map((it, i) => (
                  <li key={i}>{it.name} × {it.quantity} — {it.status}</li>
                ))}
              </ul>
            </div>
          )}
          <button style={s.secondaryBtn} onClick={() => { setPlacedOrder(null); setTrackData(null); }}>
            Order more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={{ margin: 0 }}>{menuData.restaurant.name}</h1>
        {menuData.table && <p style={{ color: '#7A7264', margin: '4px 0 0' }}>Table {menuData.table.table_number}</p>}
      </div>

      {error && <p style={{ color: '#B33F2C' }}>{error}</p>}

      {menuData.menu.map(category => (
        <div key={category.id} style={{ marginBottom: 24 }}>
          <h3 style={s.categoryTitle}>{category.name}</h3>
          {(category.MenuItems || []).map(item => (
            <div key={item.id} style={s.itemRow}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                {item.description && <p style={{ margin: '2px 0', fontSize: 12, color: '#7A7264' }}>{item.description}</p>}
                {(item.MenuVariants && item.MenuVariants.length > 0) ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {item.MenuVariants.map(v => (
                      <button key={v.id} style={s.variantBtn} onClick={() => addToCart(item, v)}>
                        {v.name} — {menuData.restaurant.currency_symbol}{v.price}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button style={s.addBtn} onClick={() => addToCart(item, null)}>
                    Add — {menuData.restaurant.currency_symbol}{item.price}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {cartCount > 0 && (
        <div style={s.cartBar}>
          <div style={{ flex: 1 }}>
            {cartItems.map(it => {
              const key = `${it.menu_item_id}:${it.menu_variant_id || ''}`;
              return (
                <div key={key} style={s.cartRow}>
                  <span>{it.name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button style={s.qtyBtn} onClick={() => changeQty(key, -1)}>−</button>
                    {it.quantity}
                    <button style={s.qtyBtn} onClick={() => changeQty(key, 1)}>+</button>
                  </span>
                </div>
              );
            })}
            <input
              placeholder="Your name (optional)"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              style={s.input}
            />
            <input
              placeholder="Phone (optional)"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              style={s.input}
            />
          </div>
          <button style={s.primaryBtn} disabled={placing} onClick={placeOrder}>
            {placing ? 'Placing…' : `Place order — ₹${cartTotal.toFixed(0)}`}
          </button>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { padding: 20, maxWidth: 560, margin: '0 auto', fontFamily: 'sans-serif', paddingBottom: 160 },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' },
  header: { marginBottom: 20 },
  categoryTitle: { borderBottom: '1px solid #E9E3D6', paddingBottom: 6 },
  itemRow: { padding: '10px 0', borderBottom: '1px dashed #E9E3D6' },
  addBtn: { marginTop: 6, background: '#1A1815', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' },
  variantBtn: { background: '#fff', border: '1px solid #D8D1C2', borderRadius: 4, padding: '6px 10px', cursor: 'pointer' },
  cartBar: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #E9E3D6', padding: 14, boxShadow: '0 -4px 12px rgba(0,0,0,0.08)' },
  cartRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 },
  qtyBtn: { width: 22, height: 22, border: '1px solid #D8D1C2', background: '#fff', borderRadius: 4, cursor: 'pointer' },
  input: { width: '100%', boxSizing: 'border-box', margin: '6px 0', padding: 8, border: '1px solid #D8D1C2', borderRadius: 4 },
  primaryBtn: { width: '100%', marginTop: 8, background: '#1A1815', color: '#fff', border: 'none', borderRadius: 4, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { marginTop: 12, background: 'none', border: '1px solid #D8D1C2', borderRadius: 4, padding: '8px 14px', cursor: 'pointer' },
  card: { maxWidth: 420, margin: '80px auto', padding: 24, border: '1px solid #E9E3D6', borderRadius: 8 },
};

export default QrOrder;
