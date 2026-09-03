import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoBall from "../../assets/Logo";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [manterConectado, setManterConectado] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!nomeUsuario || !senha) {
      setErro("Preencha usuário e senha.");
      return;
    }

    setCarregando(true);
    try {
      const usuario = await login(nomeUsuario, senha, manterConectado);
      navigate(usuario.perfil === "Professor" ? "/professor" : "/coordenacao");
    } catch (err) {
      setErro(err.message || "Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <div className="crest">
            <LogoBall size={26} ringColor="#3A2A2C" fillColor="#111114" accentColor="#D6543A" variant="play" />
          </div>
          <div className="brand-text">
            <div className="name">
              Zezão
              <span className="city">Futsal</span>
            </div>
          </div>
        </div>

        <div className="login-divider" />

        <div className="field">
          <label htmlFor="usuario">Usuário</label>
          <input
            id="usuario"
            placeholder="nome.sobrenome"
            value={nomeUsuario}
            onChange={(e) => setNomeUsuario(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {erro && <div className="login-erro">{erro}</div>}

        <div className="row-between">
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={manterConectado}
              onChange={(e) => setManterConectado(e.target.checked)}
            />
            Manter conectado
          </label>
          <a className="link-muted" href="#">
            Esqueci a senha
          </a>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <div className="login-footer">Acesso restrito à equipe administrativa</div>
      </form>
    </div>
  );
}
