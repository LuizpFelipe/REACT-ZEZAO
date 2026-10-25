import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import Input from "@shared/components/Input/Input";
import { listarTurmas } from "@features/turma/services/turmaService";
import { converterDataIsoParaBr, obterDataLocalIso } from "@shared/utils/data";
import { registrarChamada, obterChamadaPorTurmaEData } from "../services/presencaService";
import "@shared/shared.css";
import "./Chamada.css";

export default function Chamada() {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const [parametrosDaUrl, setParametrosDaUrl] = useSearchParams();

  const hoje = useMemo(() => obterDataLocalIso(), []);
  const dataAula = parametrosDaUrl.get("data") || hoje;

  const [carregando, setCarregando] = useState(true);
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);
  const [erro, setErro] = useState("");
  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [podeEditar, setPodeEditar] = useState(true);
  const [avisoDaData, setAvisoDaData] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    carregarTurma();
  }, [turmaId]);

  useEffect(() => {
    if (turma) carregarChamada();
  }, [turma, dataAula]);

  async function carregarTurma() {
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
    } catch (err) {
      setErro(err.message || "Não foi possível carregar a chamada.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarChamada() {
    setCarregandoAlunos(true);
    setMensagem(null);
    setAvisoDaData("");
    try {
      const chamada = await obterChamadaPorTurmaEData(turmaId, dataAula);
      setAlunos(chamada.alunos);
      setPodeEditar(chamada.podeEditar);
      if (!chamada.podeEditar) {
        setAvisoDaData(
          chamada.motivoSomenteLeitura ||
            "Esta chamada está somente para leitura. Peça à Coordenação para corrigir."
        );
      }
    } catch (err) {
      setAlunos([]);
      setPodeEditar(false);
      setAvisoDaData(err.message || "Não foi possível carregar a chamada desta data.");
    } finally {
      setCarregandoAlunos(false);
    }
  }

  function alterarData(novaData) {
    if (!novaData) return;
    setParametrosDaUrl({ data: novaData }, { replace: true });
  }

  function marcarAluno(alunoId, presente) {
    setAlunos((atual) => atual.map((aluno) => (aluno.alunoId === alunoId ? { ...aluno, presente } : aluno)));
  }

  function marcarTodos(presente) {
    setAlunos((atual) => atual.map((aluno) => ({ ...aluno, presente })));
  }

  async function handleSalvar() {
    setSalvando(true);
    setMensagem(null);
    try {
      const listaPresencas = alunos.map((aluno) => ({
        alunoId: aluno.alunoId,
        presente: !!aluno.presente,
      }));
      await registrarChamada(turmaId, dataAula, listaPresencas);
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

  function abrirChamadaDoMes() {
    navigate(`/professor/chamada-mensal/${turmaId}?mes=${dataAula.slice(0, 7)}`);
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

  const quantidadeInadimplentes = alunos.filter((aluno) => aluno.ehInadimplente).length;
  const quantidadePresentes = alunos.filter((aluno) => aluno.presente).length;
  const quantidadeFaltas = alunos.length - quantidadePresentes;

  return (
    <>
      <Link to={`/professor?data=${dataAula}`} className="back-link">
        ← Minhas Turmas
      </Link>

      <div className="coord-title-block">
        <div className="coord-eyebrow">Painel do professor</div>
        <h1 className="coord-title">Chamada — {turma.nome}</h1>
      </div>

      <div className="chamada-modo">
        <button type="button" className="tab-item tab-item--active">
          Dia
        </button>
        <button type="button" className="tab-item" onClick={abrirChamadaDoMes}>
          Mês
        </button>
      </div>

      <div className="chamada-filtros">
        <Input
          id="dataAula"
          label="Data da aula"
          type="date"
          max={hoje}
          value={dataAula}
          onChange={(e) => alterarData(e.target.value)}
        />
        <span className="helper-text" style={{ margin: 0 }}>
          <b style={{ color: "var(--ink)" }}>{turma.nome}</b> · {turma.diasLegiveis} {turma.horario} · Data:{" "}
          <b style={{ color: "var(--ink)" }}>{converterDataIsoParaBr(dataAula)}</b> ·{" "}
          <b style={{ color: "var(--ink)" }}>{alunos.length}</b> alunos matriculados ·{" "}
          <b style={{ color: "var(--ink)" }}>{quantidadeInadimplentes}</b> inadimplente(s)
        </span>
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Lista de Presença
        </h3>

        {avisoDaData && (
          <div className="notice" style={{ marginTop: 0, marginBottom: 14 }}>
            <div>{avisoDaData}</div>
          </div>
        )}

        {mensagem && (
          <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
            {mensagem.texto}
          </p>
        )}

        {carregandoAlunos ? (
          <Loading label="Carregando chamada..." />
        ) : alunos.length === 0 ? (
          <p className="helper-text">Nenhum aluno para exibir nesta data.</p>
        ) : (
          <>
            <div className="chamada-acoes-em-massa">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => marcarTodos(true)} disabled={!podeEditar}>
                Marcar todos como C
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => marcarTodos(false)} disabled={!podeEditar}>
                Marcar todos como F
              </button>
              <span className="helper-text" style={{ margin: 0, alignSelf: "center" }}>
                C: <b style={{ color: "var(--ink)" }}>{quantidadePresentes}</b> · F:{" "}
                <b style={{ color: "var(--ink)" }}>{quantidadeFaltas}</b>
              </span>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="chamada-numero">Nº</th>
                    <th>Aluno</th>
                    <th style={{ textAlign: "center" }}>Presença</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno, indice) => (
                    <tr key={aluno.alunoId}>
                      <td className="chamada-numero">{indice + 1}</td>
                      <td>
                        <div className="aluno-cell">
                          <div className="avatar">
                            {aluno.nome
                              .split(" ")
                              .slice(0, 2)
                              .map((parte) => parte[0])
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
                      <td style={{ textAlign: "center" }}>
                        <div className="marcacao-grupo" role="group" aria-label={`Presença de ${aluno.nome}`}>
                          <button
                            type="button"
                            className={`marcacao-botao marcacao-botao--compareceu${aluno.presente ? " marcacao-botao--ativo" : ""}`}
                            aria-pressed={!!aluno.presente}
                            aria-label={`${aluno.nome} compareceu`}
                            disabled={!podeEditar}
                            onClick={() => marcarAluno(aluno.alunoId, true)}
                          >
                            C
                          </button>
                          <button
                            type="button"
                            className={`marcacao-botao marcacao-botao--faltou${!aluno.presente ? " marcacao-botao--ativo" : ""}`}
                            aria-pressed={!aluno.presente}
                            aria-label={`${aluno.nome} faltou`}
                            disabled={!podeEditar}
                            onClick={() => marcarAluno(aluno.alunoId, false)}
                          >
                            F
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate(`/professor?data=${dataAula}`)}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleSalvar} disabled={salvando || alunos.length === 0 || !podeEditar}>
          {salvando ? "Salvando..." : "Salvar Chamada"}
        </button>
      </div>
    </>
  );
}
