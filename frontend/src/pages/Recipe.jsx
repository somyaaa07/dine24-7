import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const EMPTY_FORM = {
  menu_item_id:     '',
  name:             '',
  serving_size:     1,
  preparation_time: 15,
  ingredients:      []
};

const EMPTY_ING = {
  inventory_item_id: '',
  quantity:          ''
};

const Recipes = () => {
  const navigate = useNavigate();

  const [recipes,    setRecipes]    = useState([]);
  const [menuItems,  setMenuItems]  = useState([]);
  const [invItems,   setInvItems]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [msg,        setMsg]        = useState({ type: '', text: '' });

  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [ingredients, setIngredients] = useState([{ ...EMPTY_ING }]);
  const [expandedId,  setExpandedId]  = useState(null);

  // ── Fetch ────────────────────────────────────────────────
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recipes');
      setRecipes(res.data.data);
    } catch (err) {
      console.error('Recipes fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get('/menu/items');
      setMenuItems(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchInvItems = async () => {
    try {
      const res = await api.get('/inventory');
      setInvItems(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchRecipes();
    fetchMenuItems();
    fetchInvItems();
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // ── Ingredient Handlers ──────────────────────────────────
  const addIngredient = () => {
    setIngredients([...ingredients, { ...EMPTY_ING }]);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Auto fill recipe name from menu item
  const handleMenuItemChange = (menu_item_id) => {
    const item = menuItems.find(m => m.id === parseInt(menu_item_id));
    setForm({
      ...form,
      menu_item_id,
      name: item ? `${item.name} Recipe` : ''
    });
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validIngredients = ingredients.filter(
      i => i.inventory_item_id && i.quantity
    );

    if (validIngredients.length === 0) {
      return showMsg('error', 'Add at least one ingredient');
    }

    const payload = { ...form, ingredients: validIngredients };

    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, payload);
        showMsg('success', 'Recipe updated!');
      } else {
        await api.post('/recipes', payload);
        showMsg('success', 'Recipe created!');
      }
      setForm(EMPTY_FORM);
      setIngredients([{ ...EMPTY_ING }]);
      setEditingId(null);
      setShowForm(false);
      fetchRecipes();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not save');
    }
  };

  // ── Edit ─────────────────────────────────────────────────
  const handleEdit = (recipe) => {
    setEditingId(recipe.id);
    setForm({
      menu_item_id:     recipe.menu_item_id,
      name:             recipe.name,
      serving_size:     recipe.serving_size,
      preparation_time: recipe.preparation_time,
    });
    setIngredients(
      recipe.RecipeIngredients?.map(ing => ({
        inventory_item_id: ing.inventory_item_id,
        quantity:          ing.quantity
      })) || [{ ...EMPTY_ING }]
    );
    setShowForm(true);
    setExpandedId(null);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete recipe "${name}"?`)) return;
    try {
      await api.delete(`/recipes/${id}`);
      showMsg('success', `"${name}" deleted`);
      fetchRecipes();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Could not delete');
    }
  };

  // ── Menu items without recipe ────────────────────────────
  const recipeMenuItemIds = recipes.map(r => r.menu_item_id);
  const itemsWithoutRecipe = menuItems.filter(m => !recipeMenuItemIds.includes(m.id));

  const GlobalStyle = () => (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

      .rrec-outline-btn {
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
      .rrec-outline-btn:hover { border-color: #A97E44; background: #FBF8F2; }

      .rrec-primary-btn {
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
      .rrec-primary-btn:hover { background: #A97E44; }

      .rrec-input, select.rrec-input {
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
      .rrec-input:focus { border-color: #A97E44; }
      select.rrec-input { cursor: pointer; }
      .rrec-input:disabled { background: #F5F1E9; color: #B9B0A0; cursor: not-allowed; }
      .rrec-input::placeholder { color: #B9B0A0; }

      .rrec-add-ing-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #EDF1F5;
        color: #3B5170;
        border: 1px solid #CBD8E3;
        border-radius: 4px;
        padding: 5px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rrec-add-ing-btn:hover { background: #E0E7EE; }

      .rrec-remove-btn { background: none; border: none; color: #B33F2C; cursor: pointer; font-size: 15px; padding: 0 4px; }

      .rrec-recipe-card { transition: box-shadow 0.15s ease; }
      .rrec-recipe-top { transition: background 0.15s ease; }
      .rrec-recipe-top:hover { background: #FBF9F4; }

      .rrec-edit-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #F0EDE4;
        color: #1A1815;
        border: none;
        border-radius: 4px;
        padding: 7px 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rrec-edit-btn:hover { background: #EDE7DA; }

      .rrec-delete-btn {
        font-family: 'JetBrains Mono', monospace;
        background: #FBEEEB;
        color: #B33F2C;
        border: 1px solid #EBC7BC;
        border-radius: 4px;
        padding: 7px 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rrec-delete-btn:hover { background: #F6DFD9; }

      @media (max-width: 860px) {
        .rrec-form-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 560px) {
        .rrec-header { flex-direction: column !important; align-items: flex-start !important; gap: 14px; }
        .rrec-form-grid { grid-template-columns: 1fr !important; }
        .rrec-ing-row { flex-wrap: wrap !important; }
      }
    `}</style>
  );

  if (loading) {
    return (
      <div style={s.centered}>
        <GlobalStyle />
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#7A7264', letterSpacing: '0.04em' }}>
          LOADING…
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <GlobalStyle />

      {/* Header */}
      <div className="rrec-header" style={s.header}>
        <div>
          <span style={s.eyebrow}>RECIPE BOOK</span>
          <h1 style={s.title}>Recipe Management</h1>
          <p style={s.subtitle}>
            {recipes.length} recipes — {itemsWithoutRecipe.length} items without a recipe
          </p>
        </div>
        <div style={s.headerBtns}>
          <button onClick={() => navigate('/dashboard')} className="rrec-outline-btn">← Dashboard</button>
          <button onClick={() => {
            setEditingId(null);
            setForm(EMPTY_FORM);
            setIngredients([{ ...EMPTY_ING }]);
            setShowForm(true);
          }} className="rrec-primary-btn">+ Add Recipe</button>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div style={{ ...s.msg, ...(msg.type === 'success' ? s.msgOk : s.msgErr) }}>
          {msg.text}
        </div>
      )}

      {/* Warning — items without recipe */}
      {itemsWithoutRecipe.length > 0 && (
        <div style={s.warning}>
          ⚠️ {itemsWithoutRecipe.length} menu items don't have a recipe yet:&nbsp;
          <strong>{itemsWithoutRecipe.slice(0, 3).map(i => i.name).join(', ')}
            {itemsWithoutRecipe.length > 3 ? ` +${itemsWithoutRecipe.length - 3} more` : ''}
          </strong>
          &nbsp;— inventory won't be tracked for these.
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={s.formCard}>
          <div style={s.perforation} />
          <h3 style={s.formTitle}>
            {editingId ? 'Edit Recipe' : 'Add New Recipe'}
          </h3>
          <form onSubmit={handleSubmit}>

            {/* Basic Info */}
            <div className="rrec-form-grid" style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Menu Item *</label>
                <select
                  value={form.menu_item_id}
                  onChange={e => handleMenuItemChange(e.target.value)}
                  className="rrec-input" required disabled={!!editingId}
                >
                  <option value="">-- Select --</option>
                  {(editingId ? menuItems : itemsWithoutRecipe).map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Recipe Name *</label>
                <input value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Butter Chicken Recipe"
                  className="rrec-input" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Serving Size</label>
                <input type="number" min={1}
                  value={form.serving_size}
                  onChange={e => setForm({ ...form, serving_size: e.target.value })}
                  className="rrec-input" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Prep Time (min)</label>
                <input type="number" min={1}
                  value={form.preparation_time}
                  onChange={e => setForm({ ...form, preparation_time: e.target.value })}
                  className="rrec-input" />
              </div>
            </div>

            {/* Ingredients */}
            <div style={s.ingSection}>
              <div style={s.ingHeader}>
                <h4 style={s.ingTitle}>Ingredients</h4>
                <button type="button" onClick={addIngredient} className="rrec-add-ing-btn">
                  + Add
                </button>
              </div>

              {/* Header row */}
              <div className="rrec-ing-row" style={s.ingRow}>
                <span style={{ ...s.ingCol, flex: 3, ...s.colHeader }}>Ingredient</span>
                <span style={{ ...s.ingCol, ...s.colHeader }}>Quantity</span>
                <span style={{ ...s.ingCol, ...s.colHeader }}>Unit</span>
                <span style={{ width: '30px' }}></span>
              </div>

              {ingredients.map((ing, index) => {
                const selectedItem = invItems.find(i => i.id === parseInt(ing.inventory_item_id));
                return (
                  <div key={index} className="rrec-ing-row" style={s.ingRow}>
                    <div style={{ ...s.ingCol, flex: 3 }}>
                      <select value={ing.inventory_item_id}
                        onChange={e => updateIngredient(index, 'inventory_item_id', e.target.value)}
                        className="rrec-input">
                        <option value="">-- Item --</option>
                        {invItems.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={s.ingCol}>
                      <input type="number" min={0} step={0.001}
                        value={ing.quantity}
                        onChange={e => updateIngredient(index, 'quantity', e.target.value)}
                        placeholder="0"
                        className="rrec-input" />
                    </div>
                    <div style={s.ingCol}>
                      <span style={s.unitLabel}>
                        {selectedItem?.unit || '—'}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeIngredient(index)}
                      className="rrec-remove-btn" disabled={ingredients.length === 1}>✕</button>
                  </div>
                );
              })}
            </div>

            <div style={s.formActions}>
              <button type="submit" className="rrec-primary-btn">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="rrec-outline-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Recipes List */}
      {recipes.length === 0 ? (
        <div style={s.emptyState}>
          <p style={{ margin: 0, color: '#1A1815', fontSize: '13.5px' }}>No recipes yet — use "+ Add Recipe" above to create one</p>
          <p style={{ fontSize: '12.5px', color: '#B9B0A0', marginTop: '8px' }}>
            Without recipes, inventory won't be tracked when orders come in
          </p>
        </div>
      ) : (
        <div style={s.recipesList}>
          {recipes.map(recipe => (
            <div key={recipe.id} className="rrec-recipe-card" style={s.recipeCard}>
              <div style={s.recipeClip} />

              {/* Recipe Header */}
              <div className="rrec-recipe-top" style={s.recipeTop}
                onClick={() => setExpandedId(expandedId === recipe.id ? null : recipe.id)}>
                <div style={s.recipeLeft}>
                  <h3 style={s.recipeName}>{recipe.name}</h3>
                  <p style={s.recipeItem}>🍽️ {recipe.MenuItem?.name}</p>
                </div>
                <div style={s.recipeRight}>
                  <div style={s.recipeMeta}>
                    <span>👥 {recipe.serving_size} serving</span>
                    <span>⏱️ {recipe.preparation_time} min</span>
                    <span>🧪 {recipe.RecipeIngredients?.length || 0} ingredients</span>
                  </div>
                  <span style={s.expandIcon}>
                    {expandedId === recipe.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Expanded — Ingredients */}
              {expandedId === recipe.id && (
                <div style={s.ingredientsList}>
                  <h4 style={s.ingListTitle}>Ingredients (for {recipe.serving_size} servings):</h4>
                  <div style={s.ingGrid}>
                    {recipe.RecipeIngredients?.map(ing => {
                      const isLow = parseFloat(ing.InventoryItem?.current_quantity) <
                                    parseFloat(ing.quantity);
                      return (
                        <div key={ing.id} style={{
                          ...s.ingChip,
                          borderColor: isLow ? '#EBC7BC' : '#E9E3D6',
                          background:  isLow ? '#FBEEEB' : '#FBF9F4'
                        }}>
                          <span style={{ fontWeight: '700', fontSize: '12.5px', color: '#1A1815' }}>
                            {ing.InventoryItem?.name}
                          </span>
                          <span style={{ fontSize: '12.5px', color: '#7A7264' }}>
                            {ing.quantity} {ing.unit}
                          </span>
                          <span style={{ fontSize: '11px', color: '#B9B0A0' }}>
                            Stock: {ing.InventoryItem?.current_quantity} {ing.unit}
                          </span>
                          {isLow && (
                            <span style={{ fontSize: '11px', color: '#B33F2C', fontWeight: '700' }}>⚠️ Low</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={s.recipeActions}>
                    <button onClick={() => handleEdit(recipe)} className="rrec-edit-btn">Edit Recipe</button>
                    <button onClick={() => handleDelete(recipe.id, recipe.name)}
                      className="rrec-delete-btn">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  page:     { padding: '32px', background: '#F7F5F0', minHeight: '100vh', fontFamily: "'JetBrains Mono', monospace" },
  centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F7F5F0' },

  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' },
  eyebrow:    { display: 'inline-block', fontSize: '11px', fontWeight: '700', letterSpacing: '0.14em', color: '#A97E44', marginBottom: '6px' },
  title:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.01em', color: '#1A1815', margin: '0 0 4px' },
  subtitle:   { fontSize: '12.5px', color: '#7A7264', margin: 0 },
  headerBtns: { display: 'flex', gap: '10px' },

  msg:   { padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', fontWeight: '500', marginBottom: '18px' },
  msgOk: { background: '#F0F7EE', border: '1px solid #CFE3C6', color: '#3F7D33' },
  msgErr:{ background: '#FBEEEB', border: '1px solid #EBC7BC', color: '#B33F2C' },

  warning: { background: '#FBF3E6', border: '1px solid #E7CFA3', color: '#8B5F2A', padding: '10px 16px', borderRadius: '4px', fontSize: '12.5px', marginBottom: '18px', lineHeight: '1.5' },

  formCard: { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', padding: '26px', marginBottom: '20px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', position: 'relative' },
  perforation: {
    position: 'absolute', top: '-1px', left: 0, right: 0, height: '3px',
    background: 'repeating-linear-gradient(to right, #E9E3D6 0, #E9E3D6 6px, transparent 6px, transparent 12px)',
    borderTopLeftRadius: '6px', borderTopRightRadius: '6px'
  },
  formTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '0.01em', margin: '0 0 18px', color: '#1A1815' },
  formGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' },
  formActions: { display: 'flex', gap: '10px', marginTop: '18px' },
  field:       { display: 'flex', flexDirection: 'column' },
  label:       { fontSize: '10.5px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7A7264', marginBottom: '7px' },

  ingSection: { borderTop: '1px dashed #E9E3D6', paddingTop: '18px' },
  ingHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  ingTitle:   { fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.01em', color: '#1A1815', margin: 0 },
  ingRow:     { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
  ingCol:     { flex: 1 },
  colHeader:  { fontWeight: '700', fontSize: '10.5px', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7A7264' },
  unitLabel:  { fontSize: '13px', color: '#7A7264', padding: '8px 4px', display: 'block' },

  recipesList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  recipeCard:  { background: '#FFFFFF', border: '1px solid #E9E3D6', borderRadius: '6px', boxShadow: '0 1px 2px rgba(26,24,21,0.03)', overflow: 'hidden', position: 'relative' },
  recipeClip:  { position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#A97E44' },
  recipeTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 16px 20px', cursor: 'pointer' },
  recipeLeft:  { flex: 1 },
  recipeName:  { fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '0.01em', color: '#1A1815', margin: '0 0 4px' },
  recipeItem:  { fontSize: '12.5px', color: '#7A7264', margin: 0 },
  recipeRight: { display: 'flex', alignItems: 'center', gap: '18px' },
  recipeMeta:  { display: 'flex', gap: '14px', fontSize: '11.5px', color: '#B9B0A0' },
  expandIcon:  { fontSize: '11px', color: '#B9B0A0' },

  ingredientsList: { borderTop: '1px dashed #E9E3D6', padding: '18px 18px 18px 20px', background: '#FBF9F4' },
  ingListTitle: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em', color: '#7A7264', margin: '0 0 12px', textTransform: 'uppercase' },
  ingGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '16px' },
  ingChip:      { border: '1px solid', borderRadius: '4px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '3px' },
  recipeActions:{ display: 'flex', gap: '10px' },

  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', border: '1px dashed #E9E3D6', borderRadius: '6px' },
};

export default Recipes;