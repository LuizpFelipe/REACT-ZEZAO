import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Campeonato() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleSair() {
    logout();
    navigate("/login");
  }

  const rotaVoltar = usuario?.perfil === "Coordenador" ? "/coordenacao" : "/professor";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--font-display)", textTransform: "uppercase" }}>Campeonato</h1>
      <p style={{ color: "var(--ink-dim)" }}>
        Logado como <strong>{usuario?.nomeUsuario}</strong> ({usuario?.perfil})
      </p>
      <p style={{ color: "var(--ink-faint)", fontSize: 13, maxWidth: 340, textAlign: "center" }}>
        Área acessível por Coordenador e Professor — ainda não desenvolvida, é uma etapa desejável do projeto.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Link to={rotaVoltar} className="btn btn-outline" style={{ textDecoration: "none" }}>
          Voltar
        </Link>
        <button className="btn btn-outline" onClick={handleSair}>
          Sair
        </button>
      </div>
    </div>
  );
}
