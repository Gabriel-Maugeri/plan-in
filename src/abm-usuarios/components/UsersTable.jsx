import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usersAPI, rolesAPI, organizationChartsAPI } from '../services/api';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import ChangePasswordModal from './ChangePasswordModal';
import { useFilter } from '../context/FilterContext';

function UsersTable() {
    const { filteredUserIds, setOrgChartData } = useFilter();
    
    const [filters, setFilters] = useState({
        nombreApellido: '',
        usuario: '',
        rol: 'Todos',
        seniority: '',
        nivelOrganigrama: '',
        correoUsuario: '',
        correoEnvios: ''
    });

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null
    });

    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [orgChartMap, setOrgChartMap] = useState(new Map());
    const [userToOrgMap, setUserToOrgMap] = useState(new Map());

    useEffect(() => {
        loadUsers();
        loadRoles();
        loadOrganizationCharts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const users = await usersAPI.getAll();
            setData(users);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const loadRoles = async () => {
        try {
            const rolesData = await rolesAPI.getAll();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error al cargar roles:', error);
        }
    };
    
    const loadOrganizationCharts = async () => {
        try {
            const orgData = await organizationChartsAPI.getAll();
            setOrgChartData(orgData);
            
            const orgMap = new Map();
            const userMap = new Map();
            
            const buildMaps = (nodes) => {
                nodes.forEach(node => {
                    orgMap.set(node.organizationChartId, node.organizationChartName);
                    
                    if (node.users && node.users.length > 0) {
                        node.users.forEach(user => {
                            userMap.set(user.userSubId, node.organizationChartId);
                        });
                    }
                    
                    if (node.subordinates) {
                        buildMaps(node.subordinates);
                    }
                });
            };
            
            buildMaps(orgData);
            setOrgChartMap(orgMap);
            setUserToOrgMap(userMap);
        } catch (error) {
            console.error('Error al cargar organization charts:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'desc') {
                direction = 'asc';
            } else if (sortConfig.direction === 'asc') {
                direction = null;
            }
        }
        setSortConfig({ key: direction ? key : null, direction });
    };

    const handleBlanquearClick = (user) => {
        setSelectedUser(user);
        setShowConfirmModal(true);
        setOpenMenuIndex(null);
    };

    const handleConfirmBlanquear = async () => {
        try {
            await usersAPI.resetPassword(selectedUser.userSubId);
            setShowConfirmModal(false);
            setToastMessage('Se ha blanqueado la contraseña. Llegará al usuario por mail en unos minutos.');
            setShowToast(true);
            
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        } catch (error) {
            console.error('Error al blanquear contraseña:', error);
            alert('Error al blanquear la contraseña');
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
        setOpenMenuIndex(null);
    };

    const handleConfirmDelete = async (user) => {
        try {
            await usersAPI.delete(user.userSubId);
            await loadUsers();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar el usuario');
        }
    };

    const handleChangePasswordClick = (user) => {
        setSelectedUser(user);
        setShowChangePasswordModal(true);
        setOpenMenuIndex(null);
    };

    const handleConfirmChangePassword = async (user, newPassword) => {
        try {
            console.log('Cambiando contraseña de:', user, 'Nueva contraseña:', newPassword);
            setShowChangePasswordModal(false);
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            alert('Error al cambiar la contraseña');
        }
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key || sortConfig.direction === null) {
            return (
                <span className="inline-flex flex-col ml-2 gap-1">
                    <ArrowUpDown className="w-4 h-4"/>
                </span>
            );
        }
        if (sortConfig.direction === 'desc') {
            return (
                <span className="inline-flex ml-2">
                    <ArrowDown className="w-4 h-4"/>
                </span>
            );
        }
        return (
            <span className="inline-flex ml-2">
                <ArrowUp className="w-4 h-4"/>
            </span>
        );
    };

    const filteredData = data.filter(row => {
        const businessName = row.businessName || '';
        const userName = row.userName || '';
        const rolName = row.rol?.rolName || '';
        const seniorityName = row.seniority?.nameSeniority || '';
        const emailAddress = row.emailAddress || '';
        const emailAddressSend = row.emailAddressSend || '';
        
        const matchesOrgFilter = !filteredUserIds || filteredUserIds.size === 0 || filteredUserIds.has(row.userSubId);
        
        return (
            matchesOrgFilter &&
            businessName.toLowerCase().includes(filters.nombreApellido.toLowerCase()) &&
            userName.toLowerCase().includes(filters.usuario.toLowerCase()) &&
            (filters.rol === 'Todos' || rolName === filters.rol) &&
            seniorityName.toLowerCase().includes(filters.seniority.toLowerCase()) &&
            emailAddress.toLowerCase().includes(filters.correoUsuario.toLowerCase()) &&
            emailAddressSend.toLowerCase().includes(filters.correoEnvios.toLowerCase())
        );
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key || !sortConfig.direction) return 0;
        
        let aValue, bValue;
        if (sortConfig.key === 'nombreApellido') {
            aValue = (a.businessName || '').toLowerCase();
            bValue = (b.businessName || '').toLowerCase();
        } else if (sortConfig.key === 'usuario') {
            aValue = (a.userName || '').toLowerCase();
            bValue = (b.userName || '').toLowerCase();
        } else if (sortConfig.key === 'rol') {
            aValue = (a.rol?.rolName || '').toLowerCase();
            bValue = (b.rol?.rolName || '').toLowerCase();
        } else if (sortConfig.key === 'seniority') {
            aValue = (a.seniority?.nameSeniority || '').toLowerCase();
            bValue = (b.seniority?.nameSeniority || '').toLowerCase();
        } else if (sortConfig.key === 'nivelOrganigrama') {
            const aOrgId = userToOrgMap.get(a.userSubId);
            const bOrgId = userToOrgMap.get(b.userSubId);
            aValue = (aOrgId ? (orgChartMap.get(aOrgId) || '') : '').toLowerCase();
            bValue = (bOrgId ? (orgChartMap.get(bOrgId) || '') : '').toLowerCase();
        } else if (sortConfig.key === 'correoUsuario') {
            aValue = (a.emailAddress || '').toLowerCase();
            bValue = (b.emailAddress || '').toLowerCase();
        } else if (sortConfig.key === 'correoEnvios') {
            aValue = (a.emailAddressSend || '').toLowerCase();
            bValue = (b.emailAddressSend || '').toLowerCase();
        }
        
        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <p className="text-gray-500">Cargando usuarios...</p>
            </div>
        );
    }

    return(
        <div className="p-6 w-full">
            <table className="w-full table-auto">
            <thead>
                <tr className="bg-[#424242] text-white text-left rounded-t-3xl">
                    <th className="font-normal rounded-tl-3xl p-4 min-w-[150px]">
                        <button 
                            onClick={() => handleSort('nombreApellido')}
                            className="flex items-center hover:opacity-80"
                        >
                            Nombre y Apellido
                            {getSortIcon('nombreApellido')}
                        </button>
                    </th>
                    <th className="font-normal p-4 min-w-[120px]">
                        <button 
                            onClick={() => handleSort('usuario')}
                            className="flex items-center hover:opacity-80"
                        >
                            Usuario
                            {getSortIcon('usuario')}
                        </button>
                    </th>
                    <th className="font-normal p-4 min-w-[100px]">
                        <button 
                            onClick={() => handleSort('rol')}
                            className="flex items-center hover:opacity-80"
                        >
                            Rol
                            {getSortIcon('rol')}
                        </button>
                    </th>
                    <th className="font-normal p-4 min-w-[100px]">
                        <button 
                            onClick={() => handleSort('seniority')}
                            className="flex items-center hover:opacity-80"
                        >
                            Seniority
                            {getSortIcon('seniority')}
                        </button>
                    </th>
                    <th className="font-normal p-4 min-w-[150px]">
                        <button 
                            onClick={() => handleSort('nivelOrganigrama')}
                            className="flex items-center hover:opacity-80"
                        >
                            Nivel Organigrama
                            {getSortIcon('nivelOrganigrama')}
                        </button>
                    </th>
                    <th className="font-normal p-4 min-w-[180px]">
                        <button 
                            onClick={() => handleSort('correoUsuario')}
                            className="flex items-center hover:opacity-80"
                        >
                            Correo de Usuario
                            {getSortIcon('correoUsuario')}
                        </button>
                    </th>
                    <th className="font-normal p-4 min-w-[180px]">
                        <button 
                            onClick={() => handleSort('correoEnvios')}
                            className="flex items-center hover:opacity-80"
                        >
                            Correo de Envios
                            {getSortIcon('correoEnvios')}
                        </button>
                    </th>
                    <th className="font-normal p-4 rounded-tr-3xl min-w-[100px]">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text"
                                placeholder="Buscar"
                                value={filters.nombreApellido}
                                onChange={(e) => handleFilterChange('nombreApellido', e.target.value)}
                                className="outline-none text-sm flex-1"
                            />
                        </div>
                    </td>
                    <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text"
                                placeholder="Buscar"
                                value={filters.usuario}
                                onChange={(e) => handleFilterChange('usuario', e.target.value)}
                                className="outline-none text-sm flex-1"
                            />
                        </div>
                    </td>
                    <td className="pt-4 pl-4">
                        <div className="relative">
                            <select
                                value={filters.rol}
                                onChange={(e) => handleFilterChange('rol', e.target.value)}
                                className="appearance-none rounded px-3 py-1 pr-8 bg-white text-sm outline-none cursor-pointer w-full"
                            >
                                <option value="Todos">Todos</option>
                                {roles.map((rol) => (
                                    <option key={rol.rolId} value={rol.rolName}>
                                        {rol.rolName}
                                    </option>
                                ))}
                            </select>
                            <svg 
                                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" 
                                width="12" 
                                height="8" 
                                viewBox="0 0 12 8" 
                                fill="currentColor"
                            >
                                <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z"/>
                            </svg>
                        </div>
                    </td>
                    <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text"
                                placeholder="Buscar"
                                value={filters.seniority}
                                onChange={(e) => handleFilterChange('seniority', e.target.value)}
                                className="outline-none text-sm flex-1"
                            />
                        </div>
                    </td>
                    <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text"
                                placeholder="Buscar"
                                value={filters.nivelOrganigrama}
                                onChange={(e) => handleFilterChange('nivelOrganigrama', e.target.value)}
                                className="outline-none text-sm flex-1"
                            />
                        </div>
                    </td>
                    <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text"
                                placeholder="Buscar"
                                value={filters.correoUsuario}
                                onChange={(e) => handleFilterChange('correoUsuario', e.target.value)}
                                className="outline-none text-sm flex-1"
                            />
                        </div>
                    </td>
                    <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text"
                                placeholder="Buscar"
                                value={filters.correoEnvios}
                                onChange={(e) => handleFilterChange('correoEnvios', e.target.value)}
                                className="outline-none text-sm flex-1"
                            />
                        </div>
                    </td>
                    <td className="pt-4 pl-4"></td>
                </tr>
                {sortedData.map((row, index) => (
                    <tr key={row.userSubId || index}>
                        <td className="p-4 border-b border-b-[#0000001F]">{row.businessName || ''}</td>
                        <td className="p-4 border-b border-b-[#0000001F]">{row.userName || ''}</td>
                        <td className="p-4 border-b border-b-[#0000001F]">{row.rol?.rolName || ''}</td>
                        <td className="p-4 border-b border-b-[#0000001F]">{row.seniority?.nameSeniority || 'Sin asignar'}</td>
                        <td className="p-4 border-b border-b-[#0000001F]">
                            {(() => {
                                const orgChartId = userToOrgMap.get(row.userSubId);
                                return orgChartId ? (orgChartMap.get(orgChartId) || '-') : '-';
                            })()}
                        </td>
                        <td className="p-4 border-b border-b-[#0000001F]">{row.emailAddress || ''}</td>
                        <td className="p-4 border-b border-b-[#0000001F]">{row.emailAddressSend || ''}</td>
                        <td className="p-4 border-b border-b-[#0000001F] text-right relative">
                            <button 
                                className="mr-4 hover:bg-gray-100 rounded p-1"
                                onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                            >
                                <Ellipsis/>
                            </button>
                            
                            {openMenuIndex === index && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setOpenMenuIndex(null)}
                                    />
                                    <div className="absolute right-[20%] top-[90%] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 min-w-[220px]">
                                        <button 
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                            onClick={() => {
                                                setSelectedUser(row);
                                                setShowEditModal(true);
                                                setOpenMenuIndex(null);
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                            </svg>
                                            <span>Editar usuario</span>
                                        </button>
                                        <button 
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                            onClick={() => handleDeleteClick(row)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18"/>
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                            </svg>
                                            <span>Borrar usuario</span>
                                        </button>
                                        <button 
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                            onClick={() => handleChangePasswordClick(row)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                            <span>Editar contraseña</span>
                                        </button>
                                        <button 
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                            onClick={() => handleBlanquearClick(row)}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                                            </svg>
                                            <span>Blanquear contraseña</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {/* Modal de Confirmación */}
        {showConfirmModal && (
            <>
                <div 
                    className="fixed inset-0 bg-[#27353E2E] z-30 flex items-center justify-center"
                    onClick={() => setShowConfirmModal(false)}
                />
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-40 w-[532px] shadow-2xl">
                    <h2 className="text-3xl font-normal mb-4">Blanquear contraseña</h2>
                    <p className="text-gray-600 mb-2">¿Estás seguro que quieres blanquear la contraseña?</p>
                    <p className="text-gray-600 mb-8">Esta acción no se puede revertir.</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 px-6 py-3 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmBlanquear}
                            className="flex-1 px-6 py-3 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
                        >
                            Blanquear contraseña
                        </button>
                    </div>
                </div>
            </>
        )}
        
        {/* Toast de Éxito */}
        {showToast && (
            <div className="fixed top-4 left-4 z-50 bg-[#E8F5E9] rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">
                <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <span className="text-gray-800">{toastMessage}</span>
            </div>
        )}
        
        {/* Modal de Edición */}
        <EditUserModal 
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            userData={selectedUser}
            onSuccess={() => {
                loadUsers();
                setToastMessage('Usuario actualizado exitosamente');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
            }}
        />
        
        {/* Modal de Eliminar Usuario */}
        <DeleteUserModal 
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            userData={selectedUser}
        />
        
        {/* Modal de Cambiar Contraseña */}
        <ChangePasswordModal 
            isOpen={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
            onConfirm={handleConfirmChangePassword}
            userData={selectedUser}
        />
        </div>
        
    )
}

export default UsersTable