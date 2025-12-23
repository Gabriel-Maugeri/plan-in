export * from '../../utils/constants';

export const COUNTRY_CODES = {
  AR: 'AR',
  UY: 'UY',
  CL: 'CL',
};

export const UNIT_OF_MEASURE = {
  MINUTES: 'Minutos',
  HOURS: 'Horas',
};

export const DATE_FORMAT = 'dd/mm/aaaa';

export const DEFAULT_VIEW = {
  name: 'Vista por defecto',
  rows: ['Usuario'],
  cols: ['Mes Registro'],
};

// Campos predefinidos de la tabla de productividad
export const PRODUCTIVITY_FIELDS = [
  'Usuario',
  'Cliente',
  'Etiqueta',
  'Obligación o Tarea',
  'Año Vencimineto',
  'Mes Vencimineto',
  'Periodo',
  'Tipo',
  'Año Registro',
  'Mes Registro',
  'Día Registro',
  'Nivel',
  'Seniority',
  'Minutos',
  'Horas',
];

// Siempre usamos estos valores fijos en la tabla dinámica
export const PIVOT_CONFIG = {
  aggregatorName: 'Sum',
  rendererName: 'Table',
};
