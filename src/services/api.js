import { STORAGE_KEYS, COUNTRY_CODES } from "../utils/constants";

const getHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return {
    "Content-Type": "application/json",
    "Country-Code": COUNTRY_CODES.AR,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const usersAPI = {
  getAll: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_ABMS_URL}/users`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener usuarios");
    return response.json();
  },

  getById: async (userSubId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${userSubId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener usuario");
    return response.json();
  },

  create: async (userData) => {
    const response = await fetch(`${import.meta.env.VITE_API_ABMS_URL}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Error al crear usuario");
    return response.json();
  },

  update: async (userData) => {
    const response = await fetch(`${import.meta.env.VITE_API_ABMS_URL}/users`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Error al actualizar usuario");
    return response.json();
  },

  delete: async (userSubId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${userSubId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al eliminar usuario");
    return response.json();
  },

  resetPassword: async (userSubId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${userSubId}/reset-password`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al blanquear contraseña");
    return response.json();
  },

  emailExists: async (emailAddress) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${encodeURIComponent(
        emailAddress
      )}/email-exist`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al validar email");
    return response.json();
  },

  userExists: async (userName) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${encodeURIComponent(
        userName
      )}/user-exist`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al validar usuario");
    return response.json();
  },

  emailSendExists: async (emailAddressSend) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${encodeURIComponent(
        emailAddressSend
      )}/email-send-exist`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al validar email de envío");
    return response.json();
  },

  emailSendValid: async (emailAddressSend) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/users/${encodeURIComponent(
        emailAddressSend
      )}/email-send-valid`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al validar email de envío");
    return response.json();
  },
};

export const rolesAPI = {
  getAll: async () => {
    const response = await fetch(`${import.meta.env.VITE_API_ABMS_URL}/roles`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener roles");
    return response.json();
  },
};

export const senioritiesAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/seniorities`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener seniorities");
    return response.json();
  },
};

export const organizationChartsAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/organization-charts`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener organigrama");
    return response.json();
  },
};

export const securityAPI = {
  authenticate: async (credentials) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_SECURITY_URL}/security/authenticate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Country-Code": "AR",
        },
        body: JSON.stringify(credentials),
      }
    );
    if (!response.ok) throw new Error("Error al autenticar");
    return response.json();
  },

  changePassword: async (passwordData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_SECURITY_URL}/security/change-password`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(passwordData),
      }
    );
    if (!response.ok) throw new Error("Error al cambiar contraseña");
    return response.json();
  },

  recoverPassword: async (emailData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_SECURITY_URL}/security/recover-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      }
    );
    if (!response.ok) throw new Error("Error al recuperar contraseña");
    return response.json();
  },

  resendVerificationEmail: async (emailData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_SECURITY_URL}/security/resend-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      }
    );
    if (!response.ok) throw new Error("Error al reenviar verificación");
    return response.json();
  },

  logout: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_SECURITY_URL}/security/log-out`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al cerrar sesión");
    return response.ok;
  },
};

export const signaturesAPI = {
  get: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/signatures`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener firma");
    return response.json();
  },
};

export const reportsAPI = {
  getProductivity: async (filters = {}) => {
    const payload = {
      labelIds: filters.labelIds || [],
    };

    if (filters.fromDay) {
      payload.fromDay = filters.fromDay;
    }
    if (filters.toDay) {
      payload.toDay = filters.toDay;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_REPORTS_URL}/reports/productivity`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );
    
    if (!response.ok) throw new Error("Error al obtener datos de productividad");
    return response.json();
  },
};

export const viewsAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_REPORTS_URL}/productivity-view`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener vistas");
    return response.json();
  },

  create: async (viewData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_REPORTS_URL}/productivity-view`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: viewData.name,
          rows: viewData.rows || [],
          cols: viewData.cols || [],
        }),
      }
    );
    if (!response.ok) throw new Error("Error al crear vista");
    return response.json();
  },

  update: async (viewId, viewData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_REPORTS_URL}/productivity-view`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          productivityViewId: viewId,
          name: viewData.name,
          rows: viewData.rows || [],
          cols: viewData.cols || [],
        }),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar vista");
    return response.json();
  },

  delete: async (viewId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_REPORTS_URL}/productivity-view/${viewId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al eliminar vista");
    return response.ok;
  },
};

export const vatTypesAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/vat-types`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener tipos de IVA");
    return response.json();
  },

  create: async (labelData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/labels`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(labelData),
      }
    );
    if (!response.ok) throw new Error("Error al crear etiqueta");
    return response.json();
  },

  update: async (labelId, labelData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/labels/${labelId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(labelData),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar etiqueta");
    return response.ok;
  },

  delete: async (labelId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/labels/${labelId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al eliminar etiqueta");
    return response.ok;
  },
};

export const contactsAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts?includeClients=true`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener contactos");
    return response.json();
  },

  create: async (contactData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      }
    );
    if (!response.ok) throw new Error("Error al crear contacto");
    return response.json();
  },

  update: async (contactId, contactData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts/${contactId}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(contactData),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar contacto");
    return response.json();
  },

  delete: async (contactId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts/${contactId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al eliminar contacto");
    return response.ok;
  },

  associateClient: async (contactId, clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts/${contactId}/clients/${clientId}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al asociar cliente");
    return response.ok;
  },

  disassociateClient: async (contactId, clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts/${contactId}/clients/${clientId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al desasociar cliente");
    return response.ok;
  },

  getClients: async (contactId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/contacts/${contactId}/clients`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener clientes del contacto");
    return response.json();
  },
};

export const clientesAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/clients`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener clientes");
    return response.json();
  },

  getContacts: async (clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/clients/${clientId}/contacts`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener contactos del cliente");
    return response.json();
  },

  create: async (clientData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ABMS_URL}/clients`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(clientData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || "Error al crear cliente");
      }
      return response.json();
    } catch (error) {
      console.error("Error en create cliente:", error);
      throw error;
    }
  },

  update: async (clientId, clientData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_ABMS_URL}/clients/${clientId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(clientData),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.title || "Error al actualizar cliente");
      }
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error("Error en update cliente:", error);
      throw error;
    }
  },

  enable: async (clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/clients/${clientId}/enable`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al activar cliente");
    return response.ok;
  },

  disable: async (clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/clients/${clientId}/disable`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al desactivar cliente");
    return response.ok;
  },

  delete: async (clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/clients/${clientId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al eliminar cliente");
    return response.ok;
  },

  getMainContact: async (clientId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/clients/${clientId}/contacts/main`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener contacto principal");
    return response.json();
  },
};

export const labelsAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/labels`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener etiquetas");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/labels/${id}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener etiqueta");
    return response.json();
  },
};

export const legalEntityTypesAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/legal-entity-types`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener tipos societarios");
    return response.json();
  },
};

export const fiscalJurisdictionsAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/fiscal-jurisdictions`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener jurisdicciones");
    return response.json();
  },
};

export const fiscalActivitiesAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/fiscal-activities`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener actividades fiscales");
    return response.json();
  },
};

export const paymentPlatformAPI = {
  getAll: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/payment-platform`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener plataformas de pago");
    return response.json();
  },
};

export const studyAPI = {
  get: async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/study`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Error al obtener datos del estudio");
    return response.json();
  },

  update: async (studyData) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_ABMS_URL}/study`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(studyData),
      }
    );
    if (!response.ok) throw new Error("Error al actualizar datos del estudio");
    return response.json();
  },
};
