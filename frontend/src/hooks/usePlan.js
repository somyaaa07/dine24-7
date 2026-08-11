// src/hooks/usePlan.js
// Plan ke basis pe features check karne ka hook

import { useEffect, useState } from 'react';
import api from '../utils/api';

const PLAN_FEATURES = {
  starter:    ['dashboard','tables','menu','pos','suppliers','reservations','expenses'],
  growth:     ['dashboard','tables','menu','pos','kds','inventory','recipes','suppliers','purchase_orders','customers','reservations','employees','expenses','reports','notifications','qr_ordering'],
  enterprise: ['dashboard','tables','menu','pos','kds','inventory','recipes','suppliers','purchase_orders','customers','reservations','employees','expenses','reports','analytics','notifications','qr_ordering','multi_branch'],
};

export const usePlan = () => {
  const [plan,   setPlan]   = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get('/restaurant/profile');
        // Plan info tenant se aata hai
        const tenantRes = await api.get('/auth/me');
        setPlan(tenantRes.data.data?.plan || 'starter');
        setStatus(tenantRes.data.data?.tenant_status || 'active');
      } catch(e) {
        setPlan('starter');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const hasFeature = (feature) => {
    if (!plan) return false;
    return (PLAN_FEATURES[plan] || PLAN_FEATURES.starter).includes(feature);
  };

  const isActive = status === 'active' || status === 'trial';

  return { plan, status, loading, hasFeature, isActive };
};