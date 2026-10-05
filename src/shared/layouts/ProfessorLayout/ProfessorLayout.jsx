import { Link, Outlet, useNavigate } from "react-router-dom";
import logoBrasao from "@shared/assets/logo-brasao.png";
import logoBrasaoDark from "@shared/assets/logo-brasao-dark.png";
import ThemeToggle from "@shared/components/ThemeToggle/ThemeToggle";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useTheme } from "@shared/hooks/useTheme";
// Reaproveita o mesmo CSS do layout da Coordenação — as classes (coord-*)
// já são genéricas o suficiente pra servir de topbar padrão do sistema.
import "@shared/layouts/CoordenadorLayout/CoordenadorLayout.css";

export default function ProfessorLayout() {
  const { usuario, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const brasao = theme === "dark" ? logoBrasaoDark : logoBrasao;
  const podeVerCoordenacao = usuario?.perfil === "Coordenador";

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
          {podeVerCoordenacao ? (
            <Link to="/coordenacao" className="top-tab">
              Coordenação
            </Link>
          ) : (
            <button className="top-tab" disabled>
              Coordenação
            </button>
          )}
          <button className="top-tab top-tab--active" disabled>
            Professor
          </button>
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
        <Outlet />
      </div>
    </div>
  );
}
