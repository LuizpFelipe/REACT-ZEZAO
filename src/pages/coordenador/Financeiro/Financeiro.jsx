import { useEffect, useState } from "react";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Button from "../../../components/Button/Button";
import Loading from "../../../components/Loading/Loading";
import { dispararAvisoCobranca, listarParcelasDoMes, listarResumoFinanceiro } from "../../../services/financeiroService";
import "../../../styles/coordenador.css";

const PARCELAS_MOCK = [
  { id: 1, aluno: "Enzo Ferreira", vencimento: "05/09", valor: "R$ 180", status: "Pago" },
  { id: 2, aluno: "Davi Lucca", vencimento: "05/08", valor: "R$ 180", status: "Atrasado" },
  { id: 3, aluno: "Sophia Martins", vencimento: "05/09", valor: "R$ 160", status: "Pendente" },
];

const RESUMO_MOCK = { recebidoMes: "R$ 4.280", pendente: "R$ 640", inadimplencia: "8%" };

export default function Financeiro() {
  const [parcelas, setParcelas] = useState([]);
  const [resumo, setResumo] = useState(RESUMO_MOCK);
  const [carregando, setCarregando] = useState(true);
  const [disparando, setDisparando] = useState(false);

  useEffect(() => {
    let ativo = true;

    Promise.all([listarParcelasDoMes(), listarResumoFinanceiro()])
      .then(([parcelasApi, resumoApi]) => {
        if (ativo) {
          setParcelas(parcelasApi);
          setResumo(resumoApi);
        }
      })
      .catch(() => {
        if (ativo) setParcelas(PARCELAS_MOCK);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  async function handleDispararTodos() {
    setDisparando(true);
    try {
      await dispararAvisoCobranca();
    } catch (err) {
      alert(err.message || "Não foi possível disparar os avisos.");
    } finally {
      setDisparando(false);
    }
  }

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Recebido no mês</div>
          <div className="value">{resumo.recebidoMes}</div>
        </div>
        <div className="stat-card accent">
          <div className="label">Pendente</div>
          <div className="value">{resumo.pendente}</div>
        </div>
        <div className="stat-card warn">
          <div className="label">Inadimplência</div>
          <div className="value">{resumo.inadimplencia}</div>
        </div>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <h3 style={{ margin: 0 }}>
            <span className="dot" /> Parcelas do Mês
          </h3>
          <Button variant="outline" size="sm" onClick={handleDispararTodos} disabled={disparando}>
            {disparando ? "Disparando..." : "Disparar Avisos de Cobrança"}
          </Button>
        </div>

        {carregando ? (
          <Loading label="Carregando parcelas..." />
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Vencimento</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {(parcelas.length ? parcelas : PARCELAS_MOCK).map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.status === "Atrasado" ? (
                        <span className="name-flag">
                          <span className="flag-dot" />
                          {p.aluno}
                        </span>
                      ) : (
                        p.aluno
                      )}
                    </td>
                    <td className="mono">{p.vencimento}</td>
                    <td className="mono">{p.valor}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      {p.status === "Pago" ? (
                        "—"
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => dispararAvisoCobranca(p.id)}>
                          {p.status === "Atrasado" ? "Enviar WhatsApp" : "Lembrete"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8FB6C9" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M8 12l3 3 5-6" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          <div>
            <b>Cobrança automática:</b> aviso enviado 10 dias antes do vencimento; se passar 10 dias após sem
            pagamento, avisa novamente o responsável, o professor da turma e a coordenação.
          </div>
        </div>
      </div>
    </div>
  );
}
