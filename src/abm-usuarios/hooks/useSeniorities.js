import { useState, useEffect } from 'react';
import { senioritiesAPI } from '../services/api';

export function useSeniorities() {
  const [seniorities, setSeniorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSeniorities();
  }, []);

  const loadSeniorities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await senioritiesAPI.getAll();
      setSeniorities(data.filter(s => s.isActive));
    } catch (err) {
      console.error('Error al cargar seniorities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeniorityOptions = () => {
    return seniorities.map(seniority => ({
      value: seniority.seniorityId,
      label: seniority.nameSeniority,
    }));
  };

  return { seniorities, loading, error, loadSeniorities, getSeniorityOptions };
}
