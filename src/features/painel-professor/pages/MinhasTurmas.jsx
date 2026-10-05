import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { listarTurmasDoProfessor } from "../services/turmaProfessorService";
import "@shared/shared.css";

export default function MinhasTurmas() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [alunosPorTurma, setAlunosPorTurma] = useState({});

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [minhasTurmas, todosAlunos] = await Promise.all([
        listarTurmasDoProfessor(),
        listarAlunos(),
      ]);

      const mapa = {};
      for (const turma of minhasTurmas) {
        mapa[turma.id] = todosAlunos.filter((a) => a.turmaId === turma.id);
      }

      setTurmas(minhasTurmas);
      setAlunosPorTurma(mapa);
    } catch (err) {
      setErro(err.message || "Não foi possível carregar suas turmas.");
    } finally {
      setCarregando(false);
    }
  }

  if (carregando) {
    return <Loading label="Carregando suas turmas..." />;
  }

  if (erro) {
    return (
      <div className="card">
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erro}
        </p>
      </div>
    );
  }

  const totalAlunos = Object.values(alunosPorTurma).reduce((soma, lista) => soma + lista.length, 0);

  return (
    <>
      <div className="coord-title-block">
        <div className="coord-eyebrow">Painel do professor</div>
        <h1 className="coord-title">Minhas Turmas</h1>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Turmas</div>
          <div className="value">{turmas.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Alunos no total</div>
          <div className="value">{totalAlunos}</div>
        </div>
        <div className="stat-card warn">
          <div className="label">Inadimplentes</div>
          <div className="value">
            {Object.values(alunosPorTurma)
              .flat()
              .filter((a) => a.status === "Inadimplente").length}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Turmas sob minha responsabilidade
        </h3>

        {turmas.length === 0 ? (
          <p className="helper-text">Nenhuma turma atribuída a você ainda.</p>
        ) : (
          <div className="turma-grid">
            {turmas.map((turma) => {
              const alunosDaTurma = alunosPorTurma[turma.id] || [];
              const temInadimplente = alunosDaTurma.some((a) => a.status === "Inadimplente");
              return (
                <div className="turma-card" key={turma.id}>
                  <div className="turma-card-top">
                    <span className="turma-card-name">{turma.nome}</span>
                  </div>
                  <div className="turma-card-meta">
                    {turma.diasSemana} · <b>{turma.horario}</b>
                  </div>
                  <div className="turma-card-foot">
                    <span className="turma-card-count">
                      <b>{alunosDaTurma.length}</b> alunos
                    </span>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`chamada/${turma.id}`)}>
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
