import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Usuario } from "../../types";
import { supabase } from "../../lib/supabase";
import {
  validateName,
  validateLastName,
  ValidationError,
} from "../../utils/formValidation";

interface EditAdministratorFormProps {
  usuario: Usuario;
  onClose: () => void;
  onSave: () => void;
}

interface FormErrors {
  nombre?: string;
  apellidos?: string;
}

export function EditAdministratorForm({
  usuario,
  onClose,
  onSave,
}: EditAdministratorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
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
    });

    // Validar campos
    const nombreError = validateName(formData.nombre);
    const apellidosError = validateLastName(formData.apellidos);

    if (nombreError || apellidosError) {
      const newErrors: FormErrors = {};
      if (nombreError) newErrors.nombre = nombreError.message;
      if (apellidosError) newErrors.apellidos = apellidosError.message;
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
      };

      const { error } = await supabase
        .from("usuarios")
        .update(updateData)
        .eq("id", usuario.id);

      if (error) throw error;

      onSave();
    } catch (error: any) {
      console.error("Error updating administrator:", error);
      alert(error.message || "Error al actualizar el administrador");
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
      <div className="bg-primary rounded-lg shadow-xl max-w-md w-full">
        <div className="px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            Editar Administrador
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
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
