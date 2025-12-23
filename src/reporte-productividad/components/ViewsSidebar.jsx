import { useState, useEffect, useRef } from "react";
import { CirclePlus, MoreHorizontal, Edit2, Trash, Save } from "lucide-react";
import { useViews } from "../context/ViewsContext";
import { useToast } from "../context/ToastContext";
import Button from "./common/Button";
import ViewModal from "./ViewModal";
import DeleteViewModal from "./DeleteViewModal";
import ConfirmChangeModal from "./ConfirmChangeModal";

function ViewsSidebar({ dynamicTableRef, pivotChangeCounter }) {
  const { views, currentView, selectView, deleteView, updateView } = useViews();
  const { success } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmChangeModal, setShowConfirmChangeModal] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const justSwitchedView = useRef(false);

  // Obtener el estado actual de la tabla pivote
  const getCurrentPivotState = () => {
    return dynamicTableRef?.current?.getPivotState?.() || null;
  };

  // Detectar cambios en la configuración de la tabla vs vista actual
  useEffect(() => {
    // Si acabamos de cambiar de vista, ignorar esta comparación
    if (justSwitchedView.current) {
      return;
    }

    const pivotState = getCurrentPivotState();
    if (!pivotState || !currentView || currentView.id === 'default') {
      setHasChanges(false);
      return;
    }

    const rowsChanged = JSON.stringify(pivotState.rows || []) !== JSON.stringify(currentView.rows || []);
    const colsChanged = JSON.stringify(pivotState.cols || []) !== JSON.stringify(currentView.cols || []);
    
    setHasChanges(rowsChanged || colsChanged);
  }, [currentView, pivotChangeCounter]);

  const handleUpdateView = async () => {
    if (!currentView || currentView.id === 'default') return;
    
    const pivotState = getCurrentPivotState();
    const viewConfig = {
      name: currentView.name,
      rows: pivotState?.rows || [],
      cols: pivotState?.cols || [],
    };
    
    const result = await updateView(currentView.id, viewConfig);
    if (result.success) {
      success('Los cambios en tu vista se guardaron con éxito.');
      setHasChanges(false);
    }
  };

  const handleSaveAndSwitch = async () => {
    await handleUpdateView();
    if (selectedView) {
      justSwitchedView.current = true;
      setHasChanges(false);
      selectView(selectedView);
      setShowConfirmChangeModal(false);
      setSelectedView(null);
      
      setTimeout(() => {
        justSwitchedView.current = false;
      }, 100);
    }
  };

  const handleDiscardAndSwitch = () => {
    if (selectedView) {
      justSwitchedView.current = true;
      setHasChanges(false);
      selectView(selectedView);
      setShowConfirmChangeModal(false);
      setSelectedView(null);
      
      setTimeout(() => {
        justSwitchedView.current = false;
      }, 100);
    }
  };

  const handleViewClick = (view) => {
    if (!view || !view.id) return;
    
    // Si hay cambios pendientes, mostrar modal de confirmación
    if (hasChanges) {
      setSelectedView(view);
      setShowConfirmChangeModal(true);
      setOpenMenuId(null);
      return;
    }
    
    // No hay cambios, cambiar vista directamente
    justSwitchedView.current = true;
    setHasChanges(false);
    selectView(view);
    setOpenMenuId(null);
    
    // Resetear flag después de dar tiempo a que DynamicTable actualice
    setTimeout(() => {
      justSwitchedView.current = false;
    }, 100);
  };

  const handleEdit = (view) => {
    if (view && view.id) {
      setSelectedView(view);
      setShowEditModal(true);
      setOpenMenuId(null);
    }
  };

  const handleDeleteClick = (view) => {
    setSelectedView(view);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedView) {
      await deleteView(selectedView.id);
      success(`Tu vista ${selectedView.name} ha sido eliminada de tu lista.`);
      setShowDeleteModal(false);
      setSelectedView(null);
    }
  };

  const toggleMenu = (viewId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === viewId ? null : viewId);
  };

  return (
    <>
      <div className="w-64 bg-[#FAFAFA] border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-base font-bold">VISTAS</h2>
          <div className="bg-[#C5CAE9] text-xs rounded-full w-9 h-6 flex items-center justify-center">
            {views.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {views.map((view) => {
              const isSelected = currentView?.id === view.id;
              return (
              <div
                key={`view-${view.id}`}
                className={`relative group cursor-pointer p-3 rounded-lg transition-colors ${
                  isSelected ? 'bg-[#72BFDD] text-white' : 'bg-white'
                }`}
                onClick={() => handleViewClick(view)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate pr-2">
                    {view.name || 'Vista sin nombre'}
                  </span>
                  <button
                    onClick={(e) => toggleMenu(view.id, e)}
                    className="p-1 cursor-pointer"
                  >
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>

                {openMenuId === view.id && (
                  <div className="text-black absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                    <button
                      key={`edit-${view.id}`}
                      onClick={() => handleEdit(view)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar nombre
                    </button>
                    <button
                      key={`delete-${view.id}`}
                      onClick={() => handleDeleteClick(view)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Trash className="w-4 h-4" />
                      Eliminar de la lista
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {/* Botón Actualizar Vista - solo visible si hay cambios en vista seleccionada */}
          {hasChanges && currentView && currentView.id !== 'default' && (
            <Button
              onClick={handleUpdateView}
              variant="primary"
              className="w-full justify-center font-medium text-base"
            >
              <Save className="w-5 h-5" />
              Actualizar Vista
            </Button>
          )}
          
          {/* Botón Crear nueva vista - se destaca cuando hay cambios sin vista */}
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className={`w-full justify-center font-medium text-base ${
              hasChanges && (!currentView || currentView.id === 'default') 
                ? 'ring-4 ring-[#72BFDD] ring-opacity-50 animate-pulse' 
                : ''
            }`}
          >
            <CirclePlus className="w-5 h-5" />
            Crear nueva vista
          </Button>
        </div>
      </div>

      <ViewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        view={null}
        currentPivotState={getCurrentPivotState()}
      />

      <ViewModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedView(null);
        }}
        view={selectedView}
        currentPivotState={getCurrentPivotState()}
      />

      <DeleteViewModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedView(null);
        }}
        onConfirm={handleConfirmDelete}
        viewName={selectedView?.name}
      />

      <ConfirmChangeModal
        isOpen={showConfirmChangeModal}
        onClose={() => {
          setShowConfirmChangeModal(false);
          setSelectedView(null);
        }}
        onSave={handleSaveAndSwitch}
        onDiscard={handleDiscardAndSwitch}
        currentViewName={currentView?.name || 'Vista actual'}
      />
    </>
  );
}

export default ViewsSidebar;
