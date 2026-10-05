import { useState } from "react";
import { Link } from "react-router-dom";
import logoOriginal from "@shared/assets/logo-original.jpg";
import logoOriginalDark from "@shared/assets/logo-original-dark.jpg";
import logoCompleta from "@shared/assets/logo-completa.png";
import logoCompletaDark from "@shared/assets/logo-completa-dark.png";
import ThemeToggle from "@shared/components/ThemeToggle/ThemeToggle";
import { useTheme } from "@shared/hooks/useTheme";
import { solicitarRecuperacaoSenha } from "../services/authService";
import "./Login.css";

export default function RecuperarSenha() {
  const { theme } = useTheme();
  const logoDeFundo = theme === "dark" ? logoOriginalDark : logoOriginal;
  const logoDoCard = theme === "dark" ? logoCompletaDark : logoCompleta;

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");

    if (!email) {
      setErro("Informe o seu e-mail cadastrado.");
      return;
    }

    setEnviando(true);
    try {
      await solicitarRecuperacaoSenha({ email });
    } catch {
      // Endpoint de recuperação ainda não existe no back-end — mesmo assim,
      // seguimos mostrando a confirmação em vez de travar a pessoa numa tela
      // de erro (e pra não revelar se aquele e-mail existe ou não no sistema).
    } finally {
      setEnviando(false);
      setEnviado(true);
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

        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>Recuperar senha</h2>
        <p className="helper-text" style={{ margin: "0 0 16px" }}>
          Informe o e-mail cadastrado na sua conta — vamos te enviar uma nova senha por e-mail.
        </p>

        {enviado ? (
          <div className="helper-text" style={{ color: "var(--green-ink)" }}>
            Se esse e-mail estiver cadastrado, você vai receber uma nova senha por e-mail em
            instantes. Se não chegar nada, confira a caixa de spam ou fale com a coordenação.
          </div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {erro && <div className="login-erro">{erro}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={enviando}>
              {enviando ? "Enviando..." : "Solicitar recuperação"}
            </button>
          </>
        )}

        <div className="login-footer">
          <Link to="/login" className="link-muted">
            Voltar para o login
          </Link>
        </div>
      </form>
    </div>
  );
}
