import { useState, useEffect, useRef } from "react";
import { X, Star, Ellipsis, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { labelsAPI, legalEntityTypesAPI, fiscalJurisdictionsAPI, fiscalActivitiesAPI, paymentPlatformAPI, contactsAPI, clientesAPI, vatTypesAPI } from '../../services/api';
import AddContactModal from '../../abm-contactos/components/AddContactModal';
import EditContactModal from '../../abm-contactos/components/EditContactModal';
import ManageClientsModal from '../../abm-contactos/components/ManageClientsModal';
import ManageLabelsModal from './ManageLabelsModal';
import { useToast } from '../../components/ToastContainer';

function ClientBadgesCell({ clients, onManageClients }) {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(clients?.length || 0);

  useEffect(() => {
    const calculateVisibleBadges = () => {
      if (!containerRef.current || !clients || clients.length === 0) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const gap = 4;
      const plusBadgeWidth = 50;
      let totalWidth = 0;
      let count = 0;

      const tempDiv = document.createElement('div');
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.className = 'px-2 py-1 text-xs';
      document.body.appendChild(tempDiv);

      for (let i = 0; i < clients.length; i++) {
        const text = clients[i].businessName || clients[i];
        tempDiv.textContent = text;
        const badgeWidth = tempDiv.offsetWidth + 16;
        
        const neededWidth = totalWidth + badgeWidth + (i > 0 ? gap : 0);
        const willNeedPlusBadge = i < clients.length - 1;
        const totalNeededWidth = neededWidth + (willNeedPlusBadge ? gap + plusBadgeWidth : 0);

        if (totalNeededWidth > containerWidth) {
          break;
        }

        totalWidth = neededWidth;
        count++;
      }

      document.body.removeChild(tempDiv);
      setVisibleCount(Math.max(1, count));
    };

    calculateVisibleBadges();
    window.addEventListener('resize', calculateVisibleBadges);
    return () => window.removeEventListener('resize', calculateVisibleBadges);
  }, [clients]);

  if (!clients || clients.length === 0) {
    return <span className="text-sm text-gray-400">-</span>;
  }

  return (
    <div ref={containerRef} className="flex flex-wrap gap-1">
      {clients.slice(0, visibleCount).map((client, idx) => (
        <button
          key={idx}
          onClick={onManageClients}
          className="px-2 py-1 bg-[#E0E0E0] rounded-full text-xs hover:bg-[#D0D0D0] cursor-pointer whitespace-nowrap"
        >
          {client.businessName || client}
        </button>
      ))}
      {clients.length > visibleCount && (
        <button
          onClick={onManageClients}
          className="px-2 py-1 bg-[#C5CAE9] text-[#3F51B5] rounded-full text-xs hover:bg-[#B5BAD9] cursor-pointer whitespace-nowrap"
        >
          +{clients.length - visibleCount}
        </button>
      )}
    </div>
  );
}

function AddClientModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showEtiquetasDropdown, setShowEtiquetasDropdown] = useState(false);
  const [showActivitiesDropdown, setShowActivitiesDropdown] = useState(false);
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [labelSearchTerm, setLabelSearchTerm] = useState('');
  const [contactViewMode, setContactViewMode] = useState("todos");
  const [contactFilters, setContactFilters] = useState({
    id: '',
    nombreApellido: '',
    correo: '',
    clientes: '',
    usuarioApp: '',
    estado: ''
  });
  const [contactSortConfig, setContactSortConfig] = useState({
    key: null,
    direction: null
  });
  const [openContactMenuIndex, setOpenContactMenuIndex] = useState(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showManageClientsModal, setShowManageClientsModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showManageLabelsModal, setShowManageLabelsModal] = useState(false);
  
  const [availableLabels, setAvailableLabels] = useState([]);
  const [legalEntityTypes, setLegalEntityTypes] = useState([]);
  const [fiscalJurisdictions, setFiscalJurisdictions] = useState([]);
  const [fiscalActivities, setFiscalActivities] = useState([]);
  const [paymentPlatforms, setPaymentPlatforms] = useState([]);
  const [vatTypes, setVatTypes] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [mainActivityCode, setMainActivityCode] = useState('');
  const [allContacts, setAllContacts] = useState([]);
  const [clientContacts, setClientContacts] = useState([]);
  const [newlySelectedContactIds, setNewlySelectedContactIds] = useState([]);

  const [formData, setFormData] = useState({
    nombreRazonSocial: "",
    cuit: "",
    tipoSocietario: "",
    domicilioFiscal: "",
    jurisdiccionFiscal: "",
    domicilioLegal: "",
    jurisdiccionLegal: "",
    estadoCliente: "Activo",
    condicionIVA: "",
    numeroInscripcionIIBB: "",
    mesCierre: "",
    plataformaPagosVEPs: "",
    actividadAFIP: "",
    registroPublicoComercio: "",
    numeroInscripcion: "",
    campoNotas: "",
    etiquetas: [],
    portalCliente: false,
    notificacionesAFIP: false,
  });

  const [principalContactId, setPrincipalContactId] = useState(null);
  const [mainContactType, setMainContactType] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
      fetchAllContacts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (showAddContactModal) {
      window.addContactToTable = handleAddContactFromModal;
    }
    return () => {
      delete window.addContactToTable;
    };
  }, [showAddContactModal]);

  const fetchDropdownData = async () => {
    try {
      const [labels, legalTypes, jurisdictions, activities, platforms, vats] = await Promise.all([
        labelsAPI.getAll(),
        legalEntityTypesAPI.getAll(),
        fiscalJurisdictionsAPI.getAll(),
        fiscalActivitiesAPI.getAll(),
        paymentPlatformAPI.getAll(),
        vatTypesAPI.getAll()
      ]);
      
      setAvailableLabels(labels);
      setLegalEntityTypes(legalTypes);
      setFiscalJurisdictions(jurisdictions);
      setFiscalActivities(activities);
      setPaymentPlatforms(platforms);
      setVatTypes(vats);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const fetchAllContacts = async () => {
    try {
      const contacts = await contactsAPI.getAll();
      setAllContacts(contacts);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
    }
  };

  const handleAddContactFromModal = (newContact) => {
    const contactWithClients = {
      ...newContact,
      clients: newContact.clients || []
    };
    setAllContacts(prev => [...prev, contactWithClients]);
    setNewlySelectedContactIds(prev => {
      const newIds = [...prev, newContact.contactId];
      // Set as principal if it's the first one
      if (newIds.length === 1) {
        setPrincipalContactId(newContact.contactId);
        setMainContactType(0);
      }
      return newIds;
    });
    // Switch to "Contactos del Cliente" view
    setContactViewMode("cliente");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEtiquetaToggle = (etiqueta) => {
    setFormData((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.includes(etiqueta)
        ? prev.etiquetas.filter((e) => e !== etiqueta)
        : [...prev.etiquetas, etiqueta],
    }));
  };

  const handleContactAssociation = (contactId) => {
    setNewlySelectedContactIds((prev) => {
      const newIds = prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId];
      
      // Set first selected contact as principal by default
      if (newIds.length > 0 && !principalContactId) {
        setPrincipalContactId(newIds[0]);
        setMainContactType(0);
      } else if (newIds.length === 0) {
        setPrincipalContactId(null);
        setMainContactType(0);
      } else if (contactId === principalContactId && !newIds.includes(contactId)) {
        // If deselecting the principal contact, set new principal
        setPrincipalContactId(newIds[0] || null);
        setMainContactType(0);
      }
      
      return newIds;
    });
  };

  const handleSetPrincipal = (contactId) => {
    setPrincipalContactId(contactId);
    setMainContactType(0);
  };

  const handleSetMainContactType = (contactId, type) => {
    // Always move principal to this contact when selecting email/usuario star
    setPrincipalContactId(contactId);
    setMainContactType(type);
  };

  const isContactSelected = (contactId) => {
    return newlySelectedContactIds.includes(contactId);
  };

  const isContactPrincipal = (contactId) => {
    return principalContactId === contactId;
  };

  const handleContactFilterChange = (field, value) => {
    setContactFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSort = (key) => {
    let direction = 'desc';
    if (contactSortConfig.key === key) {
      if (contactSortConfig.direction === 'desc') {
        direction = 'asc';
      } else if (contactSortConfig.direction === 'asc') {
        direction = null;
      }
    }
    setContactSortConfig({ key: direction ? key : null, direction });
  };

  const getContactSortIcon = (key) => {
    if (contactSortConfig.key !== key || contactSortConfig.direction === null) {
      return <ArrowUpDown className="w-4 h-4 ml-2" />;
    }
    if (contactSortConfig.direction === 'desc') {
      return <ArrowDown className="w-4 h-4 ml-2" />;
    }
    return <ArrowUp className="w-4 h-4 ml-2" />;
  };

  const handleClose = () => {
    setCurrentStep(1);
    setContactViewMode("todos");
    setAllContacts([]);
    setClientContacts([]);
    setNewlySelectedContactIds([]);
    setPrincipalContactId(null);
    setMainContactType(0);
    setSelectedActivities([]);
    setMainActivityCode('');
    setFormData({
      nombreRazonSocial: "",
      cuit: "",
      tipoSocietario: "",
      domicilioFiscal: "",
      jurisdiccionFiscal: "",
      domicilioLegal: "",
      jurisdiccionLegal: "",
      estadoCliente: "Activo",
      condicionIVA: "",
      numeroInscripcionIIBB: "",
      mesCierre: "",
      plataformaPagosVEPs: "",
      actividadAFIP: "",
      registroPublicoComercio: "",
      numeroInscripcion: "",
      campoNotas: "",
      etiquetas: [],
      portalCliente: false,
      notificacionesAFIP: false,
    });
    onClose();
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!formData.nombreRazonSocial || !formData.condicionIVA || !formData.tipoSocietario || 
          !formData.mesCierre || !formData.plataformaPagosVEPs || !formData.jurisdiccionFiscal || 
          !formData.jurisdiccionLegal) {
        alert('Por favor complete todos los campos obligatorios marcados con *');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.etiquetas.length === 0) {
        alert('Por favor seleccione al menos una etiqueta');
        return;
      }
      setCurrentStep(3);
    } else {
      try {
        const clientPayload = {
          businessName: formData.nombreRazonSocial,
          legalEntityTypeId: parseInt(formData.tipoSocietario) || 0,
          fiscalAddress: formData.domicilioFiscal,
          fiscalJurisdictionId: parseInt(formData.jurisdiccionFiscal) || 0,
          legalAddress: formData.domicilioLegal,
          legalJurisdictionId: parseInt(formData.jurisdiccionLegal) || 0,
          taxIdentification: formData.cuit,
          closingMonth: parseInt(formData.mesCierre) || 0,
          grossIncomeTypeId: 1,
          iibbNumber: formData.numeroInscripcionIIBB,
          paymentPlatformId: parseInt(formData.plataformaPagosVEPs) || 0,
          portalStatus: formData.portalCliente ? 1 : 0,
          portalPassword: "",
          termsAndConditions: false,
          rpcDate: formData.registroPublicoComercio || null,
          rpcNumber: formData.numeroInscripcion,
          rutTypeId: parseInt(formData.condicionIVA) || 0,
          legalRepresentative: "",
          viewFiscalNotification: formData.notificacionesAFIP,
          notes: formData.campoNotas,
          vatTypeIds: [],
          labelIds: formData.etiquetas.map(id => parseInt(id)),
          earningsConditionIds: [],
          fiscalActivities: selectedActivities.map(code => ({
            filcalActivityId: code,
            isMain: code === mainActivityCode
          })),
          contacts: newlySelectedContactIds.map(contactId => ({
            contactId: parseInt(contactId),
            isMain: contactId === principalContactId,
            mainContactTypeId: contactId === principalContactId ? mainContactType : 0
          }))
        };

        const newClient = await clientesAPI.create(clientPayload);
        
        if (window.addClientToTable) {
          window.addClientToTable({
            id: newClient.clientId,
            cliente: newClient.businessName,
            cuit: newClient.taxIdentification,
            tipoSocietario: newClient.legalEntityTypeId,
            labelIds: newClient.labelIds || []
          });
        }
        
        addToast('Cliente creado correctamente', 'success');
        handleClose();
      } catch (error) {
        console.error('Error al crear cliente:', error);
        addToast('Error al crear el cliente', 'error');
      }
    }
  };

  const getFilteredContacts = () => {
    let contacts = contactViewMode === "todos" 
      ? allContacts 
      : allContacts.filter(contact => newlySelectedContactIds.includes(contact.contactId));

    // Apply filters
    contacts = contacts.filter(contact => {
      return (
        contact.contactId.toString().includes(contactFilters.id) &&
        (contact.contact || '').toLowerCase().includes(contactFilters.nombreApellido.toLowerCase()) &&
        (contact.mail || '').toLowerCase().includes(contactFilters.correo.toLowerCase()) &&
        (contact.usernameApp || '').toLowerCase().includes(contactFilters.usuarioApp.toLowerCase())
      );
    });

    // Apply sorting
    if (contactSortConfig.key && contactSortConfig.direction) {
      contacts.sort((a, b) => {
        let aVal = a[contactSortConfig.key === 'nombreApellido' ? 'contact' : 
                     contactSortConfig.key === 'correo' ? 'mail' : 
                     contactSortConfig.key === 'id' ? 'contactId' :
                     contactSortConfig.key === 'usuarioApp' ? 'usernameApp' : contactSortConfig.key];
        let bVal = b[contactSortConfig.key === 'nombreApellido' ? 'contact' : 
                     contactSortConfig.key === 'correo' ? 'mail' : 
                     contactSortConfig.key === 'id' ? 'contactId' :
                     contactSortConfig.key === 'usuarioApp' ? 'usernameApp' : contactSortConfig.key];
        
        if (aVal < bVal) return contactSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return contactSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return contacts;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-[#27353E2E] z-40"
        onClick={handleClose}
      />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 h-[97vh] max-h-[97vh] overflow-hidden shadow-2xl flex flex-col ${currentStep === 3 ? ' w-[90vw] max-w-[90vw]' : ' max-w-[800px] w-[800px]' }`}>
        <div className="flex justify-center items-center px-8 py-6 relative">
          <h2 className="text-xl font-normal">Agregar Cliente</h2>
          <button
            onClick={handleClose}
            className="hover:bg-gray-100 p-1 rounded-full absolute right-8"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 px-8 py-4 bg-white justify-center">
          <button
            className={`pb-2 px-6 flex items-center gap-2 text-sm border-b-2 ${
              currentStep === 1
                ? "text-[#72BFDD] border-[#72BFDD]"
                : "text-gray-500 border-transparent"
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            Datos Fiscales
          </button>
          <button
            className={`pb-2 px-6 flex items-center gap-2 text-sm border-b-2 ${
              currentStep === 2
                ? "text-[#72BFDD] border-[#72BFDD]"
                : "text-gray-500 border-transparent"
            }`}
            onClick={() => setCurrentStep(2)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Datos Complementarios
          </button>
          <button
            className={`pb-2 px-6 flex items-center gap-2 text-sm border-b-2 ${
              currentStep === 3
                ? "text-[#72BFDD] border-[#72BFDD]"
                : "text-gray-500 border-transparent"
            }`}
            onClick={() => setCurrentStep(3)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Contactos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">
                    Nombre/Razón Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombreRazonSocial}
                    onChange={(e) =>
                      handleInputChange("nombreRazonSocial", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    Condición ante IVA <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.condicionIVA}
                      onChange={(e) =>
                        handleInputChange("condicionIVA", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled hidden>Seleccionar</option>
                      {vatTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.type}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="currentColor"
                    >
                      <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">CUIT</label>
                  <input
                    type="text"
                    value={formData.cuit}
                    placeholder="0-00000000-0"
                    onChange={(e) => handleInputChange("cuit", e.target.value)}
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    Número inscripción IIBB
                  </label>
                  <input
                    type="text"
                    value={formData.numeroInscripcionIIBB}
                    onChange={(e) =>
                      handleInputChange("numeroInscripcionIIBB", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">
                    Tipo Societario <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.tipoSocietario}
                      onChange={(e) =>
                        handleInputChange("tipoSocietario", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled hidden>Seleccionar</option>
                      {legalEntityTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.type}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="currentColor"
                    >
                      <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    Mes de Cierre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.mesCierre}
                      onChange={(e) =>
                        handleInputChange("mesCierre", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="0">Enero</option>
                      <option value="1">Febrero</option>
                      <option value="2">Marzo</option>
                      <option value="3">Abril</option>
                      <option value="4">Mayo</option>
                      <option value="5">Junio</option>
                      <option value="6">Julio</option>
                      <option value="7">Agosto</option>
                      <option value="8">Septiembre</option>
                      <option value="9">Octubre</option>
                      <option value="10">Noviembre</option>
                      <option value="11">Diciembre</option>
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="currentColor"
                    >
                      <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Domicilio Fiscal</label>
                <input
                  type="text"
                  value={formData.domicilioFiscal}
                  onChange={(e) =>
                    handleInputChange("domicilioFiscal", e.target.value)
                  }
                  className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                />
              </div>
              <div>
                  <label className="block text-sm mb-2">
                    Plataforma de Pagos VEPs{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.plataformaPagosVEPs}
                      onChange={(e) =>
                        handleInputChange("plataformaPagosVEPs", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="">Seleccionar</option>
                      {paymentPlatforms.map((platform) => (
                        <option key={platform.id} value={platform.id}>
                          {platform.description}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="currentColor"
                    >
                      <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">
                    Seleccionar Jurisdicción{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.jurisdiccionFiscal}
                      onChange={(e) =>
                        handleInputChange("jurisdiccionFiscal", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled hidden>Seleccionar</option>
                      {fiscalJurisdictions.map((jurisdiction) => (
                        <option key={jurisdiction.id} value={jurisdiction.id}>
                          {jurisdiction.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="currentColor"
                    >
                      <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm mb-2">Actividad AFIP</label>
                  <div
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg cursor-pointer min-h-[40px] flex items-center"
                    onClick={() => setShowActivitiesDropdown(!showActivitiesDropdown)}
                  >
                    {selectedActivities.length > 0 ? (
                      <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                        {selectedActivities.map(code => {
                          const activity = fiscalActivities.find(a => a.code === code);
                          return activity ? activity.name : '';
                        }).filter(Boolean).join(", ")}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Seleccionar Actividad(es)
                      </span>
                    )}
                  </div>
                  {showActivitiesDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowActivitiesDropdown(false)}
                      />
                      <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-[280px] overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder="Buscar actividad..."
                            value={activitySearchTerm}
                            onChange={(e) => setActivitySearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 bg-gray-50 rounded border border-gray-300 outline-none text-sm"
                          />
                        </div>
                        <div className="overflow-y-auto py-2">
                          {fiscalActivities.filter(activity => 
                            activity.name.toLowerCase().includes(activitySearchTerm.toLowerCase())
                          ).map((activity) => (
                          <label 
                            key={activity.code}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMainActivityCode(activity.code);
                                if (!selectedActivities.includes(activity.code)) {
                                  setSelectedActivities(prev => [...prev, activity.code]);
                                }
                              }}
                              className="shrink-0"
                            >
                              <Star 
                                className={`w-5 h-5 ${
                                  mainActivityCode === activity.code
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                              />
                            </button>
                            <span className="flex-1 text-sm">{activity.name}</span>
                            <input
                              type="checkbox"
                              checked={selectedActivities.includes(activity.code)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedActivities(prev => [...prev, activity.code]);
                                  if (!mainActivityCode) {
                                    setMainActivityCode(activity.code);
                                  }
                                } else {
                                  setSelectedActivities(prev => prev.filter(c => c !== activity.code));
                                  if (mainActivityCode === activity.code) {
                                    setMainActivityCode('');
                                  }
                                }
                              }}
                              className="w-4 h-4 accent-[#72BFDD]"
                            />
                          </label>
                        ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Domicilio Legal</label>
                  <input
                    type="text"
                    value={formData.domicilioLegal}
                    onChange={(e) =>
                      handleInputChange("domicilioLegal", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    Registro Publico de Comercio
                  </label>
                  <input
                    type="date"
                    value={formData.registroPublicoComercio}
                    onChange={(e) =>
                      handleInputChange(
                        "registroPublicoComercio",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">
                    Seleccionar Jurisdicción{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.jurisdiccionLegal}
                      onChange={(e) =>
                        handleInputChange("jurisdiccionLegal", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm appearance-none cursor-pointer"
                    >
                      <option value="" disabled hidden>Seleccionar</option>
                      {fiscalJurisdictions.map((jurisdiction) => (
                        <option key={jurisdiction.id} value={jurisdiction.id}>
                          {jurisdiction.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="currentColor"
                    >
                      <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">
                    N.° de inscripción
                  </label>
                  <input
                    type="text"
                    value={formData.numeroInscripcion}
                    onChange={(e) =>
                      handleInputChange("numeroInscripcion", e.target.value)
                    }
                    className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Estado del Cliente</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="estadoCliente"
                      value="Activo"
                      checked={formData.estadoCliente === "Activo"}
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 opacity-50">
                    <input
                      type="radio"
                      name="estadoCliente"
                      value="Inactivo"
                      checked={formData.estadoCliente === "Inactivo"}
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Campo de notas</label>
                <textarea
                  placeholder="Aclaraciones o comentarios..."
                  value={formData.campoNotas}
                  onChange={(e) =>
                    handleInputChange("campoNotas", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm resize-none"
                  rows="4"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm">
                    Etiqueta(s) <span className="text-red-500">*</span>
                  </label>
                  <button 
                    onClick={() => setShowManageLabelsModal(true)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                    Nueva Etiqueta
                  </button>
                </div>
                <div
                  className="w-full px-4 py-2 bg-[#F5F5F5] rounded-lg cursor-pointer min-h-[40px] flex items-center"
                  onClick={() =>
                    setShowEtiquetasDropdown(!showEtiquetasDropdown)
                  }
                >
                  {formData.etiquetas.length > 0 ? (
                    <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                      {formData.etiquetas.map(labelId => {
                        const label = availableLabels.find(l => l.labelId === labelId);
                        return label ? label.labelName : '';
                      }).filter(Boolean).join(", ")}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Seleccionar Etiqueta(s)
                    </span>
                  )}
                </div>
                {showEtiquetasDropdown && (
                  <div className="w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-[230px] overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Buscar etiqueta..."
                        value={labelSearchTerm}
                        onChange={(e) => setLabelSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 bg-gray-50 rounded border border-gray-300 outline-none text-sm"
                      />
                    </div>
                    <div className="overflow-y-auto py-2">
                      {availableLabels.filter(label =>
                        label.labelName.toLowerCase().includes(labelSearchTerm.toLowerCase())
                      ).map((label) => (
                      <label
                        key={label.labelId}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.etiquetas.includes(label.labelId)}
                          onChange={() => handleEtiquetaToggle(label.labelId)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{label.labelName}</span>
                      </label>
                    ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-medium mb-4">
                  Portal de Clientes
                </h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <span className="text-sm block mb-2">Portal del Cliente</span>
                    <button
                      onClick={() =>
                        handleInputChange(
                          "portalCliente",
                          !formData.portalCliente
                        )
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        formData.portalCliente ? "bg-[#72BFDD]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          formData.portalCliente ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div>
                    <span className="text-sm block mb-2">
                      Cliente ve notificaciones de AFIP
                    </span>
                    <button
                      onClick={() =>
                        handleInputChange(
                          "notificacionesAFIP",
                          !formData.notificacionesAFIP
                        )
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        formData.notificacionesAFIP
                          ? "bg-[#72BFDD]"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          formData.notificacionesAFIP ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setContactViewMode("todos")}
                    className={`px-6 py-2 rounded-full text-sm ${
                      contactViewMode === "todos"
                        ? "bg-[#72BFDD] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Todos los Contactos
                  </button>
                  <button
                    onClick={() => setContactViewMode("cliente")}
                    className={`px-6 py-2 rounded-full text-sm ${
                      contactViewMode === "cliente"
                        ? "bg-[#72BFDD] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Contactos del Cliente
                  </button>
                </div>
                <button
                  onClick={() => setShowAddContactModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#72BFDD] text-white rounded-full text-sm hover:bg-[#5fa8c4]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                  Agregar Contacto
                </button>
              </div>

              <div className="overflow-auto flex-1">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#424242] text-white text-left text-sm rounded-t-3xl">
                      {contactViewMode === "cliente" && (
                        <th
                          className={`p-3 w-12 ${
                            contactViewMode === "cliente"
                              ? "rounded-tl-3xl"
                              : ""
                          }`}
                        ></th>
                      )}
                      <th className={`p-3 ${contactViewMode === "todos" ? "rounded-tl-3xl" : ""}`}>
                        <button onClick={() => handleContactSort('id')} className="flex items-center hover:opacity-80">
                          ID
                          {getContactSortIcon('id')}
                        </button>
                      </th>
                      {contactViewMode === "todos" && (
                        <th className="p-3">Asociado</th>
                      )}
                      <th className="p-3">
                        <button onClick={() => handleContactSort('nombreApellido')} className="flex items-center hover:opacity-80">
                          Nombre y Apellido
                          {getContactSortIcon('nombreApellido')}
                        </button>
                      </th>
                      {contactViewMode === "cliente" && (
                        <th className="p-3 w-12"></th>
                      )}
                      <th className="p-3">
                        <button onClick={() => handleContactSort('correo')} className="flex items-center hover:opacity-80">
                          Correo Electrónico
                          {getContactSortIcon('correo')}
                        </button>
                      </th>
                      <th className="p-3">Clientes</th>
                      {contactViewMode === "cliente" && (
                        <th className="p-3 w-12"></th>
                      )}
                      <th className="p-3">
                        <button onClick={() => handleContactSort('usuarioApp')} className="flex items-center hover:opacity-80">
                          Usuario App
                          {getContactSortIcon('usuarioApp')}
                        </button>
                      </th>
                      <th className="p-3">
                        <button onClick={() => handleContactSort('estado')} className="flex items-center hover:opacity-80">
                          Estado
                          {getContactSortIcon('estado')}
                        </button>
                      </th>
                      <th className="p-3 rounded-tr-3xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {contactViewMode === "cliente" && (
                        <td className="pt-4 pl-4"></td>
                      )}
                      <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                          </svg>
                          <input 
                            type="text"
                            placeholder="Buscar"
                            value={contactFilters.id}
                            onChange={(e) => handleContactFilterChange('id', e.target.value)}
                            className="outline-none text-sm flex-1"
                          />
                        </div>
                      </td>
                      {contactViewMode === "todos" && (
                        <td className="pt-4 pl-4"></td>
                      )}
                      <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                          </svg>
                          <input 
                            type="text"
                            placeholder="Buscar"
                            value={contactFilters.nombreApellido}
                            onChange={(e) => handleContactFilterChange('nombreApellido', e.target.value)}
                            className="outline-none text-sm flex-1"
                          />
                        </div>
                      </td>
                      {contactViewMode === "cliente" && (
                        <td className="pt-4 pl-4"></td>
                      )}
                      <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                          </svg>
                          <input 
                            type="text"
                            placeholder="Buscar"
                            value={contactFilters.correo}
                            onChange={(e) => handleContactFilterChange('correo', e.target.value)}
                            className="outline-none text-sm flex-1"
                          />
                        </div>
                      </td>
                      <td className="pt-4 pl-4"></td>
                      {contactViewMode === "cliente" && (
                        <td className="pt-4 pl-4"></td>
                      )}
                      <td className="pt-4 pl-4">
                        <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                          </svg>
                          <input 
                            type="text"
                            placeholder="Buscar"
                            value={contactFilters.usuarioApp}
                            onChange={(e) => handleContactFilterChange('usuarioApp', e.target.value)}
                            className="outline-none text-sm flex-1"
                          />
                        </div>
                      </td>
                      <td className="pt-4 pl-4"></td>
                      <td className="pt-4 pl-4"></td>
                    </tr>
                    {getFilteredContacts().map((contact, index) => (
                      <tr key={contact.contactId || index} className="border-b border-gray-200">
                        {contactViewMode === "cliente" && (
                          <td className="p-3">
                            <button
                              onClick={() => handleSetPrincipal(contact.contactId)}
                              className={`${
                                isContactPrincipal(contact.contactId)
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              <Star
                                className="w-5 h-5"
                                fill={
                                  isContactPrincipal(contact.contactId)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </td>
                        )}
                        <td className="p-3 text-sm">{contact.contactId}</td>
                        {contactViewMode === "todos" && (
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isContactSelected(contact.contactId)}
                              onChange={() =>
                                handleContactAssociation(contact.contactId)
                              }
                              className="w-4 h-4"
                            />
                          </td>
                        )}
                        <td className="p-3 text-sm">
                          {contact.contact}
                        </td>
                        {contactViewMode === "cliente" && (
                          <td className="p-3">
                            <button
                              onClick={() => handleSetMainContactType(contact.contactId, 0)}
                              className={`${
                                isContactPrincipal(contact.contactId) && mainContactType === 0
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              <Star
                                className="w-5 h-5"
                                fill={
                                  isContactPrincipal(contact.contactId) && mainContactType === 0
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </td>
                        )}
                        <td className="p-3 text-sm">{contact.mail}</td>
                        <td className="p-3">
                          <ClientBadgesCell 
                            clients={contact.clients}
                            onManageClients={() => {
                              setSelectedContact(contact);
                              setShowManageClientsModal(true);
                            }}
                          />
                        </td>
                        {contactViewMode === "cliente" && (
                          <td className="p-3">
                            <button
                              onClick={() => handleSetMainContactType(contact.contactId, 1)}
                              className={`${
                                isContactPrincipal(contact.contactId) && mainContactType === 1
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                            >
                              <Star
                                className="w-5 h-5"
                                fill={
                                  isContactPrincipal(contact.contactId) && mainContactType === 1
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </td>
                        )}
                        <td className="p-3 text-sm">{contact.usernameApp || '-'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: contact.status === 1 ? '#4ADE80' : contact.status === 2 ? '#FB923C' : '#EF4444',
                              }}
                            />
                            <span className="text-sm">
                              {contact.status === 1 ? 'Activo' : contact.status === 2 ? 'Pendiente' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 relative">
                          <button 
                            className="mr-4 hover:bg-gray-100 rounded p-1"
                            onClick={() => setOpenContactMenuIndex(openContactMenuIndex === index ? null : index)}
                          >
                            <Ellipsis/>
                          </button>
                          
                          {openContactMenuIndex === index && (
                            <>
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setOpenContactMenuIndex(null)}
                              />
                              <div className="absolute right-[20%] top-[90%] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 min-w-[220px]">
                                <button 
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                  onClick={() => {
                                    setSelectedContact(contact);
                                    setShowEditContactModal(true);
                                    setOpenContactMenuIndex(null);
                                  }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                  </svg>
                                  <span>Editar contacto</span>
                                </button>
                                <button 
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                  onClick={() => {
                                    setNewlySelectedContactIds(prev => prev.filter(id => id !== contact.contactId));
                                    setAllContacts(prev => prev.filter(c => c.contactId !== contact.contactId));
                                    if (principalContactId === contact.contactId) {
                                      setPrincipalContactId(null);
                                      setMainContactType(0);
                                    }
                                    setOpenContactMenuIndex(null);
                                  }}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18"/>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                  </svg>
                                  <span>Borrar contacto</span>
                                </button>
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 px-8 py-6 bg-white">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
          >
            Cancelar
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
          >
            {currentStep === 3 ? "Agregar Cliente" : "Agregar Cliente"}
          </button>
        </div>
      </div>

      <AddContactModal 
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        hideClientAssociation={true}
      />

      <EditContactModal 
        isOpen={showEditContactModal}
        onClose={() => {
          setShowEditContactModal(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onContactUpdated={(updatedContact) => {
          setAllContacts(prev => prev.map(c => 
            c.contactId === updatedContact.contactId 
              ? { ...updatedContact, clients: updatedContact.clients || c.clients } 
              : c
          ));
        }}
      />

      <ManageClientsModal 
        isOpen={showManageClientsModal}
        onClose={() => {
          setShowManageClientsModal(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        onClientsUpdated={async (contactId) => {
          try {
            const allContacts = await contactsAPI.getAll();
            const updatedContact = allContacts.find(c => c.contactId === contactId);
            if (updatedContact) {
              setAllContacts(prev => prev.map(c => 
                c.contactId === contactId 
                  ? { ...c, clients: updatedContact.clients || [] } 
                  : c
              ));
            }
          } catch (error) {
            console.error('Error al actualizar clientes del contacto:', error);
          }
        }}
      />

      <ManageLabelsModal 
        isOpen={showManageLabelsModal}
        onClose={() => setShowManageLabelsModal(false)}
        onLabelsUpdated={async () => {
          try {
            const labels = await labelsAPI.getAll();
            setAvailableLabels(labels);
          } catch (error) {
            console.error('Error al actualizar etiquetas:', error);
          }
        }}
      />
    </>
  );
}

export default AddClientModal;
