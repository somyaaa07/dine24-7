// src/middleware/planCheck.middleware.js
import { Tenant } from '../models/index.js';
import { tenantHasFeature } from '../config/plan.js';

// Feature check middleware
export const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const tenant_id = req.user.tenant_id;

      const tenant = await Tenant.findByPk(tenant_id);

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      // Suspended ya cancelled tenant — block everything
      if (['suspended', 'cancelled'].includes(tenant.status)) {
        return res.status(403).json({
          success: false,
          code:    'ACCOUNT_SUSPENDED',
          message: tenant.status === 'suspended'
            ? 'Aapka account suspend hai. Support se contact karo.'
            : 'Aapka subscription cancel ho gaya hai.'
        });
      }

      // Trial expired check
      if (tenant.status === 'trial' && tenant.trial_ends_at) {
        const trialEnd = new Date(tenant.trial_ends_at);
        if (new Date() > trialEnd) {
          return res.status(403).json({
            success: false,
            code:    'TRIAL_EXPIRED',
            message: 'Aapka trial expire ho gaya. Plan upgrade karo.'
          });
        }
      }

      // Feature allowed hai (plan ke defaults se, ya super admin ke
      // diye hue custom override se) ?
      if (!tenantHasFeature(tenant, feature)) {
        return res.status(403).json({
          success: false,
          code:    'FEATURE_NOT_AVAILABLE',
          message: `Ye feature aapke account ke liye available nahi hai. Apne platform admin se contact karo.`,
          current_plan: tenant.plan,
          upgrade_to:   feature === 'analytics' ? 'enterprise' : 'growth'
        });
      }

      // Tenant info attach karo request mein
      req.tenant = tenant;
      next();

    } catch (error) {
      console.error('planCheck middleware failed:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};

// Tenant status check — generic
export const requireActiveAccount = async (req, res, next) => {
  try {
    const tenant_id = req.user.tenant_id;
    const tenant    = await Tenant.findByPk(tenant_id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (['suspended', 'cancelled'].includes(tenant.status)) {
      return res.status(403).json({
        success: false,
        code:    'ACCOUNT_SUSPENDED',
        message: 'Aapka account active nahi hai.'
      });
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};