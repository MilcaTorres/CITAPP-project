import { User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { AuthService } from "../services/auth.service";
import { Usuario } from "../types";
import { handleError } from "../utils/error-handler";

interface AuthContextType {
  user: User | null;
  usuario: Usuario | false | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // undefined/null = cargando (estado inicial)
  // false = no existe en la BD
  // Usuario = perfil cargado
  const [usuario, setUsuario] = useState<Usuario | false | null>(null);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  /*
  ======================================================
  Sincronizar sesión y escuchar cambios
  ======================================================
  */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user: currentUser, usuario: userData } = await AuthService.getCurrentUser();
        setUser(currentUser);
        setUsuario(userData);
        lastUserId.current = currentUser?.id ?? null;
      } catch (err) {
        // Solo loguear errores inesperados, getCurrentUser ya maneja no-sesión
        console.error("Error inesperado al inicializar auth:", err);
        setUser(null);
        setUsuario(null);
        lastUserId.current = null;
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Si el usuario cambió (o es el inicio), cargar datos
      if (currentUser && currentUser.id !== lastUserId.current) {
        setLoading(true);
        lastUserId.current = currentUser.id;
        await loadUsuario(currentUser.id);
      }
      // Si no hay usuario, limpiar todo
      else if (!currentUser) {
        setUsuario(null);
        setLoading(false);
        lastUserId.current = null;
      }
      // Si es el mismo usuario, no hacemos nada (evita loading al cambiar de pestaña)
    });

    return () => subscription.unsubscribe();
  }, []);

  /*
  ======================================================
 Cargar registro de usuario en tabla "usuarios"
 Con retry para usuarios OAuth (puede haber delay en trigger)
  ======================================================
  */
  const loadUsuario = async (userId: string, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      // If user not found and we haven't exceeded retries, try again
      if (!data && retryCount < MAX_RETRIES) {
        console.log(
          `Usuario no encontrado, reintentando... (${retryCount + 1
          }/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return loadUsuario(userId, retryCount + 1);
      }

      // 🔥 Resultado final:
      // false = no existe
      // Usuario = existe
      if (!data) {
        setUsuario(false);
      } else {
        setUsuario(data);
      }

      if (!data) {
        console.warn(
          "Usuario autenticado pero no encontrado en tabla usuarios después de reintentos"
        );
      }
    } catch (err: any) {
      console.error("Error al cargar usuario:", err.message || err);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  /*
  ======================================================
   Iniciar sesión
  ======================================================
  */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.signIn(email, password);
    } catch (err) {
      const appError = handleError(err);
      console.error("Error al iniciar sesión:", appError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /*
  ======================================================
   Iniciar sesión con Google (OAuth)
  ======================================================
  */
  const signInWithGoogle = async () => {
    try {
      await AuthService.signInWithGoogle();
    } catch (err) {
      const appError = handleError(err);
      console.error("Error al iniciar sesión con Google:", appError);
      throw err;
    }
  };

  /*
  ======================================================
   Cerrar sesión
  ======================================================
  */
  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (err) {
      const appError = handleError(err);
      console.error("Error al cerrar sesión:", appError);
    } finally {
      setUsuario(null);
      setUser(null);
    }
  };

  /*
  ======================================================
  Rol Admin
  ======================================================
  */
  const isAdmin = !!(usuario && usuario.rol === "admin" && usuario.activo);

  return (
    <AuthContext.Provider
      value={{
        user,
        usuario,
        loading,
        signIn,
        signInWithGoogle,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
