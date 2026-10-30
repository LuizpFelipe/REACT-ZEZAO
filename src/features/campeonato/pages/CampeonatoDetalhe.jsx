import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import Select from "@shared/components/Select/Select";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import Modal from "@shared/components/Modal/Modal";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { POSICOES } from "@features/aluno/models/Posicao";
import {
  criarEquipe,
  finalizarJogo,
  gerarJogos,
  inscreverAluno,
  listarElegiveis,
  listarEquipes,
  listarJogos,
  listarParticipacoes,
  obterCampeonato,
  obterEstatisticas,
  obterRanking,
  reiniciarJogos,
  removerEquipe,
  removerInscricao,
  salvarEstatisticas,
  sortearEquipes,
} from "../services/campeonatoService";
import "@shared/shared.css";

const ABAS = [
  { chave: "inscricoes", label: "Inscrições" },
  { chave: "times", label: "Times" },
  { chave: "jogos", label: "Jogos" },
  { chave: "ranking", label: "Ranking" },
];

const CAMPOS_ESTATISTICA = [
  { chave: "gols", label: "Gols" },
  { chave: "assistencias", label: "Assist." },
  { chave: "passesCertos", label: "Passes" },
  { chave: "desarmes", label: "Desarmes" },
  { chave: "defesas", label: "Defesas" },
  { chave: "faltas", label: "Faltas" },
  { chave: "cartoesAmarelos", label: "Amarelos" },
  { chave: "cartoesVermelhos", label: "Vermelhos" },
];

const ROTULO_STATUS = { Aguardando: "Aguardando", Pendente: "A jogar", Finalizado: "Finalizado" };
const CLASSE_STATUS = { Aguardando: "pill--neutro", Pendente: "pill--warn", Finalizado: "pill--ok" };

export default function CampeonatoDetalhe() {
  const { campeonatoId } = useParams();
  const [abaAtiva, setAbaAtiva] = useState("inscricoes");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [campeonato, setCampeonato] = useState(null);
  const [nomeCategoria, setNomeCategoria] = useState("—");
  const [participacoes, setParticipacoes] = useState([]);
  const [elegiveis, setElegiveis] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [jogos, setJogos] = useState([]);
  const [ranking, setRanking] = useState(null);

  const [mensagem, setMensagem] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  const [alunoParaInscrever, setAlunoParaInscrever] = useState("");
  const [escolhas, setEscolhas] = useState({});
  const [nomeDoTime, setNomeDoTime] = useState("");
  const [quantidadeDeTimes, setQuantidadeDeTimes] = useState("");
  const [modoLivre, setModoLivre] = useState(false);
  const [selecionadosNoModoLivre, setSelecionadosNoModoLivre] = useState([]);

  const [jogoAberto, setJogoAberto] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [erroEstatisticas, setErroEstatisticas] = useState("");

  useEffect(() => {
    carregar(true);
  }, [campeonatoId]);

  async function carregar(inicial = false) {
    if (inicial) setCarregando(true);
    setErro("");
    try {
      const [camp, categorias, parts, elegs, eqs, jgs, rk] = await Promise.all([
        obterCampeonato(campeonatoId),
        listarCategorias(),
        listarParticipacoes(campeonatoId),
        listarElegiveis(campeonatoId),
        listarEquipes(campeonatoId),
        listarJogos(campeonatoId),
        obterRanking(campeonatoId),
      ]);
      setCampeonato(camp);
      setNomeCategoria(categorias.find((c) => c.id === camp.categoriaId)?.nome ?? "—");
      setParticipacoes(parts);
      setElegiveis(elegs);
      setEquipes(eqs);
      setJogos(jgs);
      setRanking(rk);
    } catch (err) {
      setErro(err.message || "Não foi possível carregar o campeonato.");
    } finally {
      setCarregando(false);
    }
  }

  async function executar(acao, textoSucesso) {
    setOcupado(true);
    setMensagem(null);
    try {
      const retorno = await acao();
      await carregar();
      const texto = typeof retorno === "string" && retorno ? retorno : textoSucesso;
      if (texto) setMensagem({ tipo: "sucesso", texto });
      return true;
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível concluir a operação." });
      return false;
    } finally {
      setOcupado(false);
    }
  }

  const jogosGerados = jogos.length > 0;
  const semTime = useMemo(() => participacoes.filter((p) => !p.equipeId), [participacoes]);
  const elegiveisComPosicao = elegiveis.filter((a) => a.posicao !== null);
  const elegiveisSemPosicao = elegiveis.filter((a) => a.posicao === null);

  function livresDaPosicao(posicaoNome) {
    const selecionadosEmOutras = new Set(Object.values(escolhas).filter(Boolean));
    return semTime.filter(
      (p) => p.posicaoDeJogo === posicaoNome && (escolhas[posicaoNome] === p.alunoId || !selecionadosEmOutras.has(p.alunoId))
    );
  }

  function handleInscrever(event) {
    event.preventDefault();
    if (!alunoParaInscrever) {
      setMensagem({ tipo: "erro", texto: "Selecione um aluno." });
      return;
    }
    executar(async () => {
      await inscreverAluno(campeonatoId, { alunoId: alunoParaInscrever });
      setAlunoParaInscrever("");
    }, "Aluno inscrito.");
  }

  function handleInscreverTodos() {
    executar(async () => {
      for (const aluno of elegiveisComPosicao) {
        await inscreverAluno(campeonatoId, { alunoId: aluno.alunoId });
      }
    }, `${elegiveisComPosicao.length} aluno(s) inscrito(s).`);
  }

  function handleRemoverInscricao(participacao) {
    executar(() => removerInscricao(campeonatoId, participacao.id), "Inscrição removida.");
  }

  function handleCriarTime(event) {
    event.preventDefault();
    const alunoIds = modoLivre ? selecionadosNoModoLivre : POSICOES.map((p) => escolhas[p.label]).filter(Boolean);
    if (!modoLivre && alunoIds.length !== POSICOES.length) {
      setMensagem({ tipo: "erro", texto: "Escolha um aluno para cada posição." });
      return;
    }
    if (modoLivre && (alunoIds.length < 5 || alunoIds.length > 8)) {
      setMensagem({ tipo: "erro", texto: "No modo livre, selecione de 5 a 8 alunos." });
      return;
    }
    executar(async () => {
      await criarEquipe(campeonatoId, { nome: nomeDoTime.trim(), alunoIds, modoLivre });
      setEscolhas({});
      setSelecionadosNoModoLivre([]);
      setNomeDoTime("");
    }, "Time criado.");
  }

  async function handleSortear() {
    const quantidade = quantidadeDeTimes === "" ? null : Number(quantidadeDeTimes);
    setOcupado(true);
    setMensagem(null);
    try {
      let resultado;
      try {
        resultado = await sortearEquipes(campeonatoId, quantidade, false);
      } catch (err) {
        const querMontarMesmoAssim = window.confirm(
          `${err.message}\n\nDeseja montar os times mesmo assim? Jogadores de outras posições vão completar as vagas que faltam, e quem sobrar entra como reserva.`
        );
        if (!querMontarMesmoAssim) {
          setMensagem({ tipo: "erro", texto: err.message });
          return;
        }
        resultado = await sortearEquipes(campeonatoId, quantidade, true);
      }
      setQuantidadeDeTimes("");
      await carregar();
      setMensagem({ tipo: "sucesso", texto: resultado.mensagem || "Times sorteados." });
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível sortear os times." });
    } finally {
      setOcupado(false);
    }
  }

  function handleRemoverTime(equipe) {
    if (!window.confirm(`Remover o ${equipe.nome}? Os alunos voltam para a lista sem time.`)) return;
    executar(() => removerEquipe(campeonatoId, equipe.id), "Time removido.");
  }

  function handleGerarJogos() {
    executar(() => gerarJogos(campeonatoId), "Jogos gerados.");
  }

  function handleReiniciarJogos() {
    if (!window.confirm("Apagar o chaveamento atual para alterar os times ou sortear de novo?")) return;
    executar(() => reiniciarJogos(campeonatoId), "Jogos removidos.");
  }

  async function abrirJogo(jogo) {
    setJogoAberto(jogo);
    setEstatisticas(null);
    setErroEstatisticas("");
    try {
      setEstatisticas(await obterEstatisticas(jogo.id));
    } catch (err) {
      setErroEstatisticas(err.message || "Não foi possível carregar o jogo.");
    }
  }

  function fecharJogo() {
    setJogoAberto(null);
    setEstatisticas(null);
  }

  function alterarEstatistica(alunoId, campo, valor) {
    const numero = valor === "" ? 0 : Math.max(0, Math.min(999, parseInt(valor, 10) || 0));
    setEstatisticas((atual) => ({
      ...atual,
      jogadores: atual.jogadores.map((j) => (j.alunoId === alunoId ? { ...j, [campo]: numero } : j)),
    }));
  }

  const placarAoVivo = useMemo(() => {
    if (!estatisticas) return { a: 0, b: 0 };
    const soma = (equipeId) => estatisticas.jogadores.filter((j) => j.equipeId === equipeId).reduce((t, j) => t + j.gols, 0);
    return { a: soma(estatisticas.jogo.equipeAId), b: soma(estatisticas.jogo.equipeBId) };
  }, [estatisticas]);

  async function persistirEstatisticas() {
    const payload = estatisticas.jogadores.map((j) => ({
      alunoId: j.alunoId,
      gols: j.gols,
      assistencias: j.assistencias,
      passesCertos: j.passesCertos,
      desarmes: j.desarmes,
      defesas: j.defesas,
      faltas: j.faltas,
      cartoesAmarelos: j.cartoesAmarelos,
      cartoesVermelhos: j.cartoesVermelhos,
    }));
    return salvarEstatisticas(jogoAberto.id, payload);
  }

  async function handleSalvarEstatisticas(finalizar) {
    setOcupado(true);
    setErroEstatisticas("");
    try {
      const salvo = await persistirEstatisticas();
      setEstatisticas(salvo);
      if (finalizar) {
        await finalizarJogo(jogoAberto.id);
        fecharJogo();
        setMensagem({ tipo: "sucesso", texto: "Jogo finalizado." });
      } else {
        setMensagem({ tipo: "sucesso", texto: "Estatísticas salvas." });
      }
      await carregar();
    } catch (err) {
      setErroEstatisticas(err.message || "Não foi possível salvar.");
      await carregar();
    } finally {
      setOcupado(false);
    }
  }

  const fases = useMemo(() => {
    const grupos = new Map();
    for (const jogo of jogos) {
      if (!grupos.has(jogo.fase)) grupos.set(jogo.fase, { nome: jogo.nomeDaFase, jogos: [] });
      grupos.get(jogo.fase).jogos.push(jogo);
    }
    return [...grupos.entries()].sort((a, b) => a[0] - b[0]).map(([, grupo]) => grupo);
  }, [jogos]);

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

  const somenteLeitura = estatisticas?.jogo?.status === "Finalizado";

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
          {nomeCategoria} · {campeonato.data?.split("-").reverse().join("/")} · {participacoes.length} aluno(s) inscrito(s) · {equipes.length} time(s)
        </p>
      </div>

      <div className="tab-row">
        {ABAS.map((aba) => (
          <button key={aba.chave} className={`tab-item${abaAtiva === aba.chave ? " tab-item--active" : ""}`} onClick={() => setAbaAtiva(aba.chave)}>
            {aba.label}
          </button>
        ))}
      </div>

      {mensagem && (
        <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
          {mensagem.texto}
        </p>
      )}

      {abaAtiva === "inscricoes" && (
        <div className="card">
          <h3>
            <span className="dot" /> Inscrições
          </h3>

          {jogosGerados ? (
            <p className="helper-text">Os jogos já foram gerados, então as inscrições estão fechadas.</p>
          ) : (
            <>
              <form onSubmit={handleInscrever} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <Select
                    id="alunoInscrever"
                    label="Inscrever aluno"
                    options={[
                      { value: "", label: elegiveisComPosicao.length === 0 ? "Nenhum aluno disponível" : "Selecione um aluno" },
                      ...elegiveisComPosicao.map((a) => ({ value: a.alunoId, label: `${a.nome} — ${a.posicaoNome} (${a.categoriaNome})` })),
                    ]}
                    value={alunoParaInscrever}
                    onChange={(e) => setAlunoParaInscrever(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" disabled={ocupado || elegiveisComPosicao.length === 0}>
                  Inscrever
                </Button>
                <Button variant="outline" size="sm" onClick={handleInscreverTodos} disabled={ocupado || elegiveisComPosicao.length === 0}>
                  Inscrever todos ({elegiveisComPosicao.length})
                </Button>
              </form>
              <p className="helper-text">
                Aparecem alunos da categoria {nomeCategoria} e da categoria imediatamente abaixo que ainda não estão inscritos.
              </p>
              {elegiveisSemPosicao.length > 0 && (
                <p className="helper-text" style={{ color: "var(--red-ink)" }}>
                  {elegiveisSemPosicao.length} aluno(s) elegível(is) sem posição cadastrada ({elegiveisSemPosicao.map((a) => a.nome).join(", ")}). Defina a posição na tela de Alunos para poder inscrevê-los.
                </p>
              )}
            </>
          )}

          {participacoes.length === 0 ? (
            <p className="helper-text">Nenhum aluno inscrito ainda.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>Posição</th>
                    <th>Time</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {participacoes.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nomeAluno}</td>
                      <td>{p.posicaoDeJogo ?? "—"}</td>
                      <td>{equipes.find((e) => e.id === p.equipeId)?.nome ?? "Sem time"}</td>
                      <td>
                        <Button variant="outline" size="sm" onClick={() => handleRemoverInscricao(p)} disabled={ocupado || jogosGerados || !!p.equipeId}>
                          Remover
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

      {abaAtiva === "times" && (
        <div className="grid-2">
          <div className="card">
            <h3>
              <span className="dot" /> Criar times
            </h3>
            {jogosGerados ? (
              <p className="helper-text">Os jogos já foram gerados. Para mexer nos times, refaça o sorteio na aba Jogos.</p>
            ) : (
              <>
                <p className="helper-text">
                  {semTime.length} aluno(s) sem time. Cada time tem 5 jogadores, um de cada posição.
                </p>

                <h4 style={{ margin: "12px 0 6px" }}>Sorteio aleatório</h4>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <Input
                    id="quantidadeDeTimes"
                    label="Quantidade de times (opcional)"
                    type="number"
                    min="1"
                    placeholder="Máximo possível"
                    value={quantidadeDeTimes}
                    onChange={(e) => setQuantidadeDeTimes(e.target.value)}
                  />
                  <Button size="sm" onClick={handleSortear} disabled={ocupado || semTime.length < 5}>
                    Sortear times
                  </Button>
                </div>
                <p className="helper-text">
                  Se faltar aluno em alguma posição, o sistema avisa e você pode montar os times mesmo assim. Quem sobrar entra como reserva em algum time.
                </p>

                <h4 style={{ margin: "18px 0 6px" }}>Montar um time</h4>
                <form onSubmit={handleCriarTime}>
                  <Input
                    id="nomeDoTime"
                    label="Nome do time (opcional)"
                    placeholder="Ex: Time Azul"
                    maxLength={50}
                    value={nomeDoTime}
                    onChange={(e) => setNomeDoTime(e.target.value)}
                  />
                  <label style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0" }}>
                    <input type="checkbox" checked={modoLivre} onChange={(e) => setModoLivre(e.target.checked)} />
                    Modo livre (escolher de 5 a 8 alunos, sem exigir uma posição de cada)
                  </label>
                  {modoLivre &&
                    semTime.map((p) => (
                      <label key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "2px 0" }}>
                        <input
                          type="checkbox"
                          checked={selecionadosNoModoLivre.includes(p.alunoId)}
                          onChange={(e) =>
                            setSelecionadosNoModoLivre((atual) =>
                              e.target.checked ? [...atual, p.alunoId] : atual.filter((id) => id !== p.alunoId)
                            )
                          }
                        />
                        {p.nomeAluno} <span className="tag">{p.posicaoDeJogo}</span>
                      </label>
                    ))}
                  {!modoLivre && POSICOES.map((posicao) => (
                    <Select
                      key={posicao.value}
                      id={`posicao-${posicao.value}`}
                      label={posicao.label}
                      options={[
                        { value: "", label: `Escolha o ${posicao.label.toLowerCase()}` },
                        ...livresDaPosicao(posicao.label).map((p) => ({ value: p.alunoId, label: p.nomeAluno })),
                      ]}
                      value={escolhas[posicao.label] ?? ""}
                      onChange={(e) => setEscolhas((atual) => ({ ...atual, [posicao.label]: e.target.value }))}
                    />
                  ))}
                  <div style={{ marginTop: 12 }}>
                    <Button type="submit" disabled={ocupado}>
                      Criar time
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="card">
            <h3>
              <span className="dot" /> Times do campeonato
            </h3>
            {equipes.length === 0 ? (
              <p className="helper-text">Nenhum time criado ainda.</p>
            ) : (
              equipes.map((equipe) => (
                <div key={equipe.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{equipe.nome}</strong>
                    {!jogosGerados && (
                      <Button variant="outline" size="sm" onClick={() => handleRemoverTime(equipe)} disabled={ocupado || jogosGerados}>
                        Remover
                      </Button>
                    )}
                  </div>
                  <ul className="tag-list">
                    {equipe.jogadores.map((j) => (
                      <li key={j.alunoId}>
                        {j.nome} <span className="tag">{j.posicaoNome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            {semTime.length > 0 && equipes.length > 0 && (
              <p className="helper-text">Sem time: {semTime.map((p) => p.nomeAluno).join(", ")}.</p>
            )}
          </div>
        </div>
      )}

      {abaAtiva === "jogos" && (
        <div className="card">
          <h3>
            <span className="dot" /> Jogos (mata-mata)
          </h3>

          {!jogosGerados ? (
            <>
              <p className="helper-text">
                O sistema sorteia os confrontos entre os {equipes.length} time(s). Quem vence avança para a próxima fase; se o número de times não for
                potência de 2, alguns times avançam direto na primeira fase.
              </p>
              <Button onClick={handleGerarJogos} disabled={ocupado || equipes.length < 2}>
                Gerar jogos
              </Button>
              {equipes.length < 2 && <p className="helper-text">Crie ao menos 2 times na aba Times.</p>}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <Button variant="outline" size="sm" onClick={handleReiniciarJogos} disabled={ocupado || !!ranking?.finalizado}>
                  Refazer sorteio
                </Button>
              </div>
              {fases.map((fase) => (
                <div key={fase.nome} style={{ marginBottom: 18 }}>
                  <h4 style={{ marginBottom: 8 }}>{fase.nome}</h4>
                  <div className="table-scroll">
                    <table className="data-table">
                      <tbody>
                        {fase.jogos.map((jogo) => (
                          <tr key={jogo.id}>
                            <td style={{ width: "34%" }}>
                              <strong style={{ fontWeight: jogo.equipeVencedoraId && jogo.equipeVencedoraId === jogo.equipeAId ? 700 : 400 }}>
                                {jogo.equipeANome ?? "A definir"}
                              </strong>
                            </td>
                            <td style={{ textAlign: "center", width: 90 }}>
                              {jogo.bye ? "—" : jogo.status === "Aguardando" ? "x" : `${jogo.golsA} x ${jogo.golsB}`}
                            </td>
                            <td style={{ width: "34%" }}>
                              <strong style={{ fontWeight: jogo.equipeVencedoraId && jogo.equipeVencedoraId === jogo.equipeBId ? 700 : 400 }}>
                                {jogo.equipeBNome ?? (jogo.bye ? "(avança direto)" : "A definir")}
                              </strong>
                            </td>
                            <td>
                              <span className={`pill ${jogo.bye ? "pill--neutro" : CLASSE_STATUS[jogo.status]}`}>
                                {jogo.bye ? "Avançou direto" : ROTULO_STATUS[jogo.status]}
                              </span>
                            </td>
                            <td>
                              {!jogo.bye && jogo.status !== "Aguardando" && (
                                <Button variant="outline" size="sm" onClick={() => abrirJogo(jogo)}>
                                  {jogo.status === "Finalizado" ? "Ver estatísticas" : "Lançar estatísticas"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {abaAtiva === "ranking" && (
        <div className="card">
          <h3>
            <span className="dot" /> Ranking de alunos
          </h3>
          {ranking?.finalizado && (
            <p className="helper-text" style={{ color: "var(--green-ink)" }}>
              Campeonato encerrado. Time campeão: <strong>{ranking.campeaNome}</strong>.
            </p>
          )}
          {!ranking?.finalizado && (
            <p className="helper-text">O ranking é atualizado a cada jogo finalizado e fica definitivo quando a final termina.</p>
          )}
          {!ranking || ranking.itens.length === 0 ? (
            <p className="helper-text">Ainda não há alunos inscritos.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Aluno</th>
                    <th>Time</th>
                    <th style={{ textAlign: "center" }}>Jogos</th>
                    <th style={{ textAlign: "center" }}>Gols</th>
                    <th style={{ textAlign: "center" }}>Assist.</th>
                    <th style={{ textAlign: "center" }}>Passes</th>
                    <th style={{ textAlign: "center" }}>Desarmes</th>
                    <th style={{ textAlign: "center" }}>Defesas</th>
                    <th style={{ textAlign: "center" }}>Faltas</th>
                    <th style={{ textAlign: "center" }}>Cartões</th>
                    <th style={{ textAlign: "center" }}>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.itens.map((linha) => (
                    <tr key={linha.alunoId}>
                      <td>
                        <span className={`rank-badge${linha.colocacao <= 3 ? ` rank-${linha.colocacao}` : " rank-n"}`}>{linha.colocacao}</span>
                      </td>
                      <td>
                        {linha.nome} <span className="tag">{linha.posicaoNome}</span>
                      </td>
                      <td>{linha.equipeNome ?? "—"}</td>
                      <td style={{ textAlign: "center" }}>{linha.jogos}</td>
                      <td style={{ textAlign: "center" }}>{linha.gols}</td>
                      <td style={{ textAlign: "center" }}>{linha.assistencias}</td>
                      <td style={{ textAlign: "center" }}>{linha.passesCertos}</td>
                      <td style={{ textAlign: "center" }}>{linha.desarmes}</td>
                      <td style={{ textAlign: "center" }}>{linha.defesas}</td>
                      <td style={{ textAlign: "center" }}>{linha.faltas}</td>
                      <td style={{ textAlign: "center" }}>
                        {linha.cartoesAmarelos}A / {linha.cartoesVermelhos}V
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <strong>{Number(linha.pontos).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="helper-text">
            Pontuação: gol +5, assistência +3, passe certo +0,1, desarme +1, defesa +1, falta −1, cartão amarelo −2, cartão vermelho −5.
          </p>
        </div>
      )}

      <Modal
        open={!!jogoAberto}
        title={jogoAberto ? `${jogoAberto.nomeDaFase}: ${jogoAberto.equipeANome} x ${jogoAberto.equipeBNome}` : ""}
        onClose={fecharJogo}
        largura={980}
      >
        {!estatisticas && !erroEstatisticas && <Loading label="Carregando jogo..." />}
        {estatisticas && (
          <>
            <p style={{ fontSize: 22, textAlign: "center", margin: "0 0 4px" }}>
              <strong>
                {estatisticas.jogo.equipeANome} {somenteLeitura ? estatisticas.jogo.golsA : placarAoVivo.a} x {somenteLeitura ? estatisticas.jogo.golsB : placarAoVivo.b} {estatisticas.jogo.equipeBNome}
              </strong>
            </p>
            {!somenteLeitura && (
              <p className="helper-text" style={{ textAlign: "center", marginTop: 0 }}>
                O placar é a soma dos gols dos jogadores. Se terminar empatado, lance o gol de ouro (o próximo gol) antes de finalizar.
              </p>
            )}

            {[estatisticas.jogo.equipeAId, estatisticas.jogo.equipeBId].map((equipeId) => (
              <div key={equipeId} style={{ marginBottom: 14 }}>
                <h4 style={{ margin: "8px 0" }}>{equipeId === estatisticas.jogo.equipeAId ? estatisticas.jogo.equipeANome : estatisticas.jogo.equipeBNome}</h4>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Jogador</th>
                        {CAMPOS_ESTATISTICA.map((campo) => (
                          <th key={campo.chave} style={{ textAlign: "center" }}>
                            {campo.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {estatisticas.jogadores
                        .filter((j) => j.equipeId === equipeId)
                        .map((j) => (
                          <tr key={j.alunoId}>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {j.nome} <span className="tag">{j.posicaoNome}</span>
                            </td>
                            {CAMPOS_ESTATISTICA.map((campo) => (
                              <td key={campo.chave} style={{ width: 70 }}>
                                {campo.chave === "defesas" && j.posicaoNome !== "Goleiro" ? (
                                  <span style={{ display: "block", textAlign: "center" }}>—</span>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    style={{ width: 64 }}
                                    disabled={somenteLeitura}
                                    value={j[campo.chave]}
                                    onChange={(e) => alterarEstatistica(j.alunoId, campo.chave, e.target.value)}
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}
        {erroEstatisticas && (
          <p className="helper-text" style={{ color: "var(--red-ink)" }}>
            {erroEstatisticas}
          </p>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <Button variant="outline" onClick={fecharJogo}>
            Fechar
          </Button>
          {estatisticas && !somenteLeitura && (
            <>
              <Button variant="outline" onClick={() => handleSalvarEstatisticas(false)} disabled={ocupado}>
                Salvar
              </Button>
              <Button onClick={() => handleSalvarEstatisticas(true)} disabled={ocupado}>
                Salvar e finalizar jogo
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
