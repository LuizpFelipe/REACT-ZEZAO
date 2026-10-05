import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";
import Login from "@features/auth/pages/Login";
import RecuperarSenha from "@features/auth/pages/RecuperarSenha";
import MinhasTurmas from "@features/painel-professor/pages/MinhasTurmas";
import Chamada from "@features/painel-professor/pages/Chamada";
import Campeonatos from "@features/campeonato/pages/Campeonatos";
import CampeonatoDetalhe from "@features/campeonato/pages/CampeonatoDetalhe";
import ProfessorLayout from "@shared/layouts/ProfessorLayout/ProfessorLayout";
import CampeonatoLayout from "@shared/layouts/CampeonatoLayout/CampeonatoLayout";
import CoordenadorLayout from "@shared/layouts/CoordenadorLayout/CoordenadorLayout";
import Dashboard from "@features/dashboard/pages/Dashboard";
import NovoAluno from "@features/aluno/pages/NovoAluno";
import Alunos from "@features/aluno/pages/Alunos";
import Contratos from "@features/contrato/pages/Contratos";
import Financeiro from "@features/financeiro/pages/Financeiro";
import Inadimplentes from "@features/financeiro/pages/Inadimplentes";
import Categorias from "@features/categoria/pages/Categorias";
import Professores from "@features/professor/pages/Professores";
import Turmas from "@features/turma/pages/Turmas";

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
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />

      <Route
        path="/professor"
        element={
          <RotaProtegida perfisPermitidos={["Coordenador", "Professor"]}>
            <ProfessorLayout />
          </RotaProtegida>
        }
      >
        <Route index element={<MinhasTurmas />} />
        <Route path="chamada/:turmaId" element={<Chamada />} />
      </Route>

      <Route
        path="/campeonato"
        element={
          <RotaProtegida perfisPermitidos={["Coordenador", "Professor"]}>
            <CampeonatoLayout />
          </RotaProtegida>
        }
      >
        <Route index element={<Campeonatos />} />
        <Route path=":campeonatoId" element={<CampeonatoDetalhe />} />
      </Route>

      <Route
        path="/coordenacao"
        element={
          <RotaProtegida perfisPermitidos={["Coordenador"]}>
            <CoordenadorLayout />
          </RotaProtegida>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="novo-aluno" element={<NovoAluno />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="inadimplentes" element={<Inadimplentes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="professores" element={<Professores />} />
        <Route path="turmas" element={<Turmas />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
