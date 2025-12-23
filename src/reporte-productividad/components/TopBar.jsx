import { ChevronLeft, FileDown } from 'lucide-react';
import Button from './common/Button';

function TopBar({ reportName = "Nombre del reporte", onExport }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-6 py-3">
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-medium">{reportName}</h1>
        
        <Button
          onClick={onExport}
          variant="ghost"
          className='border border-[#5B5346] text-[#5B5346] bg-none'
        >
          <FileDown className="w-5 h-5" />
          Exportar a Excel
        </Button>
      </div>
    </div>
  );
}

export default TopBar;
