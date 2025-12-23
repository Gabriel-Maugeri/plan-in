import { createContext, useContext, useState, useEffect } from 'react';
import { viewsAPI } from '../services/api';
import { DEFAULT_VIEW } from '../utils/constants';

const ViewsContext = createContext(null);

export const ViewsProvider = ({ children }) => {
  const [views, setViews] = useState([]);
  const [currentView, setCurrentView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga las vistas del sub-usuario desde el backend
   */
  const loadViews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await viewsAPI.getAll();
      
      // Mapear productivityViewId a id para compatibilidad interna
      const mappedViews = data.map(view => ({
        id: view.productivityViewId,
        name: view.name,
        rows: view.rows || [],
        cols: view.cols || [],
      }));
      
      setViews(mappedViews);
      
      // Si no hay vista actual, seleccionar la primera o usar la por defecto
      if (!currentView && mappedViews.length > 0) {
        setCurrentView(mappedViews[0]);
      } else if (!currentView) {
        setCurrentView(DEFAULT_VIEW);
      }
    } catch (err) {
      console.error('Error al cargar vistas:', err);
      setError(err.message);
      // Si hay error, usar vista por defecto
      setViews([]);
      if (!currentView) {
        setCurrentView(DEFAULT_VIEW);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViews();
  }, []);

  /**
   * Crea una nueva vista
   */
  const createView = async (viewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await viewsAPI.create(viewData);
      
      console.log('API Create Response:', response); // Debug
      
      // El API puede devolver solo el ID (número) o un objeto completo
      const newView = {
        id: typeof response === 'number' ? response : response.productivityViewId,
        name: viewData.name, // Usar siempre el nombre que enviamos
        rows: viewData.rows || [],
        cols: viewData.cols || [],
      };
      
      console.log('New View Object:', newView); // Debug
      
      // Actualizar lista de vistas usando función de actualización
      setViews(prevViews => [...prevViews, newView]);
      setCurrentView(newView);
      
      return { success: true, view: newView };
    } catch (err) {
      console.error('Error al crear vista:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza una vista existente
   */
  const updateView = async (viewId, viewData) => {
    // No hacer nada si no hay ID válido
    if (!viewId || viewId === 'default') {
      console.warn('Intento de actualizar vista con ID inválido:', viewId);
      return { success: false, error: 'ID de vista inválido' };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await viewsAPI.update(viewId, viewData);
      
      console.log('API Update Response:', response); // Debug
      
      // El API devuelve solo el ID (número), usar los datos enviados
      const updatedView = {
        id: viewId, // Mantener el ID original
        name: viewData.name,
        rows: viewData.rows || [],
        cols: viewData.cols || [],
      };
      
      console.log('Updated View Object:', updatedView); // Debug
      
      // Actualizar la lista de vistas
      setViews(prevViews => prevViews.map(v => v.id === viewId ? updatedView : v));
      
      // Si es la vista actual, actualizarla también
      if (currentView?.id === viewId) {
        setCurrentView(updatedView);
      }
      
      return { success: true, view: updatedView };
    } catch (err) {
      console.error('Error al actualizar vista:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina una vista
   */
  const deleteView = async (viewId) => {
    setLoading(true);
    setError(null);
    try {
      await viewsAPI.delete(viewId);
      
      const updatedViews = views.filter(v => v.id !== viewId);
      setViews(updatedViews);
      
      // Si se eliminó la vista actual, seleccionar otra
      if (currentView?.id === viewId) {
        setCurrentView(updatedViews.length > 0 ? updatedViews[0] : DEFAULT_VIEW);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar vista:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Selecciona una vista como actual
   */
  const selectView = (view) => {
    setCurrentView(view);
  };

  const value = {
    views,
    currentView,
    loading,
    error,
    loadViews,
    createView,
    updateView,
    deleteView,
    selectView,
  };

  return (
    <ViewsContext.Provider value={value}>
      {children}
    </ViewsContext.Provider>
  );
};

export const useViews = () => {
  const context = useContext(ViewsContext);
  if (!context) {
    throw new Error('useViews debe ser usado dentro de un ViewsProvider');
  }
  return context;
};
