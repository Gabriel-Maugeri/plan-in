import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Search, Minus, Plus } from "lucide-react";
import { organizationChartsAPI, usersAPI } from "../services/api";
import { useFilter } from "../context/FilterContext";

function FilterUsersModal({ isOpen, onClose, onConfirm }) {
  const { filteredUserIds, applyUserFilter } = useFilter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [expandedNodes, setExpandedNodes] = useState(new Map());
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [orgChartData, setOrgChartData] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadOrganizationChart = useCallback(async () => {
    try {
      setLoading(true);
      const [orgData, allUsers] = await Promise.all([
        organizationChartsAPI.getAll(),
        usersAPI.getAll()
      ]);
      
      if (orgData && orgData.length > 0) {
        setOrgChartData(orgData);
        
        const allUserIds = getAllUserIds(orgData);
        
        const assignedUserSubIds = new Set();
        const collectAssignedUsers = (nodes) => {
          nodes.forEach(node => {
            if (node.users) {
              node.users.forEach(user => {
                assignedUserSubIds.add(user.userSubId);
              });
            }
            if (node.subordinates) {
              collectAssignedUsers(node.subordinates);
            }
          });
        };
        collectAssignedUsers(orgData);
        
        const unassigned = allUsers.filter(user => !assignedUserSubIds.has(user.userSubId));
        setUnassignedUsers(unassigned);
        
        const allUsersIncludingUnassigned = [
          ...allUserIds,
          ...unassigned.map(u => `user-${u.userSubId}`)
        ];
        
        if (filteredUserIds && filteredUserIds.size > 0) {
          const restoredSelection = allUsersIncludingUnassigned.filter(id => {
            const match = id.match(/user-(\d+)/);
            const userSubId = match ? parseInt(match[1]) : null;
            return userSubId && filteredUserIds.has(userSubId);
          });
          setSelectedUsers(new Set(restoredSelection));
        } else {
          setSelectedUsers(new Set(allUsersIncludingUnassigned));
        }
      }
    } catch (error) {
      console.error('Error al cargar organigrama:', error);
    } finally {
      setLoading(false);
    }
  }, [filteredUserIds]);
  
  useEffect(() => {
    if (isOpen) {
      loadOrganizationChart();
    }
  }, [isOpen, loadOrganizationChart]);
  
  const getAllUserIds = (orgData) => {
    const userIds = [];
    
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.users) {
          node.users.forEach(user => {
            userIds.push(`user-${user.userSubId}`);
          });
        }
        if (node.subordinates) {
          traverse(node.subordinates);
        }
      });
    };
    
    traverse(orgData);
    return userIds;
  };
  
  if (!isOpen) return null;

  const toggleNode = (level, nodeId) => {
    setExpandedNodes((prev) => {
      const newMap = new Map(prev);
      if (newMap.get(level) === nodeId) {
        newMap.delete(level);
      } else {
        newMap.set(level, nodeId);
      }
      return newMap;
    });
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  
  const areAllUsersSelected = (node) => {
    const userIds = [];
    
    const collectUsers = (n) => {
      if (n.users) {
        n.users.forEach(user => {
          userIds.push(`user-${user.userSubId}`);
        });
      }
      if (n.subordinates) {
        n.subordinates.forEach(sub => collectUsers(sub));
      }
    };
    
    collectUsers(node);
    
    return userIds.length > 0 && userIds.every(id => selectedUsers.has(id));
  };
  
  const toggleDepartmentUsers = (node) => {
    const userIds = [];
    
    const collectUsers = (n) => {
      if (n.users) {
        n.users.forEach(user => {
          userIds.push(`user-${user.userSubId}`);
        });
      }
      if (n.subordinates) {
        n.subordinates.forEach(sub => collectUsers(sub));
      }
    };
    
    collectUsers(node);
    
    const allSelected = userIds.every(id => selectedUsers.has(id));
    
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (allSelected) {
        userIds.forEach(id => newSet.delete(id));
      } else {
        userIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const filterNode = (node) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    if (node.organizationChartName.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    if (node.users && node.users.some(u => u.businessName.toLowerCase().includes(searchLower))) {
      return true;
    }
    
    if (node.subordinates && node.subordinates.some(sub => filterNode(sub))) {
      return true;
    }
    
    return false;
  };

  const renderDepartmentCard = (node, level) => {
    const hasSubordinates = node.subordinates && node.subordinates.length > 0;
    const allSelected = areAllUsersSelected(node);
    
    return (
      <div className="flex flex-col min-w-[200px] shrink-0">
        {/* Header del departamento */}
        <div className="flex items-center gap-2 mb-2">
          {/* Botón expandir/colapsar */}
          {hasSubordinates && (
            <button
              onClick={() => toggleNode(level, node.organizationChartId)}
              className="p-1 hover:bg-gray-200 rounded shrink-0"
            >
              {expandedNodes.get(level) === node.organizationChartId ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          
          {/* Botón seleccionar/deseleccionar todo el departamento */}
          <button
            onClick={() => toggleDepartmentUsers(node)}
            className="w-5 h-5 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center shrink-0"
            title={allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          >
            {allSelected ? (
              <Minus className="w-3 h-3 text-white" />
            ) : (
              <Plus className="w-3 h-3 text-white" />
            )}
          </button>
          
          {/* Nombre del departamento */}
          <span className="text-blue-500 font-normal">
            {node.organizationChartName}
          </span>
        </div>
        
        {/* Usuarios del departamento */}
        {node.users && node.users.map(user => (
          <div key={user.userSubId} className="flex items-center gap-2 py-1 ml-8">
            <input
              type="checkbox"
              checked={selectedUsers.has(`user-${user.userSubId}`)}
              onChange={() => toggleUser(`user-${user.userSubId}`)}
              className="w-5 h-5 accent-blue-500 cursor-pointer shrink-0"
            />
            <span className="text-gray-800">{user.businessName}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderLevel = (nodes, level) => {
    const filteredNodes = nodes.filter(node => filterNode(node));
    if (filteredNodes.length === 0) return null;
    
    const expandedNodeId = expandedNodes.get(level);
    const expandedNode = filteredNodes.find(n => n.organizationChartId === expandedNodeId);
    
    return (
      <div className="w-full">
        {/* Departamentos del nivel actual */}
        <div className={`flex gap-4 overflow-x-auto items-start ${level === 0 ? 'justify-center' : 'justify-start'}`}>
          {filteredNodes.map(node => (
            <div key={node.organizationChartId}>
              {renderDepartmentCard(node, level)}
            </div>
          ))}
        </div>
        
        {/* Divisor y subordinados si hay un nodo expandido */}
        {expandedNode && expandedNode.subordinates && expandedNode.subordinates.length > 0 && (
          <div className="w-full mt-4">
            {/* Divisor de ancho completo */}
            <div className="h-px bg-gray-300 mb-4 w-full" />
            
            {/* Siguiente nivel */}
            {renderLevel(expandedNode.subordinates, level + 1)}
          </div>
        )}
      </div>
    );
  };

  const handleConfirm = () => {
    const selectedArray = Array.from(selectedUsers);
    applyUserFilter(selectedArray);
    onConfirm(selectedArray);
    handleClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#27353E2E] z-30"
        onClick={handleClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-40 w-[960px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-normal mb-8 text-center">
          Filtrar Usuarios
        </h2>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-4 mb-6">
          {/* Dropdown usuarios sin nivel asignado */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowUnassigned(!showUnassigned)}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-200"
            >
              <span className="text-gray-700">Usuarios sin nivel asignado</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  showUnassigned ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown de usuarios sin asignar */}
            {showUnassigned && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {unassignedUsers.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-sm">
                    No hay usuarios sin nivel asignado
                  </div>
                ) : (
                  unassignedUsers.map((user) => (
                    <label
                      key={user.userSubId}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(`user-${user.userSubId}`)}
                        onChange={() => toggleUser(`user-${user.userSubId}`)}
                        className="w-5 h-5 accent-blue-500"
                      />
                      <span>{user.businessName}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Input de búsqueda */}
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Árbol de organigrama */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 max-h-[450px] overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando organigrama...</p>
          ) : !orgChartData || orgChartData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No se pudo cargar el organigrama</p>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {renderLevel(orgChartData, 0)}

              {searchTerm && !orgChartData.some(node => filterNode(node)) && (
                <p className="text-gray-500 text-center py-8">
                  No se encontraron resultados
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleClose}
            className="flex-1 max-w-[181px] px-2 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 max-w-[181px] px-2 py-2 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
          >
            Confirmar selección
          </button>
        </div>
      </div>
    </>
  );
}

export default FilterUsersModal;
