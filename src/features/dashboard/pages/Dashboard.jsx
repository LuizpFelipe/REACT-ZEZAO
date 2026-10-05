import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { listarTurmas } from "@features/turma/services/turmaService";
import { listarProfessores } from "@features/professor/services/professorService";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { listarContratos } from "@features/contrato/services/contratoService";
import { listarCampeonatos } from "@features/campeonato/services/campeonatoService";
import { listarResumoFinanceiro } from "@features/financeiro/services/financeiroService";
import { estadoCampeonato } from "@features/campeonato/models/Campeonato";
import "@shared/shared.css";

/**
 * Painel da Coordenação — resumo geral do sistema.
 *
 * Não existe (nem precisa existir) nenhum endpoint novo de back-end pra essa
 * tela: todo número aqui é derivado dos endpoints que os outros cards já
 * definem (Alunos, Turmas, Professores, Categorias, Contratos, Campeonatos,
 * Financeiro/resumo). Por isso não tem card de back-end associado — é
 * trabalho só de front, combinando o que já existe.
 *
 * Alguns desses endpoints ainda não estão implementados (Contratos,
 * Campeonatos, Financeiro/resumo) — o card de cada um já tem o aviso de
 * "backend ainda não pronto"; aqui cada bloco falha isoladamente (um
 * Promise.allSettled), então a tela mostra o que já tiver e some só o
 * bloco que depende de endpoint pendente.
 */
export default function Dashboard() {
  const [carregando, setCarregando] = useState(true);
  const [dados, setDados] = useState({
    alunos: null,
    turmas: null,
    professores: null,
    categorias: null,
    contratos: null,
    campeonatos: null,
    resumoFinanceiro: null,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const [alunos, turmas, professores, categorias, contratos, campeonatos, resumoFinanceiro] =
      await Promise.allSettled([
        listarAlunos(),
        listarTurmas(),
        listarProfessores(),
        listarCategorias(),
        listarContratos(),
        listarCampeonatos(),
        listarResumoFinanceiro(),
      ]);

    setDados({
      alunos: alunos.status === "fulfilled" ? alunos.value : null,
      turmas: turmas.status === "fulfilled" ? turmas.value : null,
      professores: professores.status === "fulfilled" ? professores.value : null,
      categorias: categorias.status === "fulfilled" ? categorias.value : null,
      contratos: contratos.status === "fulfilled" ? contratos.value : null,
      campeonatos: campeonatos.status === "fulfilled" ? campeonatos.value : null,
      resumoFinanceiro: resumoFinanceiro.status === "fulfilled" ? resumoFinanceiro.value : null,
    });
    setCarregando(false);
  }

  if (carregando) {
    return <Loading label="Carregando painel..." />;
  }

  const { alunos, turmas, professores, categorias, contratos, campeonatos, resumoFinanceiro } = dados;

  const totalAlunos = alunos?.length ?? null;
  const inadimplentes = alunos ? alunos.filter((a) => a.status === "Inadimplente").length : null;
  const totalTurmas = turmas?.length ?? null;
  const totalProfessores = professores?.length ?? null;
  const totalCategorias = categorias?.length ?? null;
  const contratosAtivos = contratos ? contratos.filter((c) => c.status === "Ativo").length : null;
  const campeonatosAgendados = campeonatos
    ? campeonatos.filter((c) => estadoCampeonato(c.data) === "Agendado").length
    : null;

  // Alunos por turma — pra achar rapidinho qual turma está mais cheia/vazia.
  const alunosPorTurma = {};
  if (alunos && turmas) {
    for (const turma of turmas) {
      alunosPorTurma[turma.id] = alunos.filter((a) => a.turmaId === turma.id).length;
    }
  }
  const turmasOrdenadas = turmas
    ? [...turmas].sort((a, b) => (alunosPorTurma[b.id] ?? 0) - (alunosPorTurma[a.id] ?? 0))
    : [];

  function Stat({ label, valor, variante, to }) {
    const conteudo = (
      <div className={"stat-card" + (variante ? ` ${variante}` : "")}>
        <div className="label">{label}</div>
        <div className="value">{valor ?? "—"}</div>
      </div>
    );
    return to ? (
      <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
        {conteudo}
      </Link>
    ) : (
      conteudo
    );
  }

  return (
    <>
      <div className="coord-title-block">
        <div className="coord-eyebrow">Painel administrativo</div>
        <h1 className="coord-title">Dashboard</h1>
      </div>

      <div className="stats-row">
        <Stat label="Alunos" valor={totalAlunos} to="/coordenacao/alunos" />
        <Stat label="Inadimplentes" valor={inadimplentes} variante={inadimplentes ? "warn" : undefined} to="/coordenacao/inadimplentes" />
        <Stat label="Turmas" valor={totalTurmas} to="/coordenacao/turmas" />
        <Stat label="Professores" valor={totalProfessores} to="/coordenacao/professores" />
        <Stat label="Categorias" valor={totalCategorias} to="/coordenacao/categorias" />
      </div>

      <div className="stats-row">
        <Stat label="Contratos ativos" valor={contratosAtivos} to="/coordenacao/contratos" />
        <Stat label="Campeonatos agendados" valor={campeonatosAgendados} to="/campeonato" />
        <Stat label="Recebido no mês" valor={resumoFinanceiro?.recebidoMes} to="/coordenacao/financeiro" />
        <Stat label="Pendente" valor={resumoFinanceiro?.pendente} to="/coordenacao/financeiro" />
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Alunos por turma
        </h3>
        {!turmas || !alunos ? (
          <p className="helper-text">Não foi possível carregar as turmas agora.</p>
        ) : turmas.length === 0 ? (
          <p className="helper-text">Nenhuma turma cadastrada ainda.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Dias</th>
                  <th>Horário</th>
                  <th>Alunos</th>
                </tr>
              </thead>
              <tbody>
                {turmasOrdenadas.map((turma) => (
                  <tr key={turma.id}>
                    <td>{turma.nome}</td>
                    <td>{turma.diasSemana}</td>
                    <td>{turma.horario}</td>
                    <td>
                      <b>{alunosPorTurma[turma.id] ?? 0}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </>
  );
}
