import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FOOD_TYPE_COLORS = {
  veg:       { bg: '#F0F7EE', color: '#3F7D33', dot: '#3F7D33', label: 'Veg' },
  'non-veg': { bg: '#FBEEEB', color: '#B33F2C', dot: '#B33F2C', label: 'Non-Veg' },
  vegan:     { bg: '#EAF3E4', color: '#2F5E24', dot: '#2F5E24', label: 'Vegan' },
  egg:       { bg: '#FBF3E6', color: '#A97E44', dot: '#A97E44', label: 'Egg' },
};

// ─── INITIAL FORM STATES ─────────────────────────────────
const EMPTY_CATEGORY = { name: '', description: '', sort_order: 0 };
const EMPTY_ITEM = {
  name: '', description: '', price: '',
  category_id: '', food_type: 'veg',
  preparation_time: 15, calories: '', sort_order: 0
};
const EMPTY_VARIANT = { name: '', price: '', is_default: false };

// ═══════════════════════════════════════════════════════════
const Menu = () => {
  const navigate = useNavigate();

  const [categories,     setCategories]     = useState([]);
  const [items,          setItems]          = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading,        setLoading]        = useState(true);
  const [msg,            setMsg]            = useState({ type: '', text: '' });

  // Modals
  const [showCatForm,     setShowCatForm]     = useState(false);
  const [showItemForm,    setShowItemForm]     = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);

  // Forms
  const [catForm,     setCatForm]     = useState(EMPTY_CATEGORY);
  const [itemForm,    setItemForm]    = useState(EMPTY_ITEM);
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT);

  // Edit states
  const [editingCat,  setEditingCat]  = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [variantItemId, setVariantItemId] = useState(null);

  // ── Fetch ────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await api.get('/menu/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Categories fetch failed:', err);
    }
  };

  const fetchItems = async (category_id = null) => {
    try {
      const url = category_id
        ? `/menu/items?category_id=${category_id}`
        : '/menu/items';
      const res = await api.get(url);
      setItems(res.data.data);
    } catch (err) {
      console.error('Items fetch failed:', err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchCategories();
      await fetchItems();
      setLoading(false);
    };
    load();
  }, []);

  // Category filter change
  const handleCategoryFilter = (cat_id) => {
    setActiveCategory(cat_id);
    fetchItems(cat_id === 'all' ? null : cat_id);
  };

  // ── Message helper ───────────────────────────────────────
  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // ═══════════════════════════════════════════════
  //  CATEGORY HANDLERS
  // ═══════════════════════════════════════════════

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/menu/categories/${editingCat.id}`, catForm);
        showMsg('success', 'Category updated!');
      } else {
        await api.post('/menu/categories', catForm);
        showMsg('success', 'Category created!');
      }
      setCatForm(EMPTY_CATEGORY);
      setEditingCat(null);
      setShowCatForm(false);
      fetchCategories();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save category');
    }
  };

  const handleEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || '', sort_order: cat.sort_order });
    setShowCatForm(true);
    setShowItemForm(false);
  };

  const handleDeleteCat = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/menu/categories/${id}`);
      showMsg('success', `"${name}" deleted`);
      fetchCategories();
      fetchItems();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete');
    }
  };

  // ═══════════════════════════════════════════════
  //  ITEM HANDLERS
  // ═══════════════════════════════════════════════

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/menu/items/${editingItem.id}`, itemForm);
        showMsg('success', 'Item updated!');
      } else {
        await api.post('/menu/items', itemForm);
        showMsg('success', 'Item added!');
      }
      setItemForm(EMPTY_ITEM);
      setEditingItem(null);
      setShowItemForm(false);
      fetchItems(activeCategory === 'all' ? null : activeCategory);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name:             item.name,
      description:      item.description  || '',
      price:            item.price,
      category_id:      item.category_id,
      food_type:        item.food_type,
      preparation_time: item.preparation_time,
      calories:         item.calories     || '',
      sort_order:       item.sort_order
    });
    setShowItemForm(true);
    setShowCatForm(false);
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/menu/items/${id}`);
      showMsg('success', `"${name}" deleted`);
      fetchItems(activeCategory === 'all' ? null : activeCategory);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete');
    }
  };

  const handleToggle = async (id, name, current) => {
    try {
      await api.put(`/menu/items/${id}/toggle`);
      showMsg('success', `"${name}" marked ${!current ? 'available' : 'unavailable'}`);
      fetchItems(activeCategory === 'all' ? null : activeCategory);
    } catch (err) {
      showMsg('error', 'Could not toggle availability');
    }
  };

  // ═══════════════════════════════════════════════
  //  VARIANT HANDLERS
  // ═══════════════════════════════════════════════

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/menu/items/${variantItemId}/variants`, variantForm);
      showMsg('success', 'Variant added!');
      setVariantForm(EMPTY_VARIANT);
      setShowVariantForm(false);
      setVariantItemId(null);
      fetchItems(activeCategory === 'all' ? null : activeCategory);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not add variant');
    }
  };

  const handleDeleteVariant = async (id) => {
    if (!window.confirm('Delete this variant?')) return;
    try {
      await api.delete(`/menu/variants/${id}`);
      showMsg('success', 'Variant deleted');
      fetchItems(activeCategory === 'all' ? null : activeCategory);
    } catch (err) {
      showMsg('error', 'Could not delete variant');
    }
  };

  // ── Reset forms ──────────────────────────────────────────
  const openAddCat = () => {
    setEditingCat(null);
    setCatForm(EMPTY_CATEGORY);
    setShowCatForm(true);
    setShowItemForm(false);
    setShowVariantForm(false);
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemForm(EMPTY_ITEM);
    setShowItemForm(true);
    setShowCatForm(false);
    setShowVariantForm(false);
  };

  const openAddVariant = (itemId) => {
    setVariantItemId(itemId);
    setVariantForm(EMPTY_VARIANT);
    setShowVariantForm(true);
    setShowCatForm(false);
    setShowItemForm(false);
  };

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rmenu-outline-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FFFFFF;
        border: 1px solid #D8D1C2;
        color: #1A1815;
        border-radius: 4px;
        padding: 9px 16px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: border-color 0.15s ease, background 0.15s ease;
      }
      .rmenu-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rmenu-primary-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #1A1815;
        color: #F7F5F0;
        border: none;
        border-radius: 4px;
        padding: 9px 16px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rmenu-primary-btn:hover { background: #A97E44; }

      .rmenu-cat-item { transition: background 0.15s ease, color 0.15s ease; }
      .rmenu-cat-item:hover:not(.rmenu-cat-active) { background: #FBF8F2; }

      .rmenu-icon-btn { transition: opacity 0.15s ease; opacity: 0.55; }
      .rmenu-icon-btn:hover { opacity: 1; }

      .rmenu-input, select.rmenu-input {
        font-family: 'JetBrains Mono', monospace;
        border: 1px solid #D8D1C2;
        border-radius: 4px;
        padding: 8px 10px;
        font-size: 13px;
        color: #1A1815;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        background: #FFFFFF;
        transition: border-color 0.15s ease;
      }
      .rmenu-input:focus { border-color: #A97E44; }
      select.rmenu-input { cursor: pointer; }

      .rmenu-check { accent-color: #A97E44; width: 15px; height: 15px; cursor: pointer; }

      .rmenu-item-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
      .rmenu-item-card:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(26,24,21,0.08); }

      .rmenu-action-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #F5F1E9;
        color: #1A1815;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rmenu-action-btn:hover { background: #EDE7DA; }

      .rmenu-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rmenu-delete-btn:hover { background: #F6DFD9; }

      .rmenu-toggle-btn {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
      }

      .rmenu-variant-del {
        background: none; border: none; color: #B33F2C; cursor: pointer; font-size: 12px; padding: 0 4px;
      }

      @media (max-width: 860px) {
        .rmenu-layout { grid-template-columns: 1fr !important; }
        .rmenu-form-row { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 560px) {
        .rmenu-header { flex-direction: column !important; align-items: flex-start !important; }
      }
    `}</style>
  );

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING MENU…
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div style={s.page}>
      <GlobalStyle />

      {/* Header */}
      <div className="rmenu-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>MENU CARD</span>
          <h1 style={s.title}>Menu Management</h1>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rmenu-outline-btn">← Dashboard</button>
          <button onClick={openAddCat}  className="rmenu-outline-btn">+ Category</button>
          <button onClick={openAddItem} className="rmenu-primary-btn">+ Add Item</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      <div className="rmenu-layout" style={s.layout}>

        {/* ── LEFT: Categories ─────────────────────────── */}
        <div style={s.sidebar}>
          <h2 style={s.sideTitle}>Categories</h2>

          {/* All filter */}
          <div
            onClick={() => handleCategoryFilter('all')}
            className={`rmenu-cat-item ${activeCategory === 'all' ? 'rmenu-cat-active' : ''}`}
            style={{ ...s.catItem, ...(activeCategory === 'all' ? s.catActive : {}) }}
          >
            <span>All Items</span>
            <span style={{ ...s.catCount, ...(activeCategory === 'all' ? s.catCountActive : {}) }}>{items.length}</span>
          </div>

          {categories.map(cat => (
            <div key={cat.id}
              className={`rmenu-cat-item ${activeCategory === cat.id ? 'rmenu-cat-active' : ''}`}
              style={{ ...s.catItem, ...(activeCategory === cat.id ? s.catActive : {}) }}
            >
              <div
                onClick={() => handleCategoryFilter(cat.id)}
                style={{ flex: 1, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{cat.name}</span>
                <span style={{ ...s.catCount, ...(activeCategory === cat.id ? s.catCountActive : {}) }}>{cat.MenuItems?.length || 0}</span>
              </div>
              <div style={s.catActions}>
                <button onClick={() => handleEditCat(cat)} className="rmenu-icon-btn" style={s.iconBtn}>✏️</button>
                <button onClick={() => handleDeleteCat(cat.id, cat.name)} className="rmenu-icon-btn" style={s.iconBtn}>🗑️</button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <p style={s.empty}>No categories yet — use "+ Category" above to add one</p>
          )}
        </div>

        {/* ── RIGHT: Items + Forms ─────────────────────── */}
        <div style={s.main}>

          {/* Category Form */}
          {showCatForm && (
            <div style={s.formCard}>
              <div style={s.perforation} />
              <h3 style={s.formTitle}>
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleCatSubmit}>
                <div className="rmenu-form-row" style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Category Name *</label>
                    <input
                      value={catForm.name}
                      onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                      placeholder="Starters, Main Course..."
                      className="rmenu-input" required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Description</label>
                    <input
                      value={catForm.description}
                      onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                      placeholder="Optional"
                      className="rmenu-input"
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Sort Order</label>
                    <input
                      type="number" min={0}
                      value={catForm.sort_order}
                      onChange={e => setCatForm({ ...catForm, sort_order: Number(e.target.value) })}
                      className="rmenu-input"
                    />
                  </div>
                </div>
                <div style={s.formActions}>
                  <button type="submit" className="rmenu-primary-btn">
                    {editingCat ? 'Update' : 'Create'}
                  </button>
                  <button type="button"
                    onClick={() => { setShowCatForm(false); setEditingCat(null); }}
                    className="rmenu-outline-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Item Form */}
          {showItemForm && (
            <div style={s.formCard}>
              <div style={s.perforation} />
              <h3 style={s.formTitle}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <form onSubmit={handleItemSubmit}>
                <div className="rmenu-form-row" style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Item Name *</label>
                    <input
                      value={itemForm.name}
                      onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder="Butter Chicken"
                      className="rmenu-input" required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Category *</label>
                    <select
                      value={itemForm.category_id}
                      onChange={e => setItemForm({ ...itemForm, category_id: e.target.value })}
                      className="rmenu-input" required
                    >
                      <option value="">-- Select --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Price (₹) *</label>
                    <input
                      type="number" min={0} step={0.01}
                      value={itemForm.price}
                      onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                      placeholder="299"
                      className="rmenu-input" required
                    />
                  </div>
                </div>
                <div className="rmenu-form-row" style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Food Type</label>
                    <select
                      value={itemForm.food_type}
                      onChange={e => setItemForm({ ...itemForm, food_type: e.target.value })}
                      className="rmenu-input"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                      <option value="vegan">Vegan</option>
                      <option value="egg">Egg</option>
                    </select>
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Prep Time (min)</label>
                    <input
                      type="number" min={1}
                      value={itemForm.preparation_time}
                      onChange={e => setItemForm({ ...itemForm, preparation_time: Number(e.target.value) })}
                      className="rmenu-input"
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Calories</label>
                    <input
                      type="number" min={0}
                      value={itemForm.calories}
                      onChange={e => setItemForm({ ...itemForm, calories: e.target.value })}
                      placeholder="Optional"
                      className="rmenu-input"
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={s.label}>Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Item description (optional)"
                    rows={2}
                    className="rmenu-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={s.formActions}>
                  <button type="submit" className="rmenu-primary-btn">
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                  <button type="button"
                    onClick={() => { setShowItemForm(false); setEditingItem(null); }}
                    className="rmenu-outline-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Variant Form */}
          {showVariantForm && (
            <div style={s.formCard}>
              <div style={s.perforation} />
              <h3 style={s.formTitle}>Add Variant</h3>
              <form onSubmit={handleVariantSubmit}>
                <div className="rmenu-form-row" style={s.formRow}>
                  <div style={s.field}>
                    <label style={s.label}>Variant Name *</label>
                    <input
                      value={variantForm.name}
                      onChange={e => setVariantForm({ ...variantForm, name: e.target.value })}
                      placeholder="Half, Full, Small, Large"
                      className="rmenu-input" required
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Price (₹) *</label>
                    <input
                      type="number" min={0}
                      value={variantForm.price}
                      onChange={e => setVariantForm({ ...variantForm, price: e.target.value })}
                      placeholder="199"
                      className="rmenu-input" required
                    />
                  </div>
                  <div style={{ ...s.field, justifyContent: 'flex-end', paddingBottom: '9px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#1A1815', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={variantForm.is_default}
                        onChange={e => setVariantForm({ ...variantForm, is_default: e.target.checked })}
                        className="rmenu-check"
                      />
                      Default variant
                    </label>
                  </div>
                </div>
                <div style={s.formActions}>
                  <button type="submit" className="rmenu-primary-btn">Add Variant</button>
                  <button type="button"
                    onClick={() => { setShowVariantForm(false); setVariantItemId(null); }}
                    className="rmenu-outline-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Items List */}
          <div style={s.itemsHeader}>
            <h2 style={s.sideTitle}>
              {activeCategory === 'all'
                ? `All Items (${items.length})`
                : `${categories.find(c => c.id === activeCategory)?.name || ''} (${items.length})`
              }
            </h2>
          </div>

          {items.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ margin: '0 0 4px', color: '#1A1815', fontWeight: '600', fontSize: '14px' }}>No items yet.</p>
              <p style={{ color: '#B9B0A0', fontSize: '13px', margin: 0 }}>
                Use "+ Add Item" above to add items.
              </p>
            </div>
          ) : (
            <div style={s.itemsGrid}>
              {items.map(item => {
                const ft = FOOD_TYPE_COLORS[item.food_type] || FOOD_TYPE_COLORS.veg;
                return (
                  <div key={item.id} className="rmenu-item-card" style={{
                    ...s.itemCard,
                    opacity: item.is_available ? 1 : 0.6
                  }}>
                    <div style={s.itemClip} />

                    {/* Item Top Row */}
                    <div style={s.itemTop}>
                      <div style={{ flex: 1 }}>
                        <div style={s.itemName}>{item.name}</div>
                        <div style={s.itemCat}>{item.MenuCategory?.name}</div>
                      </div>
                      <span style={{ ...s.badge, background: ft.bg, color: ft.color }}>
                        <span style={{ ...s.badgeDot, background: ft.dot }} />
                        {ft.label}
                      </span>
                    </div>

                    {/* Price */}
                    <div style={s.itemPrice}>₹{item.price}</div>

                    {/* Description */}
                    {item.description && (
                      <p style={s.itemDesc}>{item.description}</p>
                    )}

                    {/* Meta */}
                    <div style={s.itemMeta}>
                      <span>⏱ {item.preparation_time} min</span>
                      {item.calories && <span>🔥 {item.calories} cal</span>}
                    </div>

                    {/* Variants */}
                    {item.MenuVariants && item.MenuVariants.length > 0 && (
                      <div style={s.variantSection}>
                        <p style={s.variantTitle}>Variants:</p>
                        {item.MenuVariants.map(v => (
                          <div key={v.id} style={s.variantRow}>
                            <span style={{ fontSize: '12px', color: '#1A1815' }}>
                              {v.name} {v.is_default && '(default)'}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A1815' }}>₹{v.price}</span>
                            <button
                              onClick={() => handleDeleteVariant(v.id)}
                              className="rmenu-variant-del"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={s.itemActions}>
                      <button
                        onClick={() => handleToggle(item.id, item.name, item.is_available)}
                        className="rmenu-toggle-btn"
                        style={{
                          background: item.is_available ? '#F0F7EE' : '#FBEEEB',
                          color:      item.is_available ? '#3F7D33' : '#B33F2C',
                          border:     `1px solid ${item.is_available ? '#CFE3C6' : '#EBC7BC'}`
                        }}
                      >
                        {item.is_available ? 'Available ✓' : 'Unavailable'}
                      </button>
                      <button onClick={() => openAddVariant(item.id)} className="rmenu-action-btn">+ Variant</button>
                      <button onClick={() => handleEditItem(item)}     className="rmenu-action-btn">Edit</button>
                      <button onClick={() => handleDeleteItem(item.id, item.name)} className="rmenu-delete-btn">Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── STYLES ──────────────────────────────────────────────
const s = {
  page:     { padding: '32px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },

  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' },
  eyebrow:     { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
  title:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  headerBtns:  { display: 'flex', gap: '10px', flexWrap: 'wrap' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '18px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  layout: { display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' },

  // Sidebar
  sidebar:   { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '18px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', height: 'fit-content' },
  sideTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.04em', color: '#1A1815', margin: '0 0 12px' },
  catItem:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: '4px', cursor: 'pointer', marginBottom: '3px', color: '#1A1815', fontSize: '13px' },
  catActive: { background: '#FBF3E6', color: '#1A1815', fontWeight: '700' },
  catCount:      { background: '#F0EDE4', color: '#7A7264', fontSize: '10.5px', fontWeight: '600', padding: '1px 7px', borderRadius: '999px' },
  catCountActive:{ background: '#EAD9BE', color: '#8B5F2A' },
  catActions:    { display: 'flex', gap: '4px', marginLeft: '6px' },
  iconBtn:       { background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px' },
  empty:         { fontSize: '12.5px', color: '#B9B0A0', marginTop: '8px', lineHeight: '1.5' },

  // Main
  main:        { flex: 1, minWidth: 0 },
  formCard:    { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '22px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.01em', margin: '0 0 16px', color: '#1A1815' },
  formRow:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '14px' },
  formActions: { display: 'flex', gap: '10px', marginTop: '8px' },
  field:       { display: 'flex', flexDirection: 'column' },
  label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '7px' },

  // Items
  itemsHeader: { marginBottom: '12px' },
  itemsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' },
  itemCard:    { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative', overflow: 'hidden' },
  itemClip:    { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  itemTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  itemName:    { fontSize: '14.5px', fontWeight: '700', color: '#1A1815' },
  itemCat:     { fontSize: '11.5px', color: '#B9B0A0', marginTop: '2px' },
  itemPrice:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.02em', color: '#1A1815', margin: '4px 0' },
  itemDesc:    { fontSize: '12px', color: '#7A7264', margin: '4px 0 8px', lineHeight: '1.4' },
  itemMeta:    { display: 'flex', gap: '12px', fontSize: '11.5px', color: '#B9B0A0', marginBottom: '10px' },
  badge:       { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: '700', padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap' },
  badgeDot:    { width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' },

  variantSection: { borderTop: '1px dashed #E9E3D6', paddingTop: '9px', marginTop: '9px', marginBottom: '9px' },
  variantTitle:   { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.06em', color: '#7A7264', margin: '0 0 5px', textTransform: 'uppercase' },
  variantRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', gap: '8px' },

  itemActions: { display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' },
  emptyState:  { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default Menu;