import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logoBrasao from "@shared/assets/logo-brasao.png";
import logoBrasaoDark from "@shared/assets/logo-brasao-dark.png";
import ThemeToggle from "@shared/components/ThemeToggle/ThemeToggle";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useTheme } from "@shared/hooks/useTheme";
import "./CoordenadorLayout.css";

const SUBNAV_ITEMS = [
  { to: "novo-aluno", label: "Novo Aluno" },
  { to: "alunos", label: "Alunos" },
  { to: "contratos", label: "Contratos" },
  { to: "financeiro", label: "Financeiro" },
  { to: "categorias", label: "Categorias" },
  { to: "professores", label: "Professores" },
  { to: "turmas", label: "Turmas" },
];

export default function CoordenadorLayout() {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const brasao = theme === "dark" ? logoBrasaoDark : logoBrasao;

  function handleSair() {
    logout();
    navigate("/login");
  }

  return (
    <div className="coord-screen">
      <header className="coord-header">
        <div className="coord-brand">
          <div className="crest">
            <img src={brasao} alt="" className="crest-img" />
          </div>
          <div className="coord-brand-text">
            <div className="coord-brand-name">Zezão</div>
            <div className="coord-brand-sub">Futsal</div>
          </div>
        </div>

        <div className="coord-top-tabs">
          <button className="top-tab top-tab--active" disabled>
            Coordenação
          </button>
          <Link to="/professor" className="top-tab">
            Professor
          </Link>
          <Link to="/campeonato" className="top-tab">
            Campeonato
          </Link>
        </div>

        <div className="coord-header-actions">
          <ThemeToggle />
          <button className="coord-sair" onClick={handleSair}>
            Sair
          </button>
        </div>
      </header>

      <div className="coord-body">
        <div className="coord-title-block">
          <div className="coord-eyebrow">Painel administrativo</div>
          <h1 className="coord-title">Coordenação</h1>
          <nav className="coord-subnav">
            {SUBNAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => "coord-subnav-item" + (isActive ? " coord-subnav-item--active" : "")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="coord-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
