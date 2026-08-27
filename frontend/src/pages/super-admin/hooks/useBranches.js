import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../../api';

export default function useBranches({ active }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState({ is_active: '' });
  const [search, setSearch]     = useState('');

  const fetchBranches = useCallback(async () => {
    setError(null);
    try {
      let url = '/super-admin/branches?';
      if (filter.is_active !== '') url += `is_active=${filter.is_active}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const r = await api.get(url);
      setBranches(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load branches');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { if (active) fetchBranches(); }, [active, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredBranches = useMemo(() => search
    ? branches.filter(b =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.address?.toLowerCase().includes(search.toLowerCase())
      )
    : branches, [branches, search]);

  const changeStatus = async (id, is_active) => {
    await api.put(`/super-admin/branches/${id}/status`, { is_active });
    await fetchBranches();
  };

  return {
    branches, filteredBranches, loading, error,
    filter, setFilter, search, setSearch,
    fetchBranches, changeStatus,
  };
}
