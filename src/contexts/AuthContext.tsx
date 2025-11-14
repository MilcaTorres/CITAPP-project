import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Usuario } from "../types";

interface AuthContextType {
  user: User | null;
  usuario: Usuario | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

 
 useEffect(() => {
  if (sessionStorage.getItem("sessionResetDone")) return;

  supabase.auth.signOut();
  localStorage.clear();

  // Marca que ya se ejecutó una vez
  sessionStorage.setItem("sessionResetDone", "true");
}, []);


  /*
  ======================================================
 Sincronizar sesión y escuchar cambios
  ======================================================
  */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await loadUsuario(currentUser.id);
        }
      } catch (err) {
        console.error("Error al obtener la sesión:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        setLoading(true);
        loadUsuario(currentUser.id);
      } else {
        setUsuario(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /*
  ======================================================
 Cargar registro de usuario en tabla "usuarios"
  ======================================================
  */
  const loadUsuario = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setUsuario(data ?? null);
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /*
  ======================================================
   Cerrar sesión
  ======================================================
  */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
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
  const isAdmin = !!(usuario?.rol === "admin" && usuario?.activo);

  return (
    <AuthContext.Provider
      value={{
        user,
        usuario,
        loading,
        signIn,
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
