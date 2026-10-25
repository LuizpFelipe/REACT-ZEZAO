import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";

export default function Professor() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleSair() {
    logout();
    navigate("/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase" }}>Área do Professor</h1>
      <p style={{ color: "var(--ink-dim)" }}>
        Logado como <strong>{usuario?.nomeUsuario}</strong> ({usuario?.perfil})
      </p>
      <p style={{ color: "var(--ink-faint)", fontSize: 13, maxWidth: 340, textAlign: "center" }}>
        Esta área ainda não foi desenvolvida — é a próxima etapa do projeto, de responsabilidade de outra parte da
        equipe. Este login já confirma corretamente que você entrou como Professor.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Link to="/campeonato" className="btn btn-outline" style={{ textDecoration: "none" }}>
          Ver Campeonato
        </Link>
        <button className="btn btn-outline" onClick={handleSair}>
          Sair
        </button>
      </div>
    </div>
  );
}
