import { useState } from 'react';
import { PLANS, EMPTY_TENANT_FORM } from '../constants/superAdmin.constants';
import { IconEye, IconEyeOff } from './Icons';

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold tracking-wide text-[#7A7264] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</label>
      {children}
      {error && <span className="text-[11px] font-medium" style={{ color: '#B33F2C' }}>{error}</span>}
    </div>
  );
}

export default function CreateTenantModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_TENANT_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.restaurant_name.trim()) errs.restaurant_name = 'Required';
    if (!form.subdomain.trim()) errs.subdomain = 'Required';
    if (!form.owner_name.trim()) errs.owner_name = 'Required';
    if (!form.owner_email.trim()) errs.owner_email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.owner_email)) errs.owner_email = 'Enter a valid email';
    if (!form.owner_password || form.owner_password.length < 8) errs.owner_password = 'Minimum 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onCreate(form);
      setForm(EMPTY_TENANT_FORM);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/40 sa-fade-in" onClick={onClose} />
      <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[480px] bg-[#F7F5F0] border-l border-[#E9E3D6] overflow-y-auto sa-drawer-in-right">
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#E9E3D6] sticky top-0 bg-[#F7F5F0] z-10">
          <h2 className="text-[22px] text-[#1A1815] leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>New Restaurant</h2>
          <button onClick={onClose} className="text-[#7A7264] hover:text-[#1A1815] text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold tracking-[0.1em] text-[#A97E44] uppercase">Restaurant</h3>
            <Field label="Restaurant Name *" error={errors.restaurant_name}>
              <input value={form.restaurant_name} onChange={set('restaurant_name')} className="sa-input" placeholder="The Spice Kitchen" />
            </Field>
            <Field label="Subdomain *" error={errors.subdomain}>
              <input
                value={form.subdomain}
                onChange={e => setForm(f => ({ ...f, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="sa-input"
                placeholder="spice-kitchen"
              />
              <span className="text-[11px] text-[#B9B0A0]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {form.subdomain || 'xxx'}.debox.com
              </span>
            </Field>
            <Field label="Restaurant Email">
              <input type="email" value={form.email} onChange={set('email')} className="sa-input" placeholder="info@restaurant.com" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={set('phone')} className="sa-input" placeholder="9876543210" />
            </Field>
          </section>

          <section className="space-y-3 border-t border-[#E9E3D6] pt-6">
            <h3 className="text-[11px] font-bold tracking-[0.1em] text-[#A97E44] uppercase">Owner</h3>
            <Field label="Owner Name *" error={errors.owner_name}>
              <input value={form.owner_name} onChange={set('owner_name')} className="sa-input" placeholder="Ramesh Kumar" />
            </Field>
            <Field label="Owner Email *" error={errors.owner_email}>
              <input type="email" value={form.owner_email} onChange={set('owner_email')} className="sa-input" placeholder="owner@restaurant.com" />
            </Field>
            <Field label="Password *" error={errors.owner_password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.owner_password}
                  onChange={set('owner_password')}
                  className="sa-input pr-9"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B9B0A0] hover:text-[#4A453D]">
                  {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </section>

          <section className="space-y-3 border-t border-[#E9E3D6] pt-6">
            <h3 className="text-[11px] font-bold tracking-[0.1em] text-[#A97E44] uppercase">Subscription</h3>
            <Field label="Plan">
              <select value={form.plan} onChange={set('plan')} className="sa-input">
                {Object.entries(PLANS).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.price}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className="sa-input">
                <option value="active">Active</option>
                <option value="trial">Trial</option>
              </select>
            </Field>
          </section>

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-[#F7F5F0] pb-1">
            <button type="submit" disabled={submitting} className="sa-primary-btn flex-1" style={{ opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Creating…' : 'Create Restaurant'}
            </button>
            <button type="button" onClick={onClose} className="sa-nav-btn">Cancel</button>
          </div>
        </form>
      </aside>

      <style>{`
        .sa-fade-in { animation: sa-fade 180ms ease-out; }
        .sa-drawer-in-right { animation: sa-drawer-right 240ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes sa-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sa-drawer-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
