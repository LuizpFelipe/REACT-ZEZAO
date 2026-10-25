import { useEffect, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { baixarContratoPdf, cancelarContrato, listarContratos } from "../services/contratoService";
import "@shared/shared.css";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [avisoDoContrato, setAvisoDoContrato] = useState("");

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

  function nomeDoAluno(alunoId) {
    return alunos.find((a) => a.id === alunoId)?.nome ?? "—";
  }

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
      <h3><span className="dot" /> Contratos</h3>
      {avisoDoContrato && (
        <p className="helper-text" style={{ color: "var(--red-ink)" }}>
          {avisoDoContrato}
        </p>
      )}
      {contratos.length === 0 ? (
        <p className="helper-text">Nenhum contrato encontrado.</p>
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
              {contratos.map((c) => (
                <tr key={c.id}>
                  <td>{nomeDoAluno(c.alunoId)}</td>
                  <td className="mono">{c.dataInicio}</td>
                  <td className="mono">{c.dataFim}</td>
                  <td className="mono">{c.valorParcela}</td>
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
