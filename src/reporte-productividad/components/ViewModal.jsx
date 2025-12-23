import { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Input from './common/Input';
import Button from './common/Button';
import { useViews } from '../context/ViewsContext';
import { useToast } from '../context/ToastContext';
import { validateRequired } from '../utils/validators';

function ViewModal({ isOpen, onClose, view, currentPivotState }) {
  const { createView, updateView, currentView } = useViews();
  const { success } = useToast();
  const isEditing = !!view;

  const [formData, setFormData] = useState({
    name: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Obtener rows y cols actuales de la tabla dinámica
  const currentRows = currentPivotState?.rows || currentView?.rows || [];
  const currentCols = currentPivotState?.cols || currentView?.cols || [];

  useEffect(() => {
    if (view) {
      setFormData({
        name: view.name,
      });
    } else {
      setFormData({
        name: '',
      });
    }
    setErrors({});
  }, [view, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    const nameError = validateRequired(formData.name, 'Nombre');
    if (nameError) newErrors.name = nameError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      let result;
      const viewData = {
        name: formData.name,
        rows: currentRows,
        cols: currentCols,
      };
      
      if (isEditing) {
        result = await updateView(view.id, viewData);
      } else {
        result = await createView(viewData);
      }

      if (result.success) {
        success(isEditing ? 'Los cambios en tu vista se guardaron con éxito.' : 'Vista creada correctamente');
        onClose();
      }
    } catch (err) {
      console.error('Error al guardar la vista:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar vista' : 'Crear nueva vista'}
      size="w-[450px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-gray-600 mb-4">
          <p>
            <strong>Columnas:</strong> {currentCols.length > 0 ? currentCols.join(', ') : 'Sin columnas configuradas'}
          </p>
          <p>
            <strong>Filas:</strong> {currentRows.length > 0 ? currentRows.join(', ') : 'Sin filas configuradas'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isEditing ? 'Asignar nuevo nombre' : 'Asignar un nombre'}
          </label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre de la vista"
            error={errors.name}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 text-center"
          >
            En otro momento
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1 text-center"
          >
            {loading ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Agregar a la lista')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ViewModal;
