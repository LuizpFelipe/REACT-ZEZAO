import { useEffect, useMemo, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import Select from "@shared/components/Select/Select";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { baixarContratoPdf, cancelarContrato, listarContratos } from "../services/contratoService";
import { converterDataIsoParaBr } from "@shared/utils/data";
import "@shared/shared.css";

function formatarMoeda(valor) {
  const numero = Number(valor);
  if (valor === null || valor === undefined || Number.isNaN(numero)) return "—";
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const OPCOES_STATUS = [
  { value: "", label: "Todos os contratos" },
  { value: "Ativo", label: "Em aberto (ativos)" },
  { value: "Encerrado", label: "Encerrados" },
  { value: "Cancelado", label: "Cancelados" },
  { value: "Renovado", label: "Renovados" },
];

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [avisoDoContrato, setAvisoDoContrato] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const [contratosApi, alunosApi] = await Promise.all([listarContratos(), listarAlunos()]);
      setContratos(contratosApi);
      setAlunos(alunosApi);
    } catch {
      setContratos([]);
      try {
        setAlunos(await listarAlunos());
      } catch {
        setAlunos([]);
      }
    } finally {
      setCarregando(false);
    }
  }

  function nomeDoAluno(contrato) {
    return contrato.alunoNome || alunos.find((a) => a.id === contrato.alunoId)?.nome || "—";
  }

  const contratosFiltrados = useMemo(
    () => (statusFiltro ? contratos.filter((c) => c.status === statusFiltro) : contratos),
    [contratos, statusFiltro]
  );

  async function handleBaixarPdf(contratoId) {
    setProcessandoId(contratoId);
    setAvisoDoContrato("");
    try {
      const blob = await baixarContratoPdf(contratoId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${contratoId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const mensagemDoErro = err.message || "Não foi possível gerar o PDF do contrato.";
      const faltaCpf = mensagemDoErro.toLowerCase().includes("cpf");
      setAvisoDoContrato(
        faltaCpf ? `${mensagemDoErro} Abra a tela Alunos e use "CPF do responsável".` : mensagemDoErro
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleCancelar(contratoId) {
    if (!confirm("Cancelar este contrato? As parcelas já geradas continuam no histórico.")) return;
    setProcessandoId(contratoId);
    try {
      await cancelarContrato(contratoId);
      await carregar();
    } catch (err) {
      alert(err.message || "Não foi possível cancelar o contrato.");
    } finally {
      setProcessandoId(null);
    }
  }

  if (carregando) {
    return <Loading label="Carregando contratos..." />;
  }

  return (
    <div className="card">
      <div className="table-toolbar">
        <h3 style={{ margin: 0 }}><span className="dot" /> Contratos</h3>
        <Select
          id="filtro-status-contrato"
          options={OPCOES_STATUS}
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        />
      </div>
      {avisoDoContrato && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {avisoDoContrato}
        </p>
      )}
      {contratosFiltrados.length === 0 ? (
        <p className="helper-text">
          {contratos.length === 0 ? "Nenhum contrato encontrado." : "Nenhum contrato com este status."}
        </p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Valor da parcela</th>
                <th>Parcelas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contratosFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>{nomeDoAluno(c)}</td>
                  <td className="mono">{converterDataIsoParaBr(c.dataInicio) || "—"}</td>
                  <td className="mono">{converterDataIsoParaBr(c.dataFim) || "—"}</td>
                  <td className="mono">{formatarMoeda(c.valorParcela)}</td>
                  <td className="mono">{c.numParcelas}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBaixarPdf(c.id)}
                        disabled={processandoId === c.id}
                      >
                        Baixar PDF
                      </Button>
                      {c.status !== "Cancelado" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelar(c.id)}
                          disabled={processandoId === c.id}
                        >
                          Cancelar
                        </Button>
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
  );
}
