import { useEffect, useState } from "react";
import StatusBadge from "@shared/components/StatusBadge/StatusBadge";
import Button from "@shared/components/Button/Button";
import Loading from "@shared/components/Loading/Loading";
import { listarAlunos } from "@features/aluno/services/alunoService";
import { baixarContratoPdf, cancelarContrato, listarContratos } from "../services/contratoService";
import "@shared/shared.css";

/**
 * Esta tela não emite contratos — o Contrato é criado automaticamente pelo
 * back-end junto com as 12 parcelas assim que o aluno é cadastrado (card
 * [Back-end] Contrato). Aqui só lista o que já existe, baixa o PDF pra
 * impressão/assinatura e permite cancelar (o que só muda o Status, nunca
 * apaga a linha, pra não perder o histórico de parcelas vinculadas).
 */
export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);

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
    try {
      const blob = await baixarContratoPdf(contratoId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${contratoId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Não foi possível gerar o PDF do contrato.");
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
