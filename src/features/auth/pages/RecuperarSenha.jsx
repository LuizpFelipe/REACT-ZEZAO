import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoOriginal from "@shared/assets/logo-original.jpg";
import logoOriginalDark from "@shared/assets/logo-original-dark.jpg";
import logoCompleta from "@shared/assets/logo-completa.png";
import logoCompletaDark from "@shared/assets/logo-completa-dark.png";
import ThemeToggle from "@shared/components/ThemeToggle/ThemeToggle";
import { useTheme } from "@shared/hooks/useTheme";
import {
  solicitarRecuperacaoSenha,
  validarCodigoRecuperacao,
  redefinirSenha,
} from "../services/authService";
import "./Login.css";

const SEGUNDOS_PARA_REENVIAR = 60;
const TAMANHO_DO_CODIGO = 6;
const TAMANHO_MINIMO_DA_SENHA = 6;

const TITULOS = {
  email: "Recuperar senha",
  codigo: "Digite o código",
  senha: "Nova senha",
  concluido: "Senha alterada",
};

const estiloBotaoComoLink = {
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
  font: "inherit",
};

const estiloAreaDoReenvio = {
  textAlign: "center",
  margin: "0 0 14px",
};

const estiloTempoRestante = {
  fontVariantNumeric: "tabular-nums",
  color: "var(--text, inherit)",
};

const estiloCampoDoCodigo = {
  textAlign: "center",
  fontSize: 24,
  letterSpacing: "0.35em",
};

function formatarTempo(totalDeSegundos) {
  const minutos = Math.floor(totalDeSegundos / 60);
  const segundos = String(totalDeSegundos % 60).padStart(2, "0");
  return `${minutos}:${segundos}`;
}

function formatarCodigo(codigo) {
  return codigo.length > 3 ? `${codigo.slice(0, 3)} ${codigo.slice(3)}` : codigo;
}

export default function RecuperarSenha() {
  const { theme } = useTheme();
  const logoDeFundo = theme === "dark" ? logoOriginalDark : logoOriginal;
  const logoDoCard = theme === "dark" ? logoCompletaDark : logoCompleta;

  const [etapa, setEtapa] = useState("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tokenRedefinicao, setTokenRedefinicao] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    if (segundosRestantes <= 0) return undefined;
    const temporizador = setTimeout(() => {
      setSegundosRestantes((segundos) => segundos - 1);
    }, 1000);
    return () => clearTimeout(temporizador);
  }, [segundosRestantes]);

  async function enviarCodigo() {
    await solicitarRecuperacaoSenha({ email });
    setSegundosRestantes(SEGUNDOS_PARA_REENVIAR);
  }

  async function aoEnviarEmail() {
    if (!email) {
      setErro("Informe o seu e-mail cadastrado.");
      return;
    }
    await enviarCodigo();
    setEtapa("codigo");
  }

  async function aoConfirmarCodigo() {
    if (codigo.length !== TAMANHO_DO_CODIGO) {
      setErro(`O código tem ${TAMANHO_DO_CODIGO} dígitos.`);
      return;
    }
    const token = await validarCodigoRecuperacao({ email, codigo });
    setTokenRedefinicao(token);
    setEtapa("senha");
  }

  async function aoTrocarSenha() {
    if (novaSenha.length < TAMANHO_MINIMO_DA_SENHA) {
      setErro(`A nova senha precisa ter pelo menos ${TAMANHO_MINIMO_DA_SENHA} caracteres.`);
      return;
    }
    if (novaSenha !== confirmacaoSenha) {
      setErro("As senhas não são iguais.");
      return;
    }
    await redefinirSenha({ token: tokenRedefinicao, novaSenha });
    setEtapa("concluido");
  }

  async function aoEnviarFormulario(evento) {
    evento.preventDefault();
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      if (etapa === "email") await aoEnviarEmail();
      else if (etapa === "codigo") await aoConfirmarCodigo();
      else if (etapa === "senha") await aoTrocarSenha();
    } catch (erroCapturado) {
      setErro(erroCapturado.message || "Algo deu errado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function aoReenviarCodigo() {
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      await enviarCodigo();
      setCodigo("");
      setAviso("Enviamos um novo código. O anterior deixou de valer.");
    } catch (erroCapturado) {
      setErro(erroCapturado.message || "Não foi possível reenviar o código.");
    } finally {
      setCarregando(false);
    }
  }

  function voltarParaEmail() {
    setErro("");
    setAviso("");
    setCodigo("");
    setEtapa("email");
  }

  return (
    <div className="login-wrap">
      <img src={logoDeFundo} alt="" aria-hidden="true" className="login-bg-logo" />

      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <form className="login-card" onSubmit={aoEnviarFormulario}>
        <div className="login-brand">
          <img src={logoDoCard} alt="Futsal Zezão" className="login-logo" />
        </div>

        <div className="login-divider" />

        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{TITULOS[etapa]}</h2>

        {etapa === "email" && (
          <>
            <p className="helper-text" style={{ margin: "0 0 16px" }}>
              Informe o e-mail cadastrado na sua conta. Vamos enviar um código de{" "}
              {TAMANHO_DO_CODIGO} dígitos.
            </p>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                autoComplete="email"
              />
            </div>
          </>
        )}

        {etapa === "codigo" && (
          <>
            <p className="helper-text" style={{ margin: "0 0 16px" }}>
              Se o e-mail estiver cadastrado, enviamos um código para o endereço informado.
            </p>
            <div className="field">
              <label htmlFor="codigo">Código</label>
              <input
                id="codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000 000"
                style={estiloCampoDoCodigo}
                value={formatarCodigo(codigo)}
                onChange={(evento) =>
                  setCodigo(evento.target.value.replace(/\D/g, "").slice(0, TAMANHO_DO_CODIGO))
                }
              />
            </div>
            <div style={estiloAreaDoReenvio}>
              {segundosRestantes > 0 ? (
                <p className="helper-text" style={{ margin: 0 }}>
                  Não recebeu? Novo código em{" "}
                  <strong style={estiloTempoRestante}>{formatarTempo(segundosRestantes)}</strong>
                </p>
              ) : (
                <>
                  <p className="helper-text" style={{ margin: "0 0 8px" }}>
                    Não recebeu o código?
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={carregando}
                    onClick={aoReenviarCodigo}
                  >
                    Reenviar código
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {etapa === "senha" && (
          <>
            <p className="helper-text" style={{ margin: "0 0 16px" }}>
              Escolha uma senha com pelo menos {TAMANHO_MINIMO_DA_SENHA} caracteres, diferente da
              atual.
            </p>
            <div className="field">
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(evento) => setNovaSenha(evento.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label htmlFor="confirmacaoSenha">Confirmar senha</label>
              <input
                id="confirmacaoSenha"
                type="password"
                value={confirmacaoSenha}
                onChange={(evento) => setConfirmacaoSenha(evento.target.value)}
                autoComplete="new-password"
              />
            </div>
          </>
        )}

        {etapa === "concluido" && (
          <div className="helper-text" style={{ color: "var(--green-ink)", margin: "0 0 16px" }}>
            Sua senha foi alterada com sucesso. Agora você já pode entrar com a nova senha.
          </div>
        )}

        {aviso && (
          <div className="helper-text" style={{ color: "var(--green-ink)", marginBottom: 12 }}>
            {aviso}
          </div>
        )}
        {erro && <div className="login-erro">{erro}</div>}

        {etapa === "email" && (
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={carregando}>
            {carregando ? "Enviando..." : "Enviar código"}
          </button>
        )}

        {etapa === "codigo" && (
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={carregando}>
            {carregando ? "Verificando..." : "Confirmar código"}
          </button>
        )}

        {etapa === "senha" && (
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={carregando}>
            {carregando ? "Salvando..." : "Salvar nova senha"}
          </button>
        )}

        {etapa === "concluido" && (
          <Link to="/login" className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
            Ir para o login
          </Link>
        )}

        {etapa !== "concluido" && (
          <div className="login-footer">
            {etapa === "email" && (
              <Link to="/login" className="link-muted">
                Voltar para o login
              </Link>
            )}
            {etapa === "codigo" && (
              <button type="button" className="link-muted" style={estiloBotaoComoLink} onClick={voltarParaEmail}>
                Voltar
              </button>
            )}
            {etapa === "senha" && (
              <Link to="/login" className="link-muted">
                Cancelar
              </Link>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
