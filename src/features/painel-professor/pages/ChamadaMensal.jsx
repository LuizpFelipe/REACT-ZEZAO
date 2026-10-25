import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import Input from "@shared/components/Input/Input";
import { formatarDiaMes, obterDataLocalIso, obterMesLocal } from "@shared/utils/data";
import { formatarDiasParaExibicao } from "@features/turma/models/Turma";
import { obterChamadaMensal } from "../services/presencaService";
import "@shared/shared.css";
import "./Chamada.css";

const CLASSE_DA_CELULA = {
  C: "celula-presenca celula-presenca--compareceu",
  F: "celula-presenca celula-presenca--faltou",
};

export default function ChamadaMensal() {
  const { turmaId } = useParams();
  const navigate = useNavigate();
  const [parametrosDaUrl, setParametrosDaUrl] = useSearchParams();

  const mesAtual = useMemo(() => obterMesLocal(), []);
  const hoje = useMemo(() => obterDataLocalIso(), []);
  const mes = parametrosDaUrl.get("mes") || mesAtual;

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [chamadaMensal, setChamadaMensal] = useState(null);

  useEffect(() => {
    carregar();
  }, [turmaId, mes]);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setChamadaMensal(await obterChamadaMensal(turmaId, mes));
    } catch (err) {
      setChamadaMensal(null);
      setErro(err.message || "Não foi possível carregar a chamada do mês.");
    } finally {
      setCarregando(false);
    }
  }

  function alterarMes(novoMes) {
    if (!novoMes) return;
    setParametrosDaUrl({ mes: novoMes }, { replace: true });
  }

  function abrirChamadaDoDia(dataIso) {
    navigate(`/professor/chamada/${turmaId}?data=${dataIso}`);
  }

  function abrirModoDia() {
    const dataDoModoDia = mes === mesAtual ? hoje : chamadaMensal?.datas[0]?.dataIso ?? `${mes}-01`;
    abrirChamadaDoDia(dataDoModoDia);
  }

  const turma = chamadaMensal?.turma;
  const datas = chamadaMensal?.datas ?? [];
  const alunos = chamadaMensal?.alunos ?? [];

  return (
    <>
      <Link to="/professor" className="back-link">
        ← Minhas Turmas
      </Link>

      <div className="coord-title-block">
        <div className="coord-eyebrow">Painel do professor</div>
        <h1 className="coord-title">Chamada do mês{turma?.nome ? ` — ${turma.nome}` : ""}</h1>
      </div>

      <div className="chamada-modo">
        <button type="button" className="tab-item" onClick={abrirModoDia}>
          Dia
        </button>
        <button type="button" className="tab-item tab-item--active">
          Mês
        </button>
      </div>

      <div className="chamada-filtros">
        <Input id="mesChamada" label="Mês" type="month" value={mes} onChange={(e) => alterarMes(e.target.value)} />
        {turma && (
          <span className="helper-text" style={{ margin: 0 }}>
            {formatarDiasParaExibicao(turma.diasSemana)} {turma.horario} · <b style={{ color: "var(--ink)" }}>{datas.length}</b> aula(s) no mês ·{" "}
            <b style={{ color: "var(--ink)" }}>{alunos.length}</b> alunos
          </span>
        )}
      </div>

      <div className="card">
        <h3>
          <span className="dot" /> Presenças do mês
        </h3>

        {carregando ? (
          <Loading label="Carregando chamada do mês..." />
        ) : erro ? (
          <p className="helper-text" style={{ color: "var(--red-ink)" }}>
            {erro}
          </p>
        ) : datas.length === 0 ? (
          <p className="helper-text">Nenhuma aula neste mês.</p>
        ) : alunos.length === 0 ? (
          <p className="helper-text">Nenhum aluno matriculado nesta turma.</p>
        ) : (
          <div className="matriz-rolagem">
            <table className="matriz-chamada">
              <thead>
                <tr>
                  <th className="matriz-coluna-numero">Nº</th>
                  <th className="matriz-coluna-nome">Nome</th>
                  {datas.map((data) => (
                    <th key={data.dataIso}>
                      <div className="matriz-cabecalho-data">
                        <span>{formatarDiaMes(data.dataIso)}</span>
                        {data.podeEditar && (
                          <button
                            type="button"
                            className="matriz-lapis"
                            aria-label={`Editar a chamada de ${formatarDiaMes(data.dataIso)}`}
                            title="Editar a chamada deste dia"
                            onClick={() => abrirChamadaDoDia(data.dataIso)}
                          >
                            ✎
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno, indice) => (
                  <tr key={aluno.alunoId}>
                    <td className="matriz-coluna-numero">{indice + 1}</td>
                    <td className="matriz-coluna-nome">
                      {aluno.ehInadimplente ? (
                        <span className="name-flag">
                          <span className="flag-dot" />
                          {aluno.nome}
                        </span>
                      ) : (
                        aluno.nome
                      )}
                    </td>
                    {datas.map((data) => {
                      const situacao = aluno.presencaPorData[data.dataIso] ?? null;
                      return (
                        <td key={data.dataIso}>
                          <span
                            className={CLASSE_DA_CELULA[situacao] ?? "celula-presenca celula-presenca--vazia"}
                            title={situacao === "C" ? "Compareceu" : situacao === "F" ? "Faltou" : "Sem registro"}
                          >
                            {situacao ?? "–"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="helper-text">C = compareceu · F = faltou · – = sem registro</p>
    </>
  );
}
