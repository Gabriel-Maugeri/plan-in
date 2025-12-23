import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const result = await usersAPI.create(userData);
      await loadUsers();
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al crear usuario:', err);
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (userData) => {
    try {
      const result = await usersAPI.update(userData);
      await loadUsers();
      return { success: true, data: result };
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (userSubId) => {
    try {
      await usersAPI.delete(userSubId);
      await loadUsers();
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (userSubId) => {
    try {
      await usersAPI.resetPassword(userSubId);
      return { success: true };
    } catch (err) {
      console.error('Error al blanquear contraseña:', err);
      return { success: false, error: err.message };
    }
  };

  return { 
    users, 
    loading, 
    error, 
    loadUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    resetPassword 
  };
}
