import { AlertCircle, RefreshCw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  validateAdministratorForm,
  validateEmail,
  validateEmailMatch,
  validateLastName,
  validateName,
  ValidationError,
} from "../../utils/formValidation";
import AlertMessage from "../AlertMessage";

interface AddAdministratorFormProps {
  onClose: () => void;
  onSave: () => void;
  initialRole?: 'admin' | 'empleado';
}

interface FormErrors {
  nombre?: string;
  apellidos?: string;
  email?: string;
  confirmEmail?: string;
}

export function AddAdministratorForm({
  onClose,
  onSave,
  initialRole = 'admin',
}: AddAdministratorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    confirmEmail: "",
    rol: initialRole,
    codigo: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [alertData, setAlertData] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (alertData) {
      const timer = setTimeout(() => setAlertData(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertData]);

  useEffect(() => {
    if (formData.rol === 'empleado' && !formData.codigo) {
      generateEmployeeCode();
    }
  }, [formData.rol]);

  const generateEmployeeCode = () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    setFormData(prev => ({ ...prev, codigo: code }));
  };

  // Validación en tiempo real cuando el usuario sale del campo
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  // Validar un campo específico
  const validateField = (field: string) => {
    let error: ValidationError | null = null;

    switch (field) {
      case "nombre":
        error = validateName(formData.nombre);
        break;
      case "apellidos":
        error = validateLastName(formData.apellidos);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "confirmEmail":
        error = validateEmailMatch(formData.email, formData.confirmEmail);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error ? error.message : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    setTouched({
      nombre: true,
      apellidos: true,
      email: true,
      confirmEmail: true,
    });

    // Validar todo el formulario
    const validation = validateAdministratorForm(formData);

    if (!validation.isValid) {
      const newErrors: FormErrors = {};
      validation.errors.forEach((error) => {
        newErrors[error.field as keyof FormErrors] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Limpiar y preparar el email
      const cleanEmail = formData.email.trim().toLowerCase();

      // Usar el email como contraseña inicial
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanEmail, // Contraseña = email
        options: {
          data: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            rol: formData.rol,
          },
        },
      });

      if (authError) {
        // Mensajes de error más amigables
        if (authError.message.includes("invalid")) {
          throw new Error(
            "El formato del correo electrónico no es válido. Verifica que sea un correo real."
          );
        } else if (authError.message.includes("already registered")) {
          throw new Error("Este correo electrónico ya está registrado.");
        } else {
          throw authError;
        }
      }

      if (authData.user) {
        // Verificar si el código ya existe (solo para empleados)
        if (formData.rol === 'empleado') {
          const { data: existingCode } = await supabase
            .from('usuarios')
            .select('id')
            .eq('codigo', formData.codigo)
            .single();

          if (existingCode) {
            // Si existe, generar uno nuevo y reintentar (simple retry logic)
            const newCode = Math.floor(10000 + Math.random() * 90000).toString();
            formData.codigo = newCode;
          }
        }

        const { error: userError } = await supabase.from("usuarios").upsert([
          {
            id: authData.user.id,
            rol: formData.rol,
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: cleanEmail,
            activo: true,
            codigo: formData.rol === 'empleado' ? formData.codigo : null,
          },
        ]);

        if (userError) throw userError;
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving user:", error);
      setAlertData({
        type: "error",
        message: error.message || "Error al guardar el usuario"
      });
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener las clases del input según el estado de error
  const getInputClasses = (field: keyof FormErrors) => {
    const hasError = touched[field] && errors[field];
    const baseClasses =
      "w-full px-4 py-2 bg-transparent rounded-lg text-white placeholder-gray-400 transition-all";
    const normalClasses =
      "border border-white focus:ring-2 focus:ring-white focus:border-transparent";
    const errorClasses =
      "border-2 border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500";

    return `${baseClasses} ${hasError ? errorClasses : normalClasses}`;
  };

  return (
    <>
      {alertData && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]">
          <AlertMessage type={alertData.type} message={alertData.message} />
        </div>
      )}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-primary rounded-lg shadow-xl max-w-2xl w-full">
          <div className="px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Agregar {formData.rol === 'admin' ? 'Administrador' : 'Empleado'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {/* Selector de Rol */}
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center space-x-2 text-white cursor-pointer">
                <input
                  type="radio"
                  checked={formData.rol === 'admin'}
                  onChange={() => setFormData({ ...formData, rol: 'admin', codigo: '' })}
                  className="form-radio text-red-600"
                />
                <span>Administrador</span>
              </label>
              <label className="flex items-center space-x-2 text-white cursor-pointer">
                <input
                  type="radio"
                  checked={formData.rol === 'empleado'}
                  onChange={() => setFormData({ ...formData, rol: 'empleado' })}
                  className="form-radio text-red-600"
                />
                <span>Empleado</span>
              </label>
            </div>

            {/* Grid de 2 columnas para los campos */}
            <div className="grid grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-normal text-white mb-2">
                  Nombre(s)
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    // Solo permitir letras, espacios y acentos (sin números)
                    const sanitized = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']/g, '');
                    setFormData({ ...formData, nombre: sanitized });
                    if (touched.nombre) validateField("nombre");
                  }}
                  onBlur={() => handleBlur("nombre")}
                  className={getInputClasses("nombre")}
                  placeholder="Nombre(s)"
                />
                {touched.nombre && errors.nombre && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.nombre}</span>
                  </div>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-normal text-white mb-2">
                  Apellido(s)
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => {
                    // Solo permitir letras, espacios y acentos (sin números)
                    const sanitized = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']/g, '');
                    setFormData({ ...formData, apellidos: sanitized });
                    if (touched.apellidos) validateField("apellidos");
                  }}
                  onBlur={() => handleBlur("apellidos")}
                  className={getInputClasses("apellidos")}
                  placeholder="Apellido(s)"
                />
                {touched.apellidos && errors.apellidos && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.apellidos}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-normal text-white mb-2">
                  Correo Electronico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (touched.email) validateField("email");
                    if (touched.confirmEmail) validateField("confirmEmail");
                  }}
                  onBlur={() => handleBlur("email")}
                  className={getInputClasses("email")}
                  placeholder="Correo Electronico"
                />
                {touched.email && errors.email && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Confirmar Email */}
              <div>
                <label className="block text-sm font-normal text-white mb-2">
                  Confirmar Correo
                </label>
                <input
                  type="email"
                  value={formData.confirmEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmEmail: e.target.value });
                    if (touched.confirmEmail) validateField("confirmEmail");
                  }}
                  onBlur={() => handleBlur("confirmEmail")}
                  className={getInputClasses("confirmEmail")}
                  placeholder="Confirmar Correo"
                />
                {touched.confirmEmail && errors.confirmEmail && (
                  <div className="flex items-center mt-1 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span>{errors.confirmEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Código de Empleado (Solo si es empleado) */}
            {formData.rol === 'empleado' && (
              <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                <label className="block text-sm font-bold text-white mb-2">
                  Código de Empleado Generado
                </label>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl font-mono font-bold text-yellow-400 tracking-widest">
                    {formData.codigo}
                  </div>
                  <button
                    type="button"
                    onClick={generateEmployeeCode}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Generar nuevo código"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  Este código será necesario para que el empleado envíe verificaciones.
                </p>
              </div>
            )}

            {/* Nota informativa */}
            <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                <strong>Nota:</strong> La contraseña inicial será el mismo correo
                electrónico. El usuario podrá cambiarla después.
              </p>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2 text-white hover:bg-gray-700 transition-colors rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Aceptar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
