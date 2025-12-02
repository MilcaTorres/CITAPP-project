import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  ShieldCheck,
  SquarePen,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Usuario } from "../../types";
import { AddAdministratorForm } from "./AddAdministratorForm";
import { ConfirmStatusChangeModal } from "./ConfirmStatusChangeModal";
import { EditAdministratorForm } from "./EditAdministratorForm";

export function AdministratorsView() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [confirmingStatusChange, setConfirmingStatusChange] =
    useState<Usuario | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'empleado'>('admin');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadUsuarios();
  }, []);

  useEffect(() => {
    const filtered = usuarios.filter(
      (u) =>
        u.rol === selectedRole &&
        (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.codigo && u.codigo.includes(searchTerm)))
    );
    setFilteredUsuarios(filtered);
    setCurrentPage(1); // Reset a la primera página cuando se filtra
  }, [searchTerm, usuarios, selectedRole]);

  const loadUsuarios = async () => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("nombre");

    if (error) {
      console.error("Error loading usuarios:", error);
      return;
    }

    setUsuarios(data || []);
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ activo: !usuario.activo })
      .eq("id", usuario.id);

    if (error) {
      console.error("Error toggling usuario:", error);
      alert("Error al cambiar el estado del usuario");
      return;
    }

    setConfirmingStatusChange(null);
    loadUsuarios();
  };

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsuarios = filteredUsuarios.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Título */}
      <h1 className="text-3xl font-bold text-white">GESTIÓN DE USUARIOS</h1>

      {/* Tabs de Roles */}
      <div className="flex space-x-4 border-b border-gray-700 pb-1">
        <button
          onClick={() => setSelectedRole('admin')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${selectedRole === 'admin'
              ? 'bg-white text-primary font-bold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Administradores</span>
        </button>
        <button
          onClick={() => setSelectedRole('empleado')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${selectedRole === 'empleado'
              ? 'bg-white text-primary font-bold'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
        >
          <Users className="w-5 h-5" />
          <span>Empleados</span>
        </button>
      </div>

      {/* Buscador y Botón de Registrar en la misma fila */}
      <div className="flex items-center justify-between gap-8">
        {/* Buscador - Lado izquierdo, ocupa menos espacio */}
        <div className="relative w-80">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={selectedRole === 'empleado' ? "Buscar por nombre, email o código..." : "Buscar..."}
            className="w-full pl-4 pr-10 py-3 border border-white rounded-lg bg-secondary text-white placeholder-gray-400 placeholder:text-left focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Botón Registrar - Lado derecho */}
        <button
          onClick={() => {
            setEditingUsuario(null);
            setShowForm(true);
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>
            {selectedRole === 'admin' ? 'Registrar administrador' : 'Registrar empleado'}
          </span>
        </button>
      </div>

      {/* Tabla con colores alternos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-1/4">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider w-1/4">
                Correo
              </th>
              {selectedRole === 'empleado' && (
                <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider w-1/6">
                  Código
                </th>
              )}
              <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider w-1/6">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-black uppercase tracking-wider w-1/6">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsuarios.map((usuario, index) => (
              <tr
                key={usuario.id}
                className={
                  index % 2 === 0
                    ? "bg-tableAdmin text-white"
                    : "bg-secondaryTableAdmin text-black"
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium ">
                    {usuario.nombre} {usuario.apellidos}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm ">{usuario.email}</div>
                </td>
                {selectedRole === 'empleado' && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-mono font-bold bg-white/20 rounded px-2 py-1 inline-block">
                      {usuario.codigo || 'N/A'}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    {usuario.activo ? "Activo" : "Desactivado"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {/* Botón Editar - Color dinámico según fila */}
                  <button
                    onClick={() => {
                      setEditingUsuario(usuario);
                      setShowForm(true);
                    }}
                    className={`mr-4 transition-colors ${index % 2 === 0
                        ? "text-white hover:text-gray-300"
                        : "text-black hover:text-gray-600"
                      }`}
                    title="Editar"
                  >
                    <SquarePen className="w-5 h-5" />
                  </button>
                  {/* Botón Activar/Desactivar - Icono simple */}
                  <button
                    onClick={() => setConfirmingStatusChange(usuario)}
                    className={`p-2 rounded-lg transition-all ${usuario.activo
                        ? "hover:bg-red-100 text-red-600 hover:text-red-700"
                        : "hover:bg-green-100 text-green-600 hover:text-green-700"
                      }`}
                    title={usuario.activo ? "Desactivar" : "Activar"}
                  >
                    {usuario.activo ? (
                      <UserMinus className="w-5 h-5" />
                    ) : (
                      <UserCheck className="w-5 h-5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No se encontraron {selectedRole === 'admin' ? 'administradores' : 'empleados'}
            </p>
          </div>
        )}
      </div>

      {/* Controles de Paginación - Separados de la tabla */}
      {filteredUsuarios.length > 0 && (
        <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
          {/* Items por página */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">
              de {filteredUsuarios.length} {selectedRole === 'admin' ? 'administradores' : 'empleados'}
            </span>
          </div>

          {/* Navegación de páginas */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <span className="text-sm text-gray-700 px-4">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {showForm && !editingUsuario && (
        <AddAdministratorForm
          onClose={() => {
            setShowForm(false);
          }}
          onSave={() => {
            setShowForm(false);
            loadUsuarios();
          }}
          initialRole={selectedRole}
        />
      )}

      {showForm && editingUsuario && (
        <EditAdministratorForm
          usuario={editingUsuario}
          onClose={() => {
            setShowForm(false);
            setEditingUsuario(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingUsuario(null);
            loadUsuarios();
          }}
        />
      )}

      {confirmingStatusChange && (
        <ConfirmStatusChangeModal
          usuario={confirmingStatusChange}
          onConfirm={() => handleToggleActivo(confirmingStatusChange)}
          onCancel={() => setConfirmingStatusChange(null)}
        />
      )}
    </div>
  );
}
