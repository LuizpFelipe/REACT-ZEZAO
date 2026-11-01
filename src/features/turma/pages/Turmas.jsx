import { useEffect, useState } from "react";
import Modal from "@shared/components/Modal/Modal";
import Input from "@shared/components/Input/Input";
import Select from "@shared/components/Select/Select";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import { listarTurmas, criarTurma, atualizarTurma, removerTurma, inativarTurma, reativarTurma } from "../services/turmaService";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { listarProfessores } from "@features/professor/services/professorService";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { DIAS_DA_SEMANA, converterDiasParaLista, formatarListaDeDias } from "../models/Turma";
import "@shared/shared.css";

const FORM_INICIAL = { nome: "", diasSelecionados: [], horario: "", categoriaId: "", professorId: "" };

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [turmaInativando, setTurmaInativando] = useState(null);
  const [turmaDestinoId, setTurmaDestinoId] = useState("");
  const [inativando, setInativando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalInativasAberto, setModalInativasAberto] = useState(false);
  const [reativandoId, setReativandoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    setCarregando(true);
    Promise.all([listarTurmas(), listarCategorias(), listarProfessores(), listarAlunos().catch(() => [])])
      .then(([turmasApi, categoriasApi, professoresApi, alunosApi]) => {
        setTurmas(turmasApi);
        setCategorias(categoriasApi);
        setProfessores(professoresApi);
        setAlunos(alunosApi);
      })
      .catch((err) => setErro(err.message || "Não foi possível carregar os dados."))
      .finally(() => setCarregando(false));
  }

  function nomeCategoria(id) {
    return categorias.find((c) => c.id === id)?.nome ?? "—";
  }

  function nomeProfessor(id) {
    return professores.find((p) => p.id === id)?.nome ?? "—";
  }

  function abrirNova() {
    setEditandoId(null);
    setForm({
      ...FORM_INICIAL,
      categoriaId: categorias[0]?.id ?? "",
      professorId: professores[0]?.id ?? "",
    });
    setErroModal("");
    setModalAberto(true);
  }

  function abrirEdicao(turma) {
    setEditandoId(turma.id);
    setForm({
      nome: turma.nome,
      diasSelecionados: converterDiasParaLista(turma.diasSemana),
      horario: turma.horario,
      categoriaId: turma.categoriaId,
      professorId: turma.professorId,
    });
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  function alternarDia(dia) {
    setForm((atual) => ({
      ...atual,
      diasSelecionados: atual.diasSelecionados.includes(dia)
        ? atual.diasSelecionados.filter((diaSelecionado) => diaSelecionado !== dia)
        : [...atual.diasSelecionados, dia],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroModal("");

    if (!form.nome || !form.horario || !form.categoriaId || !form.professorId) {
      setErroModal("Preencha todos os campos.");
      return;
    }

    if (form.diasSelecionados.length === 0) {
      setErroModal("Marque pelo menos um dia da semana.");
      return;
    }

    const dadosDaTurma = {
      nome: form.nome,
      diasSemana: formatarListaDeDias(form.diasSelecionados),
      horario: form.horario,
      categoriaId: form.categoriaId,
      professorId: form.professorId,
    };

    setEnviando(true);
    try {
      if (editandoId) {
        await atualizarTurma(editandoId, dadosDaTurma);
        setMensagem({ tipo: "sucesso", texto: "Turma atualizada com sucesso." });
      } else {
        await criarTurma(dadosDaTurma);
        setMensagem({ tipo: "sucesso", texto: "Turma criada com sucesso." });
      }
      fecharModal();
      carregar();
    } catch (err) {
      setErroModal(err.message || "Não foi possível salvar a turma.");
    } finally {
      setEnviando(false);
    }
  }

  function contarAlunosAtivos(turmaId) {
    return alunos.filter((aluno) => aluno.turmaId === turmaId && aluno.status !== "Inativo").length;
  }

  function destinosPossiveis(turma) {
    return turmas.filter((t) => t.ativa && t.id !== turma.id && t.categoriaId === turma.categoriaId);
  }

  async function executarInativacao(turma, destinoId) {
    setInativando(true);
    try {
      await inativarTurma(turma.id, destinoId || null);
      setMensagem({ tipo: "sucesso", texto: `Turma "${turma.nome}" inativada.` });
      setTurmaInativando(null);
      carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível inativar a turma." });
      setTurmaInativando(null);
    } finally {
      setInativando(false);
    }
  }

  function handleInativar(turma) {
    if (contarAlunosAtivos(turma.id) > 0) {
      const destinos = destinosPossiveis(turma);
      setTurmaDestinoId(destinos[0]?.id ?? "");
      setTurmaInativando(turma);
      return;
    }
    if (!window.confirm(`Inativar a turma "${turma.nome}"? Ela deixa de aparecer na chamada e em novas matrículas, mas o histórico é mantido.`)) return;
    executarInativacao(turma, null);
  }

  async function handleReativar(turma) {
    setReativandoId(turma.id);
    try {
      await reativarTurma(turma.id);
      setMensagem({ tipo: "sucesso", texto: `Turma "${turma.nome}" reativada.` });
      setModalInativasAberto(false);
      carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível reativar a turma." });
      setModalInativasAberto(false);
    } finally {
      setReativandoId(null);
    }
  }

  async function handleRemover(turma) {
    if (!window.confirm(`Remover a turma "${turma.nome}"?`)) return;
    try {
      await removerTurma(turma.id);
      setMensagem({ tipo: "sucesso", texto: "Turma removida." });
      carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível remover a turma." });
    }
  }

  const turmasAtivas = turmas.filter((turma) => turma.ativa);
  const turmasInativas = turmas.filter((turma) => !turma.ativa);

  const opcoesCategoria = categorias.map((c) => ({ value: c.id, label: c.nome }));
  const opcoesProfessor = professores.map((p) => ({ value: p.id, label: p.nome }));

  return (
    <div className="card">
      <div className="table-toolbar">
        <h3 style={{ margin: 0 }}>
          <span className="dot" /> Turmas
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="outline" size="sm" onClick={() => setModalInativasAberto(true)} disabled={turmasInativas.length === 0}>
            Turmas inativas ({turmasInativas.length})
          </Button>
          <Button size="sm" onClick={abrirNova} disabled={categorias.length === 0 || professores.length === 0}>
            Nova Turma
          </Button>
        </div>
      </div>

      {(categorias.length === 0 || professores.length === 0) && !carregando && (
        <p className="helper-text" style={{ color: "var(--amber-ink)" }}>
          É preciso ter pelo menos uma categoria e um professor cadastrados antes de criar uma turma.
        </p>
      )}

      {erro && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="helper-text" style={{ color: mensagem.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
          {mensagem.texto}
        </p>
      )}

      {carregando ? (
        <Loading label="Carregando turmas..." />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Horário</th>
                <th>Categoria</th>
                <th>Professor</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {turmasAtivas.map((turma) => (
                <tr key={turma.id}>
                  <td>{turma.nome}</td>
                  <td className="mono">
                    {turma.diasLegiveis} {turma.horario}
                  </td>
                  <td>{nomeCategoria(turma.categoriaId)}</td>
                  <td>{nomeProfessor(turma.professorId)}</td>
                  <td>
                    <div className="acoes-da-linha">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(turma)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleInativar(turma)}>
                      Inativar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemover(turma)}>
                      Remover
                    </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {turmasAtivas.length === 0 && (
                <tr>
                  <td colSpan={5} className="helper-text">
                    Nenhuma turma cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(turmaInativando)} title="Inativar turma" onClose={() => setTurmaInativando(null)}>
        {turmaInativando && (
          <>
            <p className="helper-text">
              A turma <b>{turmaInativando.nome}</b> ainda tem <b>{contarAlunosAtivos(turmaInativando.id)}</b> aluno(s) ativo(s).
              Escolha a turma da mesma categoria que vai recebê-los. Contratos e histórico são mantidos.
            </p>
            {destinosPossiveis(turmaInativando).length === 0 ? (
              <p className="helper-text" style={{ color: "var(--amber-ink)" }}>
                Não há outra turma ativa nesta categoria. Crie uma antes de inativar esta.
              </p>
            ) : (
              <Select
                id="turmaDestinoId"
                label="Transferir alunos para"
                options={destinosPossiveis(turmaInativando).map((t) => ({
                  value: t.id,
                  label: `${t.nome} — ${t.diasLegiveis} ${t.horario}`,
                }))}
                value={turmaDestinoId}
                onChange={(e) => setTurmaDestinoId(e.target.value)}
              />
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => setTurmaInativando(null)}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={inativando || !turmaDestinoId}
                onClick={() => executarInativacao(turmaInativando, turmaDestinoId)}
              >
                {inativando ? "Inativando..." : "Transferir e inativar"}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={modalInativasAberto} title="Turmas inativas" onClose={() => setModalInativasAberto(false)}>
        {turmasInativas.length === 0 ? (
          <p className="helper-text">Nenhuma turma inativa.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Horário</th>
                  <th>Categoria</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {turmasInativas.map((turma) => (
                  <tr key={turma.id}>
                    <td>{turma.nome}</td>
                    <td className="mono">
                      {turma.diasLegiveis} {turma.horario}
                    </td>
                    <td>{nomeCategoria(turma.categoriaId)}</td>
                    <td>
                      <Button size="sm" onClick={() => handleReativar(turma)} disabled={reativandoId === turma.id}>
                        {reativandoId === turma.id ? "Reativando..." : "Reativar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal open={modalAberto} title={editandoId ? "Editar Turma" : "Nova Turma"} onClose={fecharModal}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              id="nome"
              label="Nome da turma"
              placeholder="Ex: Turma A"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
            <Input
              id="horario"
              label="Horário"
              placeholder="Ex: 17h"
              value={form.horario}
              onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
            />
          </div>
          <div className="form-row full">
            <div>
              <label>Dias da semana</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 6 }}>
                {DIAS_DA_SEMANA.map((dia) => (
                  <label key={dia} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.diasSelecionados.includes(dia)}
                      onChange={() => alternarDia(dia)}
                      style={{ width: "auto" }}
                    />
                    {dia}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="form-row">
            <Select
              id="categoriaId"
              label="Categoria"
              options={opcoesCategoria}
              value={form.categoriaId}
              onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
            />
            <Select
              id="professorId"
              label="Professor"
              options={opcoesProfessor}
              value={form.professorId}
              onChange={(e) => setForm((f) => ({ ...f, professorId: e.target.value }))}
            />
          </div>

          {erroModal && (
            <p className="helper-text" style={{ color: "var(--red-ink)" }}>
              {erroModal}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Button type="button" variant="outline" onClick={fecharModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
