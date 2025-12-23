export * from '../../utils/constants';

export const PASSWORD_MIN_LENGTH = 6;

export const PASSWORD_REQUIREMENTS = {
  SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/,
  UPPER_CASE: /[A-Z]/,
  LOWER_CASE: /[a-z]/,
  NUMBER: /\d/,
};

export const USER_ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERATOR: 'Operador',
  SUPERVISOR_LITE: 'Supervisor Lite',
  CLIENT: 'Cliente',
  CLIENT_EMPLOYEE: 'Cliente Empleado',
};

export const USER_STATES = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
  NONE: null,
};

export const COUNTRY_CODES = {
  AR: 'AR',
  UY: 'UY',
  CL: 'CL',
};

export const COUNTRIES = [
  { value: COUNTRY_CODES.AR, label: 'Argentina' },
  { value: COUNTRY_CODES.UY, label: 'Uruguay' },
  { value: COUNTRY_CODES.CL, label: 'Chile' },
];
