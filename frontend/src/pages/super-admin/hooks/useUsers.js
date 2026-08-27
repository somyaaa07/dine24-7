import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../../api';

export default function useUsers({ active }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState({ role: '', is_active: '' });
  const [search, setSearch]   = useState('');

  const fetchUsers = useCallback(async () => {
    setError(null);
    try {
      let url = '/super-admin/users?';
      if (filter.role) url += `role=${filter.role}&`;
      if (filter.is_active !== '') url += `is_active=${filter.is_active}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const r = await api.get(url);
      setUsers(r.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { if (active) fetchUsers(); }, [active, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredUsers = useMemo(() => search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users, [users, search]);

  const changeStatus = async (id, is_active) => {
    await api.put(`/super-admin/users/${id}/status`, { is_active });
    await fetchUsers();
  };

  return {
    users, filteredUsers, loading, error,
    filter, setFilter, search, setSearch,
    fetchUsers, changeStatus,
  };
}
