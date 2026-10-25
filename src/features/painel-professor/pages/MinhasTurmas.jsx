import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import Input from "@shared/components/Input/Input";
import Select from "@shared/components/Select/Select";
import { useAuth } from "@features/auth/hooks/useAuth";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { listarProfessores } from "@features/professor/services/professorService";
import { obterDataLocalIso } from "@shared/utils/data";
import { listarTurmasDoProfessor } from "../services/turmaProfessorService";
import "@shared/shared.css";
import "./Chamada.css";

export default function MinhasTurmas() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [parametrosDaUrl, setParametrosDaUrl] = useSearchParams();

  const ehCoordenador = usuario?.perfil === "Coordenador";
  const hoje = useMemo(() => obterDataLocalIso(), []);
  const dataFiltro = parametrosDaUrl.get("data") || hoje;

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [professorFiltro, setProfessorFiltro] = useState("todos");

  useEffect(() => {
    carregarApoio();
  }, []);

  useEffect(() => {
    carregarTurmas();
  }, [dataFiltro, professorFiltro]);

  async function carregarApoio() {
    try {
      const [alunosApi, professoresApi] = await Promise.all([
        listarAlunos(),
        ehCoordenador ? listarProfessores() : Promise.resolve([]),
      ]);
      setTodosAlunos(alunosApi);
      setProfessores(professoresApi);
    } catch (err) {
      setErro(err.message || "Não foi possível carregar suas turmas.");
    }
  }

  async function carregarTurmas() {
    setCarregando(true);
    setErro("");
    try {
      const turmasApi = await listarTurmasDoProfessor({
        dataIso: dataFiltro,
        professorId: ehCoordenador && professorFiltro !== "todos" ? professorFiltro : undefined,
      });
      setTurmas(turmasApi.filter((turma) => turma.temAulaNaData !== false));
    } catch (err) {
      setTurmas([]);
      setErro(err.message || "Não foi possível carregar suas turmas.");
    } finally {
      setCarregando(false);
    }
  }

  function alterarData(novaData) {
    if (!novaData) return;
    setParametrosDaUrl({ data: novaData }, { replace: true });
  }

  function nomeDoProfessor(professorId) {
    return professores.find((professor) => professor.id === professorId)?.nome ?? "";
  }

  const alunosPorTurma = useMemo(() => {
    const mapa = {};
    for (const turma of turmas) {
      mapa[turma.id] = todosAlunos.filter((aluno) => aluno.turmaId === turma.id);
    }
    return mapa;
  }, [turmas, todosAlunos]);

  const opcoesProfessor = [
    { value: "todos", label: "Todos os professores" },
    ...professores.map((professor) => ({ value: professor.id, label: professor.nome })),
  ];

  const totalAlunos = Object.values(alunosPorTurma).reduce((soma, lista) => soma + lista.length, 0);
  const totalInadimplentes = Object.values(alunosPorTurma)
    .flat()
    .filter((aluno) => aluno.status === "Inadimplente").length;

  return (
    <>
      <div className="coord-title-block">
        <div className="coord-eyebrow">Painel do professor</div>
        <h1 className="coord-title">{ehCoordenador ? "Aulas do dia" : "Minhas Turmas"}</h1>
      </div>

      <div className="chamada-filtros">
        <Input
          id="diaDasAulas"
          label="Dia"
          type="date"
          value={dataFiltro}
          onChange={(e) => alterarData(e.target.value)}
        />
        {ehCoordenador && (
          <Select
            id="professorFiltro"
            label="Professor"
            options={opcoesProfessor}
            value={professorFiltro}
            onChange={(e) => setProfessorFiltro(e.target.value)}
          />
        )}
        {dataFiltro !== hoje && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => alterarData(hoje)}>
            Voltar para hoje
          </button>
        )}
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Turmas no dia</div>
          <div className="value">{turmas.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Alunos no total</div>
          <div className="value">{totalAlunos}</div>
        </div>
        <div className="stat-card warn">
          <div className="label">Inadimplentes</div>
          <div className="value">{totalInadimplentes}</div>
        </div>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> {ehCoordenador ? "Turmas com aula no dia" : "Turmas sob minha responsabilidade"}
        </h3>

        {carregando ? (
          <Loading label="Carregando as turmas do dia..." />
        ) : erro ? (
          <p className="helper-text" style={{ color: "var(--red-ink)" }}>
            {erro}
          </p>
        ) : turmas.length === 0 ? (
          <p className="helper-text">Nenhuma aula neste dia.</p>
        ) : (
          <div className="turma-grid">
            {turmas.map((turma) => {
              const alunosDaTurma = alunosPorTurma[turma.id] || [];
              const temInadimplente = alunosDaTurma.some((aluno) => aluno.status === "Inadimplente");
              const nomeProfessorDaTurma = ehCoordenador ? nomeDoProfessor(turma.professorId) : "";
              return (
                <div className="turma-card" key={turma.id}>
                  <div className="turma-card-top">
                    <span className="turma-card-name">{turma.nome}</span>
                  </div>
                  <div className="turma-card-meta">
                    {turma.diasLegiveis} · <b>{turma.horario}</b>
                    {nomeProfessorDaTurma && <> · {nomeProfessorDaTurma}</>}
                  </div>
                  <div className="turma-card-foot">
                    <span className="turma-card-count">
                      <b>{alunosDaTurma.length}</b> alunos
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`chamada/${turma.id}?data=${dataFiltro}`)}
                    >
                      Fazer Chamada
                    </button>
                  </div>
                  {temInadimplente && (
                    <div className="turma-alert">
                      <span className="flag-dot" /> Turma com aluno inadimplente
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
