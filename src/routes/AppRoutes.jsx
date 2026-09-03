import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Login from "../pages/Login/Login";
import Professor from "../pages/Professor/Professor";
import Campeonato from "../pages/Campeonato/Campeonato";
import CoordenadorLayout from "../layouts/CoordenadorLayout/CoordenadorLayout";
import NovoAluno from "../pages/coordenador/NovoAluno/NovoAluno";
import Alunos from "../pages/coordenador/Alunos/Alunos";
import Contratos from "../pages/coordenador/Contratos/Contratos";
import Financeiro from "../pages/coordenador/Financeiro/Financeiro";

// Caminho padrão de cada perfil ao logar (ou ao ser barrado de uma área que não é dele).
function rotaDoPerfil(perfil) {
  return perfil === "Professor" ? "/professor" : "/coordenacao";
}

/**
 * Protege uma rota exigindo login — e, se perfisPermitidos for informado,
 * exige também que o usuário logado seja um dos perfis daquela lista.
 *
 * Modelo de acesso do projeto:
 * - Coordenador: acessa tudo (Coordenação, Professor, Campeonato)
 * - Professor: acessa a própria área e o Campeonato, mas não a Coordenação
 */
function RotaProtegida({ perfisPermitidos, children }) {
  const { usuario, isAuthenticated, carregandoSessao } = useAuth();

  if (carregandoSessao) {
    return null; // evita "piscar" a tela de login antes de checar a sessão salva
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    return <Navigate to={rotaDoPerfil(usuario.perfil)} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/professor"
        element={
          <RotaProtegida perfisPermitidos={["Coordenador", "Professor"]}>
            <Professor />
          </RotaProtegida>
        }
      />

      <Route
        path="/campeonato"
        element={
          <RotaProtegida perfisPermitidos={["Coordenador", "Professor"]}>
            <Campeonato />
          </RotaProtegida>
        }
      />

      <Route
        path="/coordenacao"
        element={
          <RotaProtegida perfisPermitidos={["Coordenador"]}>
            <CoordenadorLayout />
          </RotaProtegida>
        }
      >
        <Route index element={<Navigate to="novo-aluno" replace />} />
        <Route path="novo-aluno" element={<NovoAluno />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="financeiro" element={<Financeiro />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
