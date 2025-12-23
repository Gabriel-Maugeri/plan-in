/**
 * Formatea los datos del usuario del frontend al formato del backend
 */
export function formatUserForAPI(formData) {
  return {
    userName: formData.usuarioAcceso,
    businessName: formData.nombreApellido,
    rol: {
      rolId: formData.rol,
    },
    seniority: formData.seniority ? {
      seniorityId: formData.seniority,
    } : null,
    emailAddress: formData.correoUsuario,
    emailAddressSend: formData.correoEnvios || null,
    isActive: formData.habilitado,
    copyByEmail: formData.copiarCorreos,
    signature: formData.firma || null,
  };
}

/**
 * Formatea los datos del usuario del backend al formato del frontend
 */
export function formatUserFromAPI(userData) {
  return {
    nombreApellido: userData.businessName || "",
    usuarioAcceso: userData.userName || "",
    correoUsuario: userData.emailAddress || "",
    rol: userData.rol?.rolId || null,
    seniority: userData.seniority?.seniorityId || null,
    estadoUsuario: userData.isActive ? "Activo" : "Inactivo",
    correoEnvios: userData.emailAddressSend || "",
    habilitado: userData.isActive,
    copiarCorreos: userData.copyByEmail,
    firma: userData.signature || "",
  };
}

/**
 * Obtiene el nombre completo del rol desde el rolName
 */
export function getRoleName(user) {
  return user.rol?.rolName || '';
}

/**
 * Obtiene el nombre de seniority
 */
export function getSeniorityName(user) {
  return user.seniority?.nameSeniority || 'Sin asignar';
}
