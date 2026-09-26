import { useEffect, useState } from "react";
import Modal from "@shared/components/Modal/Modal";
import Input from "@shared/components/Input/Input";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import {
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
} from "../services/categoriaService";
import "@shared/shared.css";

const FORM_INICIAL = { nome: "", idadeMin: "", idadeMax: "" };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    setCarregando(true);
    listarCategorias()
      .then(setCategorias)
      .catch((err) => setErro(err.message || "Não foi possível carregar as categorias."))
      .finally(() => setCarregando(false));
  }

  function abrirNova() {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setErroModal("");
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setEditandoId(categoria.id);
    setForm({ nome: categoria.nome, idadeMin: String(categoria.idadeMin), idadeMax: String(categoria.idadeMax) });
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroModal("");

    const idadeMin = Number(form.idadeMin);
    const idadeMax = Number(form.idadeMax);
    if (!form.nome || Number.isNaN(idadeMin) || Number.isNaN(idadeMax)) {
      setErroModal("Preencha nome, idade mínima e idade máxima corretamente.");
      return;
    }

    setEnviando(true);
    try {
      if (editandoId) {
        await atualizarCategoria(editandoId, { nome: form.nome, idadeMin, idadeMax });
        setMensagem({ tipo: "sucesso", texto: "Categoria atualizada com sucesso." });
      } else {
        await criarCategoria({ nome: form.nome, idadeMin, idadeMax });
        setMensagem({ tipo: "sucesso", texto: "Categoria criada com sucesso." });
      }
      fecharModal();
      carregar();
    } catch (err) {
      setErroModal(err.message || "Não foi possível salvar a categoria.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemover(categoria) {
    if (!window.confirm(`Remover a categoria "${categoria.nome}"?`)) return;
    try {
      await removerCategoria(categoria.id);
      setMensagem({ tipo: "sucesso", texto: "Categoria removida." });
      carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível remover a categoria." });
    }
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        <h3 style={{ margin: 0 }}>
          <span className="dot" /> Categorias
        </h3>
        <Button size="sm" onClick={abrirNova}>
          Nova Categoria
        </Button>
      </div>

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
        <Loading label="Carregando categorias..." />
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Faixa etária</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.nome}</td>
                  <td>
                    {cat.idadeMin === cat.idadeMax ? `${cat.idadeMin} anos` : `${cat.idadeMin}–${cat.idadeMax} anos`}
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(cat)}>
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRemover(cat)}>
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={3} className="helper-text">
                    Nenhuma categoria cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} title={editandoId ? "Editar Categoria" : "Nova Categoria"} onClose={fecharModal}>
        <form onSubmit={handleSubmit}>
          <div className="form-row full">
            <Input
              id="nome"
              label="Nome"
              placeholder="Ex: Sub-13"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <Input
              id="idadeMin"
              label="Idade mínima"
              placeholder="Ex: 12"
              value={form.idadeMin}
              onChange={(e) => setForm((f) => ({ ...f, idadeMin: e.target.value }))}
            />
            <Input
              id="idadeMax"
              label="Idade máxima"
              placeholder="Ex: 12"
              value={form.idadeMax}
              onChange={(e) => setForm((f) => ({ ...f, idadeMax: e.target.value }))}
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
