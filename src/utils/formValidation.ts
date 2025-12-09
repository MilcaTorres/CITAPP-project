export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Valida que el nombre solo contenga letras, espacios y acentos
 */
export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: "nombre", message: "El nombre es requerido" };
  }

  // Permite letras (incluyendo acentos), espacios y apóstrofes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/;

  if (!nameRegex.test(name)) {
    return {
      field: "nombre",
      message: "El nombre solo puede contener letras y espacios",
    };
  }

  if (name.trim().length < 2) {
    return {
      field: "nombre",
      message: "El nombre debe tener al menos 2 caracteres",
    };
  }

  return null;
};

/**
 * Valida que los apellidos solo contengan letras, espacios y acentos
 */
export const validateLastName = (lastName: string): ValidationError | null => {
  if (!lastName || lastName.trim().length === 0) {
    return null; // Los apellidos son opcionales
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/;

  if (!nameRegex.test(lastName)) {
    return {
      field: "apellidos",
      message: "Los apellidos solo pueden contener letras y espacios",
    };
  }

  return null;
};

/**
 * Valida el formato del correo electrónico
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: "email", message: "El correo electrónico es requerido" };
  }

  // Regex más estricto compatible con Supabase
  // Requiere: usuario@dominio.extension (mínimo 2 caracteres en extensión)
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return {
      field: "email",
      message: "El formato del correo electrónico no es válido",
    };
  }

  // Validaciones adicionales
  const trimmedEmail = email.trim();

  // No puede empezar o terminar con punto
  if (trimmedEmail.startsWith(".") || trimmedEmail.endsWith(".")) {
    return {
      field: "email",
      message: "El correo no puede empezar o terminar con punto",
    };
  }

  // No puede tener puntos consecutivos
  if (trimmedEmail.includes("..")) {
    return {
      field: "email",
      message: "El correo no puede contener puntos consecutivos",
    };
  }

  return null;
};

/**
 * Valida que dos correos electrónicos coincidan
 */
export const validateEmailMatch = (
  email: string,
  confirmEmail: string
): ValidationError | null => {
  if (!confirmEmail || confirmEmail.trim().length === 0) {
    return {
      field: "confirmEmail",
      message: "Debes confirmar el correo electrónico",
    };
  }

  if (email !== confirmEmail) {
    return {
      field: "confirmEmail",
      message: "Los correos electrónicos no coinciden",
    };
  }

  return null;
};

/**
 * Valida el formulario completo de administrador
 */
export const validateAdministratorForm = (formData: {
  nombre: string;
  apellidos: string;
  email: string;
  confirmEmail: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar nombre
  const nameError = validateName(formData.nombre);
  if (nameError) errors.push(nameError);

  // Validar apellidos
  const lastNameError = validateLastName(formData.apellidos);
  if (lastNameError) errors.push(lastNameError);

  // Validar email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.push(emailError);

  // Validar que los emails coincidan
  const emailMatchError = validateEmailMatch(
    formData.email,
    formData.confirmEmail
  );
  if (emailMatchError) errors.push(emailMatchError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitiza texto para que solo contenga letras, números, espacios y acentos
 */
export const sanitizeAlphanumeric = (text: string): string => {
  // Permite letras (incluyendo acentos), números, espacios
  return text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
};

/**
 * Sanitiza texto para que solo contenga números
 */
export const sanitizeNumeric = (text: string): string => {
  return text.replace(/\D/g, '');
};

/**
 * Sanitiza observaciones permitiendo puntuación básica
 */
export const sanitizeObservations = (text: string): string => {
  // Permite letras, números, espacios, acentos y puntuación básica: . , ; : ! ? -
  return text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:!?\-]/g, '');
};

/**
 * Valida que el nombre del producto solo contenga caracteres permitidos
 */
export const validateProductName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: "nombre", message: "El nombre del producto es requerido" };
  }

  // Permite letras, números, espacios y acentos
  const productNameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  if (!productNameRegex.test(name)) {
    return {
      field: "nombre",
      message: "El nombre solo puede contener letras, números y espacios",
    };
  }

  if (name.trim().length < 2) {
    return {
      field: "nombre",
      message: "El nombre debe tener al menos 2 caracteres",
    };
  }

  return null;
};

/**
 * Valida que la marca solo contenga caracteres permitidos
 */
export const validateBrand = (brand: string): ValidationError | null => {
  if (!brand || brand.trim().length === 0) {
    return null; // La marca es opcional
  }

  const brandRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  if (!brandRegex.test(brand)) {
    return {
      field: "marca",
      message: "La marca solo puede contener letras, números y espacios",
    };
  }

  return null;
};

/**
 * Valida que el tipo solo contenga caracteres permitidos
 */
export const validateProductType = (type: string): ValidationError | null => {
  if (!type || type.trim().length === 0) {
    return null; // El tipo es opcional
  }

  const typeRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  if (!typeRegex.test(type)) {
    return {
      field: "tipo",
      message: "El tipo solo puede contener letras, números y espacios",
    };
  }

  return null;
};

/**
 * Valida que las observaciones solo contengan caracteres permitidos
 */
export const validateObservations = (observations: string): ValidationError | null => {
  if (!observations || observations.trim().length === 0) {
    return null; // Las observaciones son opcionales
  }

  // Permite letras, números, espacios, acentos y puntuación básica
  const observationsRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:!?\-]+$/;

  if (!observationsRegex.test(observations)) {
    return {
      field: "observaciones",
      message: "Las observaciones contienen caracteres no permitidos",
    };
  }

  return null;
};
