import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PrintReceipt from '../components/PrintReceipt';

const POS = () => {
  const navigate = useNavigate();

  const [tables,      setTables]      = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [menuItems,   setMenuItems]   = useState([]);
  const [activeTable, setActiveTable] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart,        setCart]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [msg,         setMsg]         = useState({ type: '', text: '' });

  // Payment modal
  const [showPayment,    setShowPayment]    = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [printBillOrderId, setPrintBillOrderId] = useState(null);
  const [currentOrder,   setCurrentOrder]   = useState(null);

  // Order type
  const [orderType, setOrderType] = useState('dine_in');

  // Fetch data
  useEffect(() => {
    const load = async () => {
      try {
        const [tablesRes, menuRes] = await Promise.all([
          api.get('/tables'),
          api.get('/menu/full')
        ]);
        setTables(tablesRes.data.data.tables || []);
        setCategories(menuRes.data.data || []);

        const allItems = (menuRes.data.data || []).flatMap(cat =>
          (cat.MenuItems || []).map(item => ({ ...item, category_name: cat.name }))
        );
        setMenuItems(allItems);
      } catch (err) {
        console.error('POS load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // ── Cart Operations ──────────────────────────────────────
  const addToCart = (item) => {
    const existing = cart.find(c => c.menu_item_id === item.id);
    if (existing) {
      setCart(cart.map(c =>
        c.menu_item_id === item.id
          ? { ...c, quantity: c.quantity + 1, total_price: (c.quantity + 1) * c.unit_price }
          : c
      ));
    } else {
      setCart([...cart, {
        menu_item_id: item.id,
        name:         item.name,
        unit_price:   parseFloat(item.price),
        quantity:     1,
        total_price:  parseFloat(item.price),
        note:         ''
      }]);
    }
  };

  const removeFromCart = (menu_item_id) => {
    setCart(cart.filter(c => c.menu_item_id !== menu_item_id));
  };

  const updateQty = (menu_item_id, qty) => {
    if (qty <= 0) return removeFromCart(menu_item_id);
    setCart(cart.map(c =>
      c.menu_item_id === menu_item_id
        ? { ...c, quantity: qty, total_price: qty * c.unit_price }
        : c
    ));
  };

  const updateNote = (menu_item_id, note) => {
    setCart(cart.map(c =>
      c.menu_item_id === menu_item_id ? { ...c, note } : c
    ));
  };

  // ── Totals ───────────────────────────────────────────────
  const subtotal     = cart.reduce((s, c) => s + c.total_price, 0);
  const taxAmount    = subtotal * 0.05;
  const totalAmount  = subtotal + taxAmount - (parseFloat(discountAmount) || 0);

  // ── Place Order ──────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return showMsg('error', 'Cart is empty');
    if (orderType === 'dine_in' && !activeTable) {
      return showMsg('error', 'Select a table');
    }

    try {
      const res = await api.post('/orders', {
        table_id:   activeTable?.id || null,
        order_type: orderType,
        items:      cart.map(c => ({
          menu_item_id: c.menu_item_id,
          quantity:     c.quantity,
          note:         c.note || null
        }))
      });

      setCurrentOrder(res.data.data);
      showMsg('success', `${res.data.data.order_number} placed!`);
      setCart([]);
      setShowPayment(false);

      // Refresh tables
      const tablesRes = await api.get('/tables');
      setTables(tablesRes.data.data.tables || []);

    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not place order');
    }
  };

  // ── Process Payment ──────────────────────────────────────
  const handlePayment = async () => {
    if (!currentOrder) return showMsg('error', 'Place the order first');

    try {
      await api.put(`/orders/${currentOrder.id}/payment`, {
        payment_method: paymentMethod,
        discount_amount: parseFloat(discountAmount) || 0
      });

      showMsg('success', 'Payment collected!');
      setPrintBillOrderId(currentOrder.id);
      setShowPayment(false);
      setCurrentOrder(null);
      setActiveTable(null);
      setDiscountAmount(0);

      const tablesRes = await api.get('/tables');
      setTables(tablesRes.data.data.tables || []);

    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Payment failed');
    }
  };

  // ── Filter items by category ─────────────────────────────
  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.category_id === activeCategory);

  const STATUS_COLOR = {
    available: '#3F7D33',
    occupied:  '#A97E44',
    reserved:  '#3B5170',
    cleaning:  '#7A4B6B'
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rpos-outline-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        border-radius: 4px;
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .rpos-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rpos-type-tab {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 9px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        color: #7A7264;
        transition: all 0.15s ease;
      }
      .rpos-type-active { background: #1A1815 !important; color: #F7F5F0 !important; border-color: #1A1815 !important; }

      .rpos-table-btn { transition: transform 0.1s ease; }
      .rpos-table-btn:hover:not(.rpos-table-disabled) { transform: translateY(-1px); }

      .rpos-cat-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        border-radius: 20px;
        padding: 5px 14px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        color: #7A7264;
        transition: all 0.15s ease;
      }
      .rpos-cat-active { background: #1A1815 !important; color: #F7F5F0 !important; border-color: #1A1815 !important; }

      .rpos-menu-item { transition: transform 0.1s ease, box-shadow 0.15s ease; }
      .rpos-menu-item:hover:not(.rpos-menu-disabled) { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(26,24,21,0.1); }

      .rpos-clear-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: none;
        border-radius: 4px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }
      .rpos-clear-btn:hover { background: #F6DFD9; }

      .rpos-qty-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #F0EDE4;
        border: none;
        border-radius: 4px;
        width: 22px;
        height: 22px;
        cursor: pointer;
        font-weight: 700;
        font-size: 13px;
        color: #1A1815;
      }
      .rpos-qty-btn:hover { background: #EDE7DA; }

      .rpos-note-input {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        border: 1px solid #E9E3D6;
        border-radius: 4px;
        padding: 3px 8px;
        font-size: 11.5px;
        outline: none;
        color: #1A1815;
      }
      .rpos-note-input:focus { border-color: #A97E44; }
      .rpos-note-input::placeholder { color: #B9B0A0; }

      .rpos-remove-btn { background: none; border: none; color: #B33F2C; cursor: pointer; font-size: 13px; }

      .rpos-place-btn {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: #1A1815;
        color: #F7F5F0;
        border: none;
        border-radius: 4px;
        padding: 13px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        margin-top: 10px;
        transition: background 0.15s ease;
      }
      .rpos-place-btn:hover { background: #A97E44; }

      .rpos-method-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        color: #7A7264;
        transition: all 0.15s ease;
      }
      .rpos-method-active { background: #FBF3E6 !important; border-color: #A97E44 !important; color: #8B5F2A !important; }

      .rpos-discount-input {
        font-family: 'JetBrains Mono', monospace;
        flex: 1;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 12.5px;
        outline: none;
        color: #1A1815;
      }
      .rpos-discount-input:focus { border-color: #A97E44; }

      .rpos-pay-btn {
        font-family: 'JetBrains Mono', monospace;
        width: 100%;
        background: #A97E44;
        color: #1A1815;
        border: none;
        border-radius: 4px;
        padding: 13px;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rpos-pay-btn:hover { background: #966E3A; color: #F7F5F0; }

      @media (max-width: 980px) {
        .rpos-layout { grid-template-columns: 1fr !important; height: auto !important; }
        .rpos-right-panel { max-height: 520px; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING POS…
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <GlobalStyle />

      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>POS</h1>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rpos-outline-btn">← Dashboard</button>
          <button onClick={() => navigate('/orders')} className="rpos-outline-btn">All Orders</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      <div className="rpos-layout" style={s.posLayout}>

        {/* ── LEFT: Tables + Menu ───────────────────────── */}
        <div style={s.leftPanel}>

          {/* Order Type */}
          <div style={s.orderTypeTabs}>
            {['dine_in', 'takeaway', 'delivery'].map(type => (
              <button key={type} onClick={() => setOrderType(type)}
                className={`rpos-type-tab ${orderType === type ? 'rpos-type-active' : ''}`}>
                {type === 'dine_in' ? '🍽️ Dine In' : type === 'takeaway' ? '🥡 Takeaway' : '🛵 Delivery'}
              </button>
            ))}
          </div>

          {/* Tables — dine-in only */}
          {orderType === 'dine_in' && (
            <div style={s.tablesSection}>
              <h3 style={s.sectionTitle}>Tables</h3>
              <div style={s.tablesGrid}>
                {tables.map(table => (
                  <div key={table.id}
                    onClick={() => table.status === 'available' || activeTable?.id === table.id
                      ? setActiveTable(activeTable?.id === table.id ? null : table)
                      : null
                    }
                    className={`rpos-table-btn ${table.status === 'occupied' && activeTable?.id !== table.id ? 'rpos-table-disabled' : ''}`}
                    style={{
                      ...s.tableBtn,
                      borderColor: activeTable?.id === table.id ? '#1A1815' :
                                   STATUS_COLOR[table.status] || '#E9E3D6',
                      background:  activeTable?.id === table.id ? '#FBF3E6' : '#fff',
                      cursor:      table.status === 'available' ? 'pointer' : 'not-allowed',
                      opacity:     table.status === 'occupied' && activeTable?.id !== table.id ? 0.6 : 1
                    }}>
                    <div style={s.tableName}>{table.table_number}</div>
                    <div style={{ ...s.tableStatus, color: STATUS_COLOR[table.status] }}>
                      {table.status}
                    </div>
                    <div style={s.tableCapacity}>👥 {table.capacity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div style={s.catFilter}>
            <button onClick={() => setActiveCategory('all')}
              className={`rpos-cat-btn ${activeCategory === 'all' ? 'rpos-cat-active' : ''}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`rpos-cat-btn ${activeCategory === cat.id ? 'rpos-cat-active' : ''}`}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div style={s.menuGrid}>
            {filteredItems.map(item => (
              <div key={item.id} onClick={() => item.is_available && addToCart(item)}
                className={`rpos-menu-item ${!item.is_available ? 'rpos-menu-disabled' : ''}`}
                style={{
                  ...s.menuItem,
                  opacity: item.is_available ? 1 : 0.4,
                  cursor:  item.is_available ? 'pointer' : 'not-allowed'
                }}>
                <div style={s.menuItemName}>{item.name}</div>
                <div style={s.menuItemCat}>{item.category_name}</div>
                <div style={s.menuItemPrice}>₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Cart (receipt style) ───────────────── */}
        <div className="rpos-right-panel" style={s.rightPanel}>
          <div style={s.perforation} />
          <div style={s.cartHeader}>
            <h3 style={s.cartTitle}>
              🛒 Order
              {activeTable && <span style={s.tableTag}> — {activeTable.table_number}</span>}
            </h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="rpos-clear-btn">Clear</button>
            )}
          </div>

          {/* Cart Items */}
          <div style={s.cartItems}>
            {cart.length === 0 ? (
              <div style={s.cartEmpty}>
                <p style={{ margin: 0 }}>Add items from the menu</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.menu_item_id} style={s.cartItem}>
                  <div style={s.cartItemTop}>
                    <span style={s.cartItemName}>{item.name}</span>
                    <span style={s.cartItemPrice}>₹{item.total_price.toFixed(2)}</span>
                  </div>
                  <div style={s.cartItemBottom}>
                    <div style={s.qtyControls}>
                      <button onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}
                        className="rpos-qty-btn">−</button>
                      <span style={s.qtyVal}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}
                        className="rpos-qty-btn">+</button>
                    </div>
                    <input
                      value={item.note}
                      onChange={e => updateNote(item.menu_item_id, e.target.value)}
                      placeholder="Note..."
                      className="rpos-note-input"
                    />
                    <button onClick={() => removeFromCart(item.menu_item_id)}
                      className="rpos-remove-btn">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div style={s.totals}>
              <div style={s.totalRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={s.totalRow}>
                <span>Tax (5%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ ...s.totalRow, ...s.grandTotal }}>
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <button onClick={handlePlaceOrder} className="rpos-place-btn">
                Place Order →
              </button>
            </div>
          )}

          {/* Payment Section — after order is placed */}
          {currentOrder && (
            <div style={s.paymentSection}>
              <h4 style={s.paymentTitle}>
                💳 Payment — {currentOrder.order_number}
              </h4>
              <p style={s.paymentTotal}>Total: ₹{currentOrder.total_amount}</p>

              <div style={s.paymentMethods}>
                {['cash', 'card', 'upi', 'wallet'].map(method => (
                  <button key={method} onClick={() => setPaymentMethod(method)}
                    className={`rpos-method-btn ${paymentMethod === method ? 'rpos-method-active' : ''}`}>
                    {method === 'cash' ? '💵 Cash' :
                     method === 'card' ? '💳 Card' :
                     method === 'upi'  ? '📱 UPI'  : '👛 Wallet'}
                  </button>
                ))}
              </div>

              <div style={s.discountRow}>
                <label style={s.discountLabel}>Discount (₹)</label>
                <input type="number" min={0}
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value)}
                  className="rpos-discount-input"
                />
              </div>

              <button onClick={handlePayment} className="rpos-pay-btn">
                Collect Payment ₹{Math.max(0, parseFloat(currentOrder.total_amount) - (parseFloat(discountAmount) || 0)).toFixed(2)}
              </button>
            </div>
          )}
        </div>
      </div>

      {printBillOrderId && (
        <PrintReceipt
          type="bill"
          orderId={printBillOrderId}
          onClose={() => setPrintBillOrderId(null)}
        />
      )}
    </div>
  );
};

const s = {
  page:     { padding: '20px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },

  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '0.02em', color: '#1A1815', margin: 0 },
  headerBtns: { display: 'flex', gap: '8px' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '14px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  posLayout:  { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', height: 'calc(100vh - 100px)' },
  leftPanel:  { display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' },
  rightPanel: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '18px', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', overflow: 'auto', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },

  orderTypeTabs: { display: 'flex', gap: '8px' },

  tablesSection: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '14px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)' },
  sectionTitle:  { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.1em', color: '#7A7264', margin: '0 0 10px', textTransform: 'uppercase' },
  tablesGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' },
  tableBtn:      { border: '2px solid', borderRadius: '4px', padding: '8px 4px', textAlign: 'center' },
  tableName:     { fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.01em', color: '#1A1815' },
  tableStatus:   { fontSize: '9.5px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.03em' },
  tableCapacity: { fontSize: '10.5px', color: '#B9B0A0' },

  catFilter: { display: 'flex', gap: '6px', flexWrap: 'wrap' },

  menuGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' },
  menuItem:      { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '4px', padding: '12px' },
  menuItemName:  { fontSize: '12.5px', fontWeight: '700', color: '#1A1815', marginBottom: '2px' },
  menuItemCat:   { fontSize: '10.5px', color: '#B9B0A0', marginBottom: '8px' },
  menuItemPrice: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.01em', color: '#1A1815' },

  cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  cartTitle:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  tableTag:   { color: '#A97E44' },

  cartItems: { flex: 1, overflowY: 'auto' },
  cartEmpty: { textAlign: 'center', padding: '40px 0', color: '#B9B0A0', fontSize: '13px' },
  cartItem:  { borderBottom: '1px dashed #E9E3D6', paddingBottom: '10px', marginBottom: '10px' },
  cartItemTop:    { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  cartItemName:   { fontSize: '12.5px', fontWeight: '700', color: '#1A1815' },
  cartItemPrice:  { fontSize: '12.5px', fontWeight: '700', color: '#1A1815' },
  cartItemBottom: { display: 'flex', gap: '6px', alignItems: 'center' },
  qtyControls:    { display: 'flex', alignItems: 'center', gap: '4px' },
  qtyVal:         { fontSize: '12.5px', fontWeight: '700', minWidth: '18px', textAlign: 'center', color: '#1A1815' },

  totals:     { borderTop: '1px solid #E9E3D6', paddingTop: '12px', marginTop: '8px' },
  totalRow:   { display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#7A7264', marginBottom: '6px' },
  grandTotal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', color: '#1A1815', fontWeight: 'normal' },

  paymentSection: { borderTop: '1px dashed #D8D1C2', paddingTop: '14px', marginTop: '14px' },
  paymentTitle:   { fontSize: '13px', fontWeight: '700', color: '#1A1815', margin: '0 0 4px' },
  paymentTotal:   { fontSize: '12px', color: '#7A7264', margin: '0 0 10px' },
  paymentMethods: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' },
  discountRow:    { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' },
  discountLabel:  { fontSize: '12px', color: '#7A7264', whiteSpace: 'nowrap' },
};

export default POS;