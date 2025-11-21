import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  validateAdministratorForm,
  validateName,
  validateLastName,
  validateEmail,
  validateEmailMatch,
  ValidationError,
} from "../../utils/formValidation";

interface AddAdministratorFormProps {
  onClose: () => void;
  onSave: () => void;
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
}: AddAdministratorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    confirmEmail: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

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
        const { error: userError } = await supabase.from("usuarios").insert([
          {
            id: authData.user.id,
            rol: "admin",
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: cleanEmail,
            activo: true,
          },
        ]);

        if (userError) throw userError;
      }

      onSave();
    } catch (error: any) {
      console.error("Error saving administrator:", error);
      alert(error.message || "Error al guardar el administrador");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Agregar Administrador
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
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
                  setFormData({ ...formData, nombre: e.target.value });
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
                  setFormData({ ...formData, apellidos: e.target.value });
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
  );
}
