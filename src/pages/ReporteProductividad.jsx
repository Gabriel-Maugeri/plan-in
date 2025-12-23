import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ToastProvider, useToast } from '../reporte-productividad/context/ToastContext';
import { FiltersProvider } from '../reporte-productividad/context/FiltersContext';
import { ViewsProvider } from '../reporte-productividad/context/ViewsContext';
import TopBar from '../reporte-productividad/components/TopBar';
import ViewsSidebar from '../reporte-productividad/components/ViewsSidebar';
import FiltersBar from '../reporte-productividad/components/FiltersBar';
import DynamicTable from '../reporte-productividad/components/DynamicTable';
import Toast from '../reporte-productividad/components/common/Toast';
import { exportPivotTableToExcel } from '../reporte-productividad/utils/excelExport';

function ReporteProductividadContent() {
  const { isAuthenticated, loading } = useAuth();
  const { toasts, removeToast, success: showSuccess } = useToast();
  const dynamicTableRef = useRef(null);
  const [pivotChangeCounter, setPivotChangeCounter] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No se encontró sesión activa</p>
          <p className="text-gray-500 text-sm">Por favor, inicia sesión primero</p>
        </div>
      </div>
    );
  }

  const handleSearch = () => {
    if (dynamicTableRef.current) {
      dynamicTableRef.current.loadData();
    }
  };

  const handlePivotChange = () => {
    setPivotChangeCounter(prev => prev + 1);
  };

  const handleExport = () => {
    try {
      const pivotContainer = document.querySelector('.flex-1.overflow-auto.p-6');
      if (pivotContainer) {
        const success = exportPivotTableToExcel(pivotContainer, 'Reporte_Productividad');
        if (success) {
          showSuccess('Tabla exportada a Excel exitosamente');
        }
      }
    } catch (error) {
      console.error('Error en exportación:', error);
    }
  };

  return (
    <FiltersProvider>
      <ViewsProvider>
        <div className="flex flex-col h-screen">
          <TopBar 
            reportName="Reporte Productividad"
            onExport={handleExport}
          />
          
          <div className="flex flex-1 overflow-hidden">
            <ViewsSidebar dynamicTableRef={dynamicTableRef} pivotChangeCounter={pivotChangeCounter} />
            
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
              <FiltersBar onSearch={handleSearch} />
              <DynamicTable ref={dynamicTableRef} onPivotChange={handlePivotChange} />
            </div>
          </div>

          <div className="fixed top-4 left-4 space-y-2 z-50">
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </div>
        </div>
      </ViewsProvider>
    </FiltersProvider>
  );
}

function ReporteProductividad() {
  return (
    <ToastProvider>
      <ReporteProductividadContent />
    </ToastProvider>
  );
}

export default ReporteProductividad;
