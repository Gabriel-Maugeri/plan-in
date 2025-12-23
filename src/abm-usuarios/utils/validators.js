/**
 * Valida que un campo no esté vacío
 */
export function validateRequired(value, fieldName = 'Este campo') {
  if (!value || !value.toString().trim()) {
    return `${fieldName} es requerido.`;
  }
  return null;
}

/**
 * Valida formato de email
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido.';
  }
  return null;
}

/**
 * Valida requisitos de contraseña
 */
export function validatePassword(password) {
  const errors = {
    hasSpecialChar: !/[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasUpperCase: !/[A-Z]/.test(password),
    hasLowerCase: !/[a-z]/.test(password),
    hasNumber: !/\d/.test(password),
    minLength: password.length < 6,
  };

  const isValid = !Object.values(errors).some(hasError => hasError);

  return { isValid, errors };
}

/**
 * Valida que dos contraseñas coincidan
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
}

/**
 * Valida un formulario completo
 */
export function validateForm(formData, rules) {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label);
      if (error) {
        errors[field] = error;
        return;
      }
    }
    
    if (rule.email && value) {
      const error = validateEmail(value);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return errors;
}
