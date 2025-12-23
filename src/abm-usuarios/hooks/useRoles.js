import { useState, useEffect } from 'react';
import { rolesAPI } from '../services/api';

export function useRoles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rolesAPI.getAll();
      setRoles(data);
    } catch (err) {
      console.error('Error al cargar roles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    return roles.map(role => ({
      value: role.rolId,
      label: role.rolName,
    }));
  };

  return { roles, loading, error, loadRoles, getRoleOptions };
}
