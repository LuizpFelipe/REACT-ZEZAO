import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import { listarTurmas } from "@features/turma/services/turmaService";
import { registrarChamada, obterChamadaPorTurmaEData } from "../services/presencaService";
import "@shared/shared.css";

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Chamada() {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const data = useMemo(() => hojeIso(), []);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]); // [{ alunoId, nome, presente, ehInadimplente }]
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    carregar();
  }, [turmaId]);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const todasTurmas = await listarTurmas();
      const turmaAtual = todasTurmas.find((t) => t.id === turmaId);
      if (!turmaAtual) {
        setErro("Turma não encontrada.");
        return;
      }
      setTurma(turmaAtual);

      try {
        const roster = await obterChamadaPorTurmaEData(turmaId, data);
        setAlunos(roster);
      } catch {
        setAlunos([]);
      }
    } catch (err) {
      setErro(err.message || "Não foi possível carregar a chamada.");
    } finally {
      setCarregando(false);
    }
  }

  function alternarPresenca(alunoId) {
    setAlunos((atual) =>
      atual.map((aluno) => (aluno.alunoId === alunoId ? { ...aluno, presente: !aluno.presente } : aluno))
    );
  }

  async function handleSalvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      const listaPresencas = alunos.map((aluno) => ({
        alunoId: aluno.alunoId,
        presente: !!aluno.presente,
      }));
      await registrarChamada(turmaId, data, listaPresencas);
      setMensagem({ tipo: "sucesso", texto: "Chamada salva com sucesso." });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Não foi possível salvar a chamada.",
      });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <Loading label="Carregando chamada..." />;
  }

  if (erro) {
    return (
      <div className="card">
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erro}
        </p>
        <Link to="/professor" className="btn btn-outline btn-sm" style={{ textDecoration: "none", marginTop: 10, display: "inline-block" }}>
          Voltar
        </Link>
      </div>
    );
  }

  const qtdInadimplentes = alunos.filter((a) => a.ehInadimplente).length;

  return (
    <>
      <Link to="/professor" className="back-link">
        ← Minhas Turmas
      </Link>

      <div className="coord-title-block">
        <div className="coord-eyebrow">Painel do professor</div>
        <h1 className="coord-title">Chamada — {turma.nome}</h1>
      </div>

      <div className="table-toolbar" style={{ marginBottom: 14 }}>
        <span className="helper-text" style={{ margin: 0 }}>
          <b style={{ color: "var(--ink)" }}>{turma.nome}</b> · {turma.diasSemana} {turma.horario} · Data:{" "}
          <b style={{ color: "var(--ink)" }}>{data.split("-").reverse().join("/")}</b> ·{" "}
          <b style={{ color: "var(--ink)" }}>{alunos.length}</b> alunos matriculados ·{" "}
          <b style={{ color: "var(--ink)" }}>{qtdInadimplentes}</b> inadimplente(s)
        </span>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Lista de Presença
        </h3>

        {mensagem && (
          <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
            {mensagem.texto}
          </p>
        )}

        {alunos.length === 0 ? (
          <p className="helper-text">Nenhum aluno matriculado nesta turma.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "center" }}>Presente</th>
                  <th>Aluno</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.alunoId}>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={!!aluno.presente}
                        onChange={() => alternarPresenca(aluno.alunoId)}
                      />
                    </td>
                    <td>
                      <div className="aluno-cell">
                        <div className="avatar">
                          {aluno.nome
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        {aluno.ehInadimplente ? (
                          <span className="name-flag">
                            <span className="flag-dot" />
                            {aluno.nome}
                          </span>
                        ) : (
                          aluno.nome
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate("/professor")}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando || alunos.length === 0}>
          {salvando ? "Salvando..." : "Salvar Chamada"}
        </button>
      </div>
    </>
  );
}
