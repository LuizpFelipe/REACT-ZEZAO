import { createContext, useEffect, useState } from "react";
import { login as loginService } from "../services/authService";

export const AuthContext = createContext(null);

const CHAVE_STORAGE = "zezao:usuario";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  // Ao abrir o app, tenta recuperar a sessão salva (localStorage) para não
  // pedir login de novo a cada F5.
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    if (salvo) {
      try {
        setUsuario(JSON.parse(salvo));
      } catch {
        localStorage.removeItem(CHAVE_STORAGE);
      }
    }
    setCarregandoSessao(false);
  }, []);

  async function login(nomeUsuario, senha, manterConectado) {
    const usuarioLogado = await loginService(nomeUsuario, senha);
    setUsuario(usuarioLogado);
    if (manterConectado) {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarioLogado));
    }
    return usuarioLogado;
  }

  function logout() {
    setUsuario(null);
    localStorage.removeItem(CHAVE_STORAGE);
  }

  const value = {
    usuario,
    isAuthenticated: !!usuario,
    carregandoSessao,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
