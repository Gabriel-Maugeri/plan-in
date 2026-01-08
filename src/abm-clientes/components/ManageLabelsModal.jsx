import { useState, useEffect } from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import { labelsAPI, vatTypesAPI } from "../../services/api";

function ManageLabelsModal({ isOpen, onClose, onLabelsUpdated }) {
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editLabelName, setEditLabelName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);
  const [deletedLabel, setDeletedLabel] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLabels();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (showUndoToast && deletedLabel) {
      timer = setTimeout(() => {
        performDelete(deletedLabel);
        setShowUndoToast(false);
        setDeletedLabel(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showUndoToast, deletedLabel]);

  const fetchLabels = async () => {
    try {
      const data = await labelsAPI.getAll();
      setLabels(data);
    } catch (error) {
      console.error("Error al cargar etiquetas:", error);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    try {
      const newLabel = await vatTypesAPI.create({ labelName: newLabelName });
      setLabels(prev => [...prev, newLabel]);
      setNewLabelName("");
      showToast("Etiqueta creada exitosamente", "success");
      if (onLabelsUpdated) onLabelsUpdated();
    } catch (error) {
      console.error("Error al crear etiqueta:", error);
      showToast("Error al crear etiqueta", "error");
    }
  };

  const handleEditLabel = (label) => {
    setEditingLabelId(label.labelId);
    setEditLabelName(label.labelName);
  };

  const handleSaveEdit = async (labelId) => {
    if (!editLabelName.trim()) return;
    
    try {
      await vatTypesAPI.update(labelId, { labelName: editLabelName });
      setLabels(prev => prev.map(l => 
        l.labelId === labelId ? { ...l, labelName: editLabelName } : l
      ));
      setEditingLabelId(null);
      setEditLabelName("");
      showToast("Etiqueta actualizada exitosamente", "success");
      if (onLabelsUpdated) onLabelsUpdated();
    } catch (error) {
      console.error("Error al actualizar etiqueta:", error);
      showToast("Error al actualizar etiqueta", "error");
    }
  };

  const handleDeleteClick = (label) => {
    setLabelToDelete(label);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setDeletedLabel(labelToDelete);
    setLabels(prev => prev.filter(l => l.labelId !== labelToDelete.labelId));
    setShowDeleteConfirm(false);
    setLabelToDelete(null);
    setShowUndoToast(true);
    showToast("Etiqueta eliminada", "info", true);
  };

  const handleUndo = () => {
    if (deletedLabel) {
      setLabels(prev => [...prev, deletedLabel]);
      setDeletedLabel(null);
      setShowUndoToast(false);
    }
  };

  const performDelete = async (label) => {
    try {
      await vatTypesAPI.delete(label.labelId);
      if (onLabelsUpdated) onLabelsUpdated();
    } catch (error) {
      console.error("Error al eliminar etiqueta:", error);
      setLabels(prev => [...prev, label]);
      showToast("Error al eliminar etiqueta", "error");
    }
  };

  const showToast = (message, type, withUndo = false) => {
    // This will be handled by a global toast system
    console.log(`Toast: ${message} (${type})`);
  };

  const filteredLabels = labels.filter(label =>
    label.labelName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[#27353E2E] z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-xl z-50 w-[800px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-medium">Etiquetas de Cliente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <h3 className="text-base font-medium mb-3">Nueva Etiqueta</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre de Etiqueta"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
                className="flex-1 px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm border-2 border-transparent focus:border-[#72BFDD]"
              />
              <button
                onClick={handleCreateLabel}
                className="px-6 py-2 bg-[#72BFDD] text-white rounded-lg text-sm hover:bg-[#5fa8c4]"
              >
                Agregar Etiqueta
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#72BFDD" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <h3 className="text-base font-medium">Etiquetas Creadas</h3>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[#F5F5F5]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto">
            {filteredLabels.map((label) => (
              <div
                key={label.labelId}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0"
              >
                {editingLabelId === label.labelId ? (
                  <>
                    <input
                      type="text"
                      value={editLabelName}
                      onChange={(e) => setEditLabelName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(label.labelId)}
                      className="flex-1 px-3 py-1 border-2 border-[#72BFDD] rounded outline-none text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(label.labelId)}
                      className="ml-3 px-4 py-1 text-[#72BFDD] text-sm hover:underline"
                    >
                      Guardar cambios
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm">{label.labelName}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLabel(label)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(label)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-[70] w-[400px] p-6">
            <h3 className="text-lg font-medium mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la etiqueta "{labelToDelete?.labelName}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </>
      )}

      {showUndoToast && (
        <div className="fixed top-4 left-4 bg-[#E8F5E9] px-6 py-3 rounded-lg shadow-lg z-[80] flex items-center gap-4">
          <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="text-sm text-gray-800">La etiqueta [{deletedLabel?.labelName}] ha sido borrada exitosamente.</span>
          <button
            onClick={handleUndo}
            className="text-sm text-gray-800 font-medium hover:underline uppercase"
          >
            Deshacer
          </button>
        </div>
      )}
    </>
  );
}

export default ManageLabelsModal;
