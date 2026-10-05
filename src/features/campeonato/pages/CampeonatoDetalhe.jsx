import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import Select from "@shared/components/Select/Select";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { listarAlunos } from "@features/aluno/services/alunoService";
import {
  atualizarParticipacao,
  inscreverAluno,
  listarParticipacoes,
  obterCampeonato,
} from "../services/campeonatoService";
import "@shared/shared.css";

const ABAS = [
  { chave: "ranqueamento", label: "Ranqueamento" },
  { chave: "inscricoes", label: "Inscrições" },
  { chave: "jogos", label: "Jogos" },
];

export default function CampeonatoDetalhe() {
  const { campeonatoId } = useParams();
  const [abaAtiva, setAbaAtiva] = useState("ranqueamento");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [campeonato, setCampeonato] = useState(null);
  const [nomeCategoria, setNomeCategoria] = useState("—");
  const [alunos, setAlunos] = useState([]);
  const [participacoes, setParticipacoes] = useState([]);

  const [alunoParaInscrever, setAlunoParaInscrever] = useState("");
  const [inscrevendo, setInscrevendo] = useState(false);
  const [erroInscricao, setErroInscricao] = useState("");
  const [edicoes, setEdicoes] = useState({});
  const [salvandoId, setSalvandoId] = useState(null);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campeonatoId]);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [camp, categorias, alunosApi] = await Promise.all([
        obterCampeonato(campeonatoId),
        listarCategorias(),
        listarAlunos(),
      ]);
      setCampeonato(camp);
      setNomeCategoria(categorias.find((c) => c.id === camp.categoriaId)?.nome ?? "—");
      setAlunos(alunosApi);

      try {
        const lista = await listarParticipacoes(campeonatoId);
        setParticipacoes(lista);
      } catch {
        setParticipacoes([]);
      }
    } catch (err) {
      setErro(err.message || "Não foi possível carregar o campeonato.");
    } finally {
      setCarregando(false);
    }
  }

  const ranking = useMemo(
    () => [...participacoes].sort((a, b) => (a.posicao ?? 999) - (b.posicao ?? 999)),
    [participacoes]
  );

  // Só alunos da mesma categoria do campeonato, e que ainda não estão inscritos.
  const alunosDisponiveis = useMemo(() => {
    const inscritoIds = new Set(participacoes.map((p) => p.alunoId));
    return alunos.filter((a) => a.categoriaId === campeonato?.categoriaId && !inscritoIds.has(a.id));
  }, [alunos, participacoes, campeonato]);

  function nomeDoAluno(alunoId) {
    return alunos.find((a) => a.id === alunoId)?.nome ?? "—";
  }

  async function handleInscrever(event) {
    event.preventDefault();
    setErroInscricao("");
    if (!alunoParaInscrever) {
      setErroInscricao("Selecione um aluno.");
      return;
    }
    setInscrevendo(true);
    try {
      await inscreverAluno(campeonatoId, { alunoId: alunoParaInscrever });
      setAlunoParaInscrever("");
      await carregar();
    } catch (err) {
      setErroInscricao(err.message || "Não foi possível inscrever o aluno.");
    } finally {
      setInscrevendo(false);
    }
  }

  function campoEdicao(participacao, campo) {
    return edicoes[participacao.id]?.[campo] ?? participacao[campo] ?? "";
  }

  function handleEditarCampo(participacaoId, campo, valor) {
    setEdicoes((atual) => ({
      ...atual,
      [participacaoId]: { ...atual[participacaoId], [campo]: valor },
    }));
  }

  async function handleSalvarParticipacao(participacao) {
    setSalvandoId(participacao.id);
    try {
      const dados = {
        posicao: campoEdicao(participacao, "posicao") === "" ? null : Number(campoEdicao(participacao, "posicao")),
        jogosDisputados: Number(campoEdicao(participacao, "jogosDisputados")) || 0,
        aproveitamento: Number(campoEdicao(participacao, "aproveitamento")) || 0,
      };
      await atualizarParticipacao(participacao.id, dados);
      await carregar();
    } catch (err) {
      alert(err.message || "Não foi possível atualizar a participação.");
    } finally {
      setSalvandoId(null);
    }
  }

  if (carregando) {
    return <Loading label="Carregando campeonato..." />;
  }

  if (erro || !campeonato) {
    return (
      <div className="card">
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erro || "Campeonato não encontrado."}
        </p>
        <Link to="/campeonato" className="btn btn-outline btn-sm" style={{ textDecoration: "none", marginTop: 10, display: "inline-block" }}>
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/campeonato" className="back-link">
        ← Campeonatos
      </Link>

      <div className="coord-title-block">
        <div className="coord-eyebrow">Competições</div>
        <h1 className="coord-title" style={{ marginBottom: 4 }}>
          {campeonato.nome}
        </h1>
        <p className="helper-text" style={{ marginTop: 0 }}>
          {nomeCategoria} · {campeonato.data?.split("-").reverse().join("/")} · {participacoes.length} aluno(s) inscrito(s)
        </p>
      </div>

      <div className="tab-row">
        {ABAS.map((aba) => (
          <button
            key={aba.chave}
            className={`tab-item${abaAtiva === aba.chave ? " tab-item--active" : ""}`}
            onClick={() => setAbaAtiva(aba.chave)}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === "ranqueamento" && (
        <div className="card">
          <h3>
            <span className="dot" /> Classificação Geral
          </h3>
          {ranking.length === 0 ? (
            <p className="helper-text">Ainda não há alunos inscritos neste campeonato.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>Aluno</th>
                    <th style={{ textAlign: "center" }}>Jogos</th>
                    <th>Aproveitamento</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.posicao ? (
                          <span className={`rank-badge${p.posicao <= 3 ? ` rank-${p.posicao}` : " rank-n"}`}>{p.posicao}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{nomeDoAluno(p.alunoId)}</td>
                      <td style={{ textAlign: "center" }}>{p.jogosDisputados}</td>
                      <td>
                        <span className="aproveitamento-bar">
                          <span style={{ width: `${p.aproveitamento}%` }} />
                        </span>
                        {p.aproveitamento}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "inscricoes" && (
        <div className="card">
          <h3>
            <span className="dot" /> Inscrições
          </h3>

          <form onSubmit={handleInscrever} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <Select
                id="alunoInscrever"
                label="Inscrever aluno"
                options={[
                  { value: "", label: alunosDisponiveis.length === 0 ? "Nenhum aluno disponível" : "Selecione um aluno" },
                  ...alunosDisponiveis.map((a) => ({ value: a.id, label: a.nome })),
                ]}
                value={alunoParaInscrever}
                onChange={(e) => setAlunoParaInscrever(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm" disabled={inscrevendo || alunosDisponiveis.length === 0}>
              {inscrevendo ? "Inscrevendo..." : "Inscrever"}
            </Button>
          </form>
          {erroInscricao && (
            <p className="helper-text" style={{ color: "var(--red-ink)" }}>
              {erroInscricao}
            </p>
          )}
          <p className="helper-text">Só mostra alunos da categoria {nomeCategoria} que ainda não estão inscritos.</p>

          {participacoes.length === 0 ? (
            <p className="helper-text">Nenhum aluno inscrito ainda.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th style={{ width: 90 }}>Posição</th>
                    <th style={{ width: 90 }}>Jogos</th>
                    <th style={{ width: 120 }}>Aproveitamento (%)</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {participacoes.map((p) => (
                    <tr key={p.id}>
                      <td>{nomeDoAluno(p.alunoId)}</td>
                      <td>
                        <Input
                          id={`posicao-${p.id}`}
                          type="number"
                          min="1"
                          value={campoEdicao(p, "posicao")}
                          onChange={(e) => handleEditarCampo(p.id, "posicao", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          id={`jogos-${p.id}`}
                          type="number"
                          min="0"
                          value={campoEdicao(p, "jogosDisputados")}
                          onChange={(e) => handleEditarCampo(p.id, "jogosDisputados", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          id={`aproveitamento-${p.id}`}
                          type="number"
                          min="0"
                          max="100"
                          value={campoEdicao(p, "aproveitamento")}
                          onChange={(e) => handleEditarCampo(p.id, "aproveitamento", e.target.value)}
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSalvarParticipacao(p)}
                          disabled={salvandoId === p.id}
                        >
                          {salvandoId === p.id ? "Salvando..." : "Salvar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "jogos" && (
        <div className="card">
          <h3>
            <span className="dot" /> Jogos
          </h3>
          <p className="helper-text">Nenhum jogo cadastrado.</p>
        </div>
      )}
    </>
  );
}
