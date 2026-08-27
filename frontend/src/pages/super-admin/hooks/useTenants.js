import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../../api';

export default function useTenants() {
  const [tenants, setTenants]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState({ status: '', plan: '' });
  const [search, setSearch]     = useState('');

  const fetchTenants = useCallback(async () => {
    setError(null);
    try {
      let url = '/super-admin/tenants?';
      if (filter.status) url += `status=${filter.status}&`;
      if (filter.plan)   url += `plan=${filter.plan}`;
      const r = await api.get(url);
      setTenants(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load restaurants');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const filtered = useMemo(() => tenants.filter(t =>
    !search ||
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain?.toLowerCase().includes(search.toLowerCase())
  ), [tenants, search]);

  const createTenant = async (form) => {
    const payload = {
      resturant_name: form.restaurant_name,
      owner_name:     form.owner_name,
      email:          form.owner_email,
      password:       form.owner_password,
      plan:           form.plan,
      status:         form.status,
    };
    const res = await api.post('/super-admin/tenants', payload);
    await fetchTenants();
    return res.data.data;
  };

  const changeStatus = async (id, status) => {
    await api.put(`/super-admin/tenants/${id}/status`, { status });
    await fetchTenants();
  };

  const changePlan = async (id, plan) => {
    await api.put(`/super-admin/tenants/${id}/plan`, { plan });
    await fetchTenants();
  };

  const fetchTenantDetails = async (id) => {
    const r = await api.get(`/super-admin/tenants/${id}`);
    return r.data.data;
  };

  return {
    tenants, filtered, loading, error,
    filter, setFilter, search, setSearch,
    fetchTenants, createTenant, changeStatus, changePlan, fetchTenantDetails,
  };
}
