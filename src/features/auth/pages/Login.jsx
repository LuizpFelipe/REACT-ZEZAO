import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoOriginal from "@shared/assets/logo-original.jpg";
import logoOriginalDark from "@shared/assets/logo-original-dark.jpg";
import logoCompleta from "@shared/assets/logo-completa.png";
import logoCompletaDark from "@shared/assets/logo-completa-dark.png";
import ThemeToggle from "@shared/components/ThemeToggle/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "@shared/hooks/useTheme";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Fundo grande desfocado atrás do card: usa a foto com fundo sólido
  // (branco ou preto, conforme o tema) — sem precisar de transparência,
  // já que o fundo dela já bate com o fundo da página.
  const logoDeFundo = theme === "dark" ? logoOriginalDark : logoOriginal;

  // Logo pequena dentro do card: aqui precisa da versão com transparência
  // de verdade, porque o fundo do card (#EDEDED / #17171A) não é
  // exatamente branco nem preto puro — uma imagem com fundo sólido
  // apareceria com uma "caixa" visível ao redor.
  const logoDoCard = theme === "dark" ? logoCompletaDark : logoCompleta;

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
      <img src={logoDeFundo} alt="" aria-hidden="true" className="login-bg-logo" />

      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src={logoDoCard} alt="Futsal Zezão" className="login-logo" />
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
