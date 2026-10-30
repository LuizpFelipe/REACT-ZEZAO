import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Loading from "@shared/components/Loading/Loading";
import Modal from "@shared/components/Modal/Modal";
import Select from "@shared/components/Select/Select";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import { listarAlunos, atualizarDadosDoAluno, atualizarPosicaoDoAluno } from "../services/alunoService";
import { POSICOES } from "../models/Posicao";
import { formatarCpf, validarCpfDoResponsavel } from "@shared/utils/cpf";
import { formatarTelefone, validarTelefone } from "@shared/utils/telefone";
import { listarTurmas } from "@features/turma/services/turmaService";
import { registrarRemanejamento } from "@features/reposicao/services/reposicaoService";
import {
  gerarOcorrenciasDoMes,
  mesmoDiaOuAntes,
  paraIsoData,
  formatarDataHora,
} from "@features/reposicao/utils/aulasMes";
import "@shared/shared.css";

const HORAS_MINIMAS_AVISO = 24;

const NIVEIS_TECNICOS = [
  { value: "Iniciante", label: "Iniciante" },
  { value: "Intermediario", label: "Intermediário" },
  { value: "Avancado", label: "Avançado" },
];

function iniciais(nome) {
  return (nome || "")
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [busca, setBusca] = useState("");
  const [turmaFiltro, setTurmaFiltro] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [mensagem, setMensagem] = useState(null);

  const [alunoRemanejando, setAlunoRemanejando] = useState(null);
  const [aulaPerdida, setAulaPerdida] = useState("");
  const [destino, setDestino] = useState("");
  const [enviandoRemanejamento, setEnviandoRemanejamento] = useState(false);
  const [erroModal, setErroModal] = useState("");

  const [alunoEditando, setAlunoEditando] = useState(null);
  const [formularioDeEdicao, setFormularioDeEdicao] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState("");

  const agora = useMemo(() => new Date(), []);
  const limiteAviso = useMemo(() => new Date(agora.getTime() + HORAS_MINIMAS_AVISO * 60 * 60 * 1000), [agora]);
  const ano = agora.getFullYear();
  const mes = agora.getMonth();

  useEffect(() => {
    let ativo = true;

    Promise.all([listarAlunos(), listarTurmas()])
      .then(([alunosApi, turmasApi]) => {
        if (!ativo) return;
        setAlunos(alunosApi);
        setTurmas(turmasApi);
      })
      .catch((err) => {
        if (ativo) setErroCarregamento(err.message || "Não foi possível conectar à API.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  function nomeTurma(turmaId) {
    return turmas.find((t) => t.id === turmaId)?.nome ?? "—";
  }

  const alunosFiltrados = alunos.filter((aluno) => {
    const bateTurma = turmaFiltro === "todas" || aluno.turmaId === turmaFiltro;
    const bateBusca = aluno.nome.toLowerCase().includes(busca.toLowerCase());
    return bateTurma && bateBusca;
  });

  const turmaSelecionada = turmas.find((t) => t.id === turmaFiltro);
  const totalInadimplentes = alunosFiltrados.filter((a) => a.status === "Inadimplente").length;

  const opcoesTurmaFiltro = [
    { value: "todas", label: "Todas as turmas" },
    ...turmas.map((t) => ({ value: t.id, label: `${t.nome} — ${t.diasLegiveis} ${t.horario}` })),
  ];

  const turmaOrigemRemanejando = turmas.find((t) => t.id === alunoRemanejando?.turmaId);

  const ocorrenciasPassadas = useMemo(() => {
    if (!turmaOrigemRemanejando) return [];
    return gerarOcorrenciasDoMes(turmaOrigemRemanejando, ano, mes).filter((data) => mesmoDiaOuAntes(data, agora));
  }, [turmaOrigemRemanejando, ano, mes, agora]);

  const destinosDisponiveis = useMemo(() => {
    if (!turmaOrigemRemanejando) return [];
    const turmasMesmaCategoria = turmas.filter(
      (t) => t.categoriaId === turmaOrigemRemanejando.categoriaId && t.id !== turmaOrigemRemanejando.id
    );
    const todos = turmasMesmaCategoria.flatMap((turma) =>
      gerarOcorrenciasDoMes(turma, ano, mes)
        .filter((data) => data >= limiteAviso)
        .map((data) => ({ turma, data }))
    );
    return todos.sort((a, b) => a.data - b.data);
  }, [turmaOrigemRemanejando, turmas, ano, mes, limiteAviso]);

  function abrirRemanejamento(aluno) {
    setAlunoRemanejando(aluno);
    setAulaPerdida("");
    setDestino("");
    setErroModal("");
  }

  function fecharModal() {
    setAlunoRemanejando(null);
  }

  function abrirEdicaoDoAluno(aluno) {
    setAlunoEditando(aluno);
    setFormularioDeEdicao({
      nome: aluno.nome,
      nivel: aluno.nivel,
      posicao: aluno.posicao ?? "",
      responsavelNome: aluno.responsavelNome,
      responsavelCpf: formatarCpf(aluno.responsavelCpf),
      telefone: formatarTelefone(aluno.telefone),
      endereco: aluno.endereco ?? "",
    });
    setErroEdicao("");
  }

  function fecharEdicaoDoAluno() {
    setAlunoEditando(null);
    setFormularioDeEdicao(null);
  }

  function alterarCampoDaEdicao(campo, valor) {
    setFormularioDeEdicao((anterior) => ({ ...anterior, [campo]: valor }));
    setErroEdicao("");
  }

  function validarEdicaoDoAluno(formulario) {
    if (formulario.nome.trim().length < 3) return "Informe o nome completo do aluno.";
    if (!formulario.responsavelNome.trim()) return "Informe o nome do responsável.";
    const mensagemDoCpf = validarCpfDoResponsavel(formulario.responsavelCpf);
    if (mensagemDoCpf) return mensagemDoCpf;
    const mensagemDoTelefone = validarTelefone(formulario.telefone);
    if (mensagemDoTelefone) return mensagemDoTelefone;
    if (!formulario.endereco.trim()) return "Informe o endereço.";
    return null;
  }

  async function alterarPosicao(aluno, valor) {
    try {
      await atualizarPosicaoDoAluno(aluno, Number(valor));
      setAlunos(await listarAlunos());
      setMensagem({ tipo: "sucesso", texto: `Posição de ${aluno.nome} atualizada.` });
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível atualizar a posição." });
    }
  }

  async function confirmarEdicaoDoAluno(event) {
    event.preventDefault();
    const mensagemDeErro = validarEdicaoDoAluno(formularioDeEdicao);
    if (mensagemDeErro) {
      setErroEdicao(mensagemDeErro);
      return;
    }

    setSalvandoEdicao(true);
    try {
      await atualizarDadosDoAluno(alunoEditando, {
        nome: formularioDeEdicao.nome.trim(),
        nivel: formularioDeEdicao.nivel,
        posicao: formularioDeEdicao.posicao === "" ? undefined : Number(formularioDeEdicao.posicao),
        responsavelNome: formularioDeEdicao.responsavelNome.trim(),
        responsavelCpf: formularioDeEdicao.responsavelCpf,
        telefone: formularioDeEdicao.telefone,
        endereco: formularioDeEdicao.endereco.trim(),
      });
      setAlunos(await listarAlunos());
      setMensagem({ tipo: "sucesso", texto: `Cadastro de ${formularioDeEdicao.nome.trim()} atualizado.` });
      fecharEdicaoDoAluno();
    } catch (err) {
      setErroEdicao(err.message || "Não foi possível atualizar o cadastro.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function confirmarRemanejamento(event) {
    event.preventDefault();
    setErroModal("");

    if (!aulaPerdida || !destino) {
      setErroModal("Selecione a aula perdida e a aula de reposição.");
      return;
    }

    const [turmaDestinoId] = destino.split("__");
    const ocorrenciaDestino = destinosDisponiveis.find((o) => `${o.turma.id}__${o.data.toISOString()}` === destino);

    if (!ocorrenciaDestino || ocorrenciaDestino.data < limiteAviso) {
      setErroModal(`A reposição precisa ser marcada com pelo menos ${HORAS_MINIMAS_AVISO}h de antecedência.`);
      return;
    }

    setEnviandoRemanejamento(true);
    try {
      await registrarRemanejamento({
        alunoId: alunoRemanejando.id,
        turmaOrigemId: alunoRemanejando.turmaId,
        turmaDestinoId,
        dataOriginal: aulaPerdida,
        dataReposicao: paraIsoData(ocorrenciaDestino.data),
      });
      setMensagem({
        tipo: "sucesso",
        texto: `Reposição de ${alunoRemanejando.nome} registrada com sucesso.`,
      });
      fecharModal();
    } catch (err) {
      setErroModal(err.message || "Não foi possível registrar a reposição.");
    } finally {
      setEnviandoRemanejamento(false);
    }
  }

  return (
    <div className="card">
      <h3>
        <span className="dot" /> Alunos por Turma (Chamada)
      </h3>

      <div className="table-toolbar">
        <Select
          id="turmaFiltro"
          label="Turma"
          options={opcoesTurmaFiltro}
          value={turmaFiltro}
          onChange={(e) => setTurmaFiltro(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <Input
          id="buscaAluno"
          label="Buscar aluno"
          placeholder="Nome do aluno..."
          className="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {turmaSelecionada && (
        <div className="notice" style={{ marginTop: 0, marginBottom: 16 }}>
          <div>
            <b>{turmaSelecionada.nome}</b> · {turmaSelecionada.diasLegiveis} {turmaSelecionada.horario}
            {" — "}
            <b>{alunosFiltrados.length}</b> aluno(s) matriculado(s)
            {totalInadimplentes > 0 && (
              <>
                {" · "}
                <b>{totalInadimplentes}</b> inadimplente(s)
              </>
            )}
          </div>
        </div>
      )}

      {erroCarregamento && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erroCarregamento}
        </p>
      )}

      {mensagem && (
        <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
          {mensagem.texto}
        </p>
      )}

      {carregando ? (
        <Loading label="Carregando alunos..." />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Aluno</th>
                {turmaFiltro === "todas" && <th>Turma</th>}
                <th>Nível</th>
                <th>Posição</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td>
                    <div className="aluno-cell">
                      <div className="avatar">{iniciais(aluno.nome)}</div>
                      <span className={aluno.status === "Inadimplente" ? "name-flag" : ""}>
                        {aluno.status === "Inadimplente" && <span className="flag-dot" />}
                        {aluno.nome}
                      </span>
                      {!aluno.responsavelCpf && <span className="pill pill--warn">CPF pendente</span>}
                    </div>
                  </td>
                  {turmaFiltro === "todas" && <td>{nomeTurma(aluno.turmaId)}</td>}
                  <td>{aluno.nivel}</td>
                  <td>
                    <select value={aluno.posicao ?? ""} onChange={(e) => alterarPosicao(aluno, e.target.value)}>
                      {aluno.posicao === null && <option value="">Definir…</option>}
                      {POSICOES.map((posicao) => (
                        <option key={posicao.value} value={posicao.value}>
                          {posicao.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <StatusBadge status={aluno.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button variant="outline" size="sm" onClick={() => abrirRemanejamento(aluno)}>
                        Repor Aula
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => abrirEdicaoDoAluno(aluno)}>
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {alunosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={turmaFiltro === "todas" ? 6 : 5} className="helper-text">
                    Nenhum aluno encontrado para esse filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!alunoEditando} title="Editar aluno" onClose={fecharEdicaoDoAluno}>
        {alunoEditando && formularioDeEdicao && (
          <form onSubmit={confirmarEdicaoDoAluno}>
            <div className="form-row full">
              <Input
                id="editarNome"
                label="Nome do aluno"
                value={formularioDeEdicao.nome}
                onChange={(e) => alterarCampoDaEdicao("nome", e.target.value)}
              />
            </div>
            <div className="form-row">
              <Select
                id="editarNivel"
                label="Nível técnico"
                options={NIVEIS_TECNICOS}
                value={formularioDeEdicao.nivel}
                onChange={(e) => alterarCampoDaEdicao("nivel", e.target.value)}
              />
              <Select
                id="editarPosicao"
                label="Posição"
                options={[
                  ...(formularioDeEdicao.posicao === "" ? [{ value: "", label: "Definir…" }] : []),
                  ...POSICOES,
                ]}
                value={formularioDeEdicao.posicao}
                onChange={(e) => alterarCampoDaEdicao("posicao", e.target.value)}
              />
            </div>
            <div className="form-row">
              <Input
                id="editarResponsavelNome"
                label="Nome do responsável"
                value={formularioDeEdicao.responsavelNome}
                onChange={(e) => alterarCampoDaEdicao("responsavelNome", e.target.value)}
              />
              <Input
                id="editarResponsavelCpf"
                label="CPF do responsável"
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                value={formularioDeEdicao.responsavelCpf}
                onChange={(e) => alterarCampoDaEdicao("responsavelCpf", formatarCpf(e.target.value))}
              />
            </div>
            <div className="form-row full">
              <Input
                id="editarTelefone"
                label="Telefone do responsável (recebe as cobranças)"
                placeholder="(44) 99999-0000"
                inputMode="tel"
                maxLength={15}
                value={formularioDeEdicao.telefone}
                onChange={(e) => alterarCampoDaEdicao("telefone", formatarTelefone(e.target.value))}
              />
            </div>
            <div className="form-row full">
              <Input
                id="editarEndereco"
                label="Endereço"
                value={formularioDeEdicao.endereco}
                onChange={(e) => alterarCampoDaEdicao("endereco", e.target.value)}
              />
            </div>
            <p className="helper-text">
              Data de nascimento e turma não mudam aqui, porque definem a categoria do aluno.
            </p>
            {erroEdicao && (
              <p className="helper-text" style={{ color: "var(--red-ink)" }} role="alert">
                {erroEdicao}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={fecharEdicaoDoAluno}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvandoEdicao}>
                {salvandoEdicao ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!alunoRemanejando} title="Repor Aula" onClose={fecharModal}>
        {alunoRemanejando && (
          <form onSubmit={confirmarRemanejamento}>
            <p className="helper-text" style={{ marginTop: 0 }}>
              {alunoRemanejando.nome} · Turma atual: <b>{nomeTurma(alunoRemanejando.turmaId)}</b>
              {turmaOrigemRemanejando
                ? ` (${turmaOrigemRemanejando.diasLegiveis} ${turmaOrigemRemanejando.horario})`
                : ""}
            </p>

            <div className="notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FB6C9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <div>
                Pode remarcar para outra turma da mesma categoria, dentro do mesmo mês da aula perdida,
                com pelo menos {HORAS_MINIMAS_AVISO}h de antecedência.
              </div>
            </div>

            <div className="form-row full">
              <Select
                id="aulaPerdida"
                label="Aula perdida (dias já dados este mês)"
                options={ocorrenciasPassadas.map((data) => ({
                  value: paraIsoData(data),
                  label: formatarDataHora(data),
                }))}
                value={aulaPerdida}
                onChange={(e) => setAulaPerdida(e.target.value)}
                disabled={ocorrenciasPassadas.length === 0}
              />
            </div>
            {ocorrenciasPassadas.length === 0 && (
              <p className="helper-text">Essa turma ainda não teve nenhuma aula este mês.</p>
            )}

            <div className="form-row full">
              <Select
                id="destino"
                label="Remarcar para"
                options={destinosDisponiveis.map((o) => ({
                  value: `${o.turma.id}__${o.data.toISOString()}`,
                  label: `${formatarDataHora(o.data)} — ${o.turma.nome}`,
                }))}
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                disabled={!aulaPerdida || destinosDisponiveis.length === 0}
              />
            </div>
            {aulaPerdida && destinosDisponiveis.length === 0 && (
              <p className="helper-text">
                Não há outra turma da mesma categoria com aula daqui a mais de {HORAS_MINIMAS_AVISO}h
                dentro deste mês.
              </p>
            )}

            {erroModal && (
              <p className="helper-text" style={{ color: "var(--red-ink)" }}>
                {erroModal}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviandoRemanejamento}>
                {enviandoRemanejamento ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
