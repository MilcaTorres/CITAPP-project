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
    let isInitialLoad = true;

    const initAuth = async () => {
      try {
        console.log("🔍 [AuthContext] Iniciando autenticación...");
        const { user: currentUser, usuario: userData } = await AuthService.getCurrentUser();
        console.log("🔍 [AuthContext] Usuario obtenido:", { user: !!currentUser, usuario: userData });
        setUser(currentUser);
        setUsuario(userData);
        lastUserId.current = currentUser?.id ?? null;
      } catch (err) {
        // Solo loguear errores inesperados, getCurrentUser ya maneja no-sesión
        console.error("❌ [AuthContext] Error inesperado al inicializar auth:", err);
        setUser(null);
        setUsuario(null);
        lastUserId.current = null;
      } finally {
        console.log("✅ [AuthContext] Carga inicial completada, loading = false");
        setLoading(false);
        // Marcar que la carga inicial terminó después de un pequeño delay
        setTimeout(() => {
          isInitialLoad = false;
        }, 100);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("🔄 [AuthContext] Auth state changed:", _event, "isInitialLoad:", isInitialLoad);

      // Ignorar el primer evento SIGNED_IN que ocurre inmediatamente después de initAuth
      if (isInitialLoad && _event === 'SIGNED_IN') {
        console.log("🔄 [AuthContext] Ignorando SIGNED_IN inicial para evitar doble carga");
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // Si el usuario cambió (o es el inicio), cargar datos
      if (currentUser && currentUser.id !== lastUserId.current) {
        console.log("🔄 [AuthContext] Nuevo usuario detectado, cargando datos...");
        setLoading(true);
        lastUserId.current = currentUser.id;
        await loadUsuario(currentUser.id);
      }
      // Si no hay usuario, limpiar todo
      else if (!currentUser) {
        console.log("🔄 [AuthContext] No hay usuario, limpiando...");
        setUsuario(null);
        setLoading(false);
        lastUserId.current = null;
      } else {
        console.log("🔄 [AuthContext] Mismo usuario, no se hace nada");
      }
      // Si es el mismo usuario, no hacemos nada (evita loading al cambiar de pestaña)
    });

    return () => subscription.unsubscribe();
  }, []);

  /*
  ======================================================
  Auto-logout por inactividad (2 minutos)
  ======================================================
  */
  useEffect(() => {
    if (!user) return;

    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Sesión cerrada por inactividad");
        signOut();
      }, TIMEOUT_MS);
    };

    // Eventos a escuchar
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    // Configurar listeners
    const setupListeners = () => {
      events.forEach(event => {
        document.addEventListener(event, resetTimer);
      });
      resetTimer(); // Iniciar timer
    };

    // Limpiar listeners
    const cleanupListeners = () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutId) clearTimeout(timeoutId);
    };

    setupListeners();

    return cleanupListeners;
  }, [user]);

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
      console.log(`🔍 [loadUsuario] Cargando usuario ${userId}, intento ${retryCount + 1}/${MAX_RETRIES + 1}`);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      // If user not found and we haven't exceeded retries, try again
      if (!data && retryCount < MAX_RETRIES) {
        console.log(
          `⚠️ [loadUsuario] Usuario no encontrado, reintentando... (${retryCount + 1
          }/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return loadUsuario(userId, retryCount + 1);
      }

      // 🔥 Resultado final:
      // false = no existe
      // Usuario = existe
      if (!data) {
        console.warn("❌ [loadUsuario] Usuario no encontrado después de reintentos, estableciendo false");
        setUsuario(false);
      } else {
        console.log("✅ [loadUsuario] Usuario cargado exitosamente:", data.email);
        setUsuario(data);
      }

      if (!data) {
        console.warn(
          "Usuario autenticado pero no encontrado en tabla usuarios después de reintentos"
        );
      }
    } catch (err: any) {
      console.error("❌ [loadUsuario] Error al cargar usuario:", err.message || err);
      setUsuario(null);
    } finally {
      console.log("✅ [loadUsuario] Finalizando carga, loading = false");
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
      lastUserId.current = null;
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
