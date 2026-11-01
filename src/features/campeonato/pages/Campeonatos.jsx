import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "@shared/components/Loading/Loading";
import Modal from "@shared/components/Modal/Modal";
import Input from "@shared/components/Input/Input";
import Select from "@shared/components/Select/Select";
import Button from "@shared/components/Button/Button";
import { listarCategorias } from "@features/categoria/services/categoriaService";
import { listarCampeonatos, criarCampeonato, atualizarCampeonato, removerCampeonato } from "../services/campeonatoService";
import { estadoCampeonato } from "../models/Campeonato";
import "@shared/shared.css";

const FORM_INICIAL = { nome: "", categoriaId: "", data: "" };

export default function Campeonatos() {
  const navigate = useNavigate();

  const [campeonatos, setCampeonatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erroModal, setErroModal] = useState("");
  const [campeonatoEditandoId, setCampeonatoEditandoId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const listaCategorias = await listarCategorias();
      setCategorias(listaCategorias);

      try {
        const lista = await listarCampeonatos();
        setCampeonatos(lista);
      } catch {
        setCampeonatos([]);
      }
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  function nomeCategoria(id) {
    return categorias.find((c) => c.id === id)?.nome ?? "—";
  }

  function abrirEdicao(campeonato) {
    setCampeonatoEditandoId(campeonato.id);
    setForm({ nome: campeonato.nome, categoriaId: campeonato.categoriaId, data: (campeonato.data ?? "").split("T")[0] });
    setErroModal("");
    setModalAberto(true);
  }

  async function handleExcluir(campeonato) {
    const confirmado = window.confirm(
      `Excluir o campeonato "${campeonato.nome}"? Inscrições, times, jogos e estatísticas dele também serão apagados.`
    );
    if (!confirmado) return;
    setFeedback(null);
    try {
      await removerCampeonato(campeonato.id);
      setFeedback({ tipo: "ok", texto: "Campeonato excluído." });
      carregar();
    } catch (err) {
      setFeedback({ tipo: "erro", texto: err.message || "Não foi possível excluir o campeonato." });
    }
  }

  function abrirNovo() {
    setCampeonatoEditandoId(null);
    setForm({ ...FORM_INICIAL, categoriaId: categorias[0]?.id ?? "" });
    setErroModal("");
    setModalAberto(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroModal("");

    if (!form.nome || !form.categoriaId || !form.data) {
      setErroModal("Preencha todos os campos.");
      return;
    }

    setEnviando(true);
    try {
      if (campeonatoEditandoId) {
        await atualizarCampeonato(campeonatoEditandoId, form);
        setFeedback({ tipo: "ok", texto: "Campeonato atualizado." });
      } else {
        await criarCampeonato(form);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErroModal(err.message || "Não foi possível salvar o campeonato.");
    } finally {
      setEnviando(false);
    }
  }

  const opcoesCategoria = categorias.map((c) => ({ value: c.id, label: c.nome }));

  if (carregando) {
    return <Loading label="Carregando campeonatos..." />;
  }

  return (
    <>
      <div className="coord-title-block">
        <div className="coord-eyebrow">Competições</div>
        <h1 className="coord-title">Campeonatos</h1>
      </div>

      {erro && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {erro}
        </p>
      )}

      {feedback && (
        <p className="helper-text" role={feedback.tipo === "erro" ? "alert" : "status"} style={{ color: feedback.tipo === "erro" ? "var(--red-ink)" : "var(--green-ink)" }}>
          {feedback.texto}
        </p>
      )}

      <div className="card">
        <div className="table-toolbar">
          <h3 style={{ margin: 0 }}>
            <span className="dot" /> Campeonatos cadastrados
          </h3>
          <Button size="sm" onClick={abrirNovo} disabled={categorias.length === 0}>
            + Novo Campeonato
          </Button>
        </div>

        {campeonatos.length === 0 ? (
          <p className="helper-text">Nenhum campeonato cadastrado ainda.</p>
        ) : (
          campeonatos.map((camp) => {
            const estado = estadoCampeonato(camp.data);
            return (
              <div className="camp-row" key={camp.id}>
                <div className="camp-info">
                  <div>
                    <div className="camp-name">{camp.nome}</div>
                    <div className="camp-meta">
                      {nomeCategoria(camp.categoriaId)} · {camp.data?.split("-").reverse().join("/")}
                    </div>
                  </div>
                </div>
                <div className="camp-actions">
                  <span className={`pill pill--${estado === "Realizado" ? "ok" : "warn"}`}>{estado}</span>
                  <Button variant="outline" size="sm" onClick={() => navigate(camp.id)}>
                    Ver
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => abrirEdicao(camp)}>
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExcluir(camp)}>
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal open={modalAberto} title={campeonatoEditandoId ? "Editar Campeonato" : "Novo Campeonato"} onClose={() => setModalAberto(false)}>
        <form onSubmit={handleSubmit}>
          <div className="form-row full">
            <Input
              id="nome"
              label="Nome do campeonato"
              placeholder="Ex: Copa Zezão 2026"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <Select
              id="categoriaId"
              label="Categoria"
              options={opcoesCategoria}
              value={form.categoriaId}
              onChange={(e) => setForm((f) => ({ ...f, categoriaId: e.target.value }))}
            />
            <Input
              id="data"
              type="date"
              label="Data"
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
            />
          </div>

          {erroModal && (
            <p className="helper-text" style={{ color: "var(--red-ink)" }}>
              {erroModal}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
