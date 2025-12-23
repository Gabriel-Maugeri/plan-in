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
      `${import.meta.env.VITE_API_REPORTS_URL}/reports/productidad`,
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
