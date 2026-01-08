import { useState } from 'react';
import ClientesHeader from '../abm-clientes/components/ClientesHeader';
import ClientesTable from '../abm-clientes/components/ClientesTable';

function ABMClientes() {
  const [tableData, setTableData] = useState([]);
  const [labels, setLabels] = useState([]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ClientesHeader tableData={tableData} labels={labels} />
      <div className="flex-1 overflow-auto">
        <ClientesTable onDataChange={setTableData} onLabelsChange={setLabels} />
      </div>
    </div>
  );
}

export default ABMClientes;
