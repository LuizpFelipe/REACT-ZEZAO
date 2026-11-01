import { fetchApi } from "@shared/utils/http";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5260/api";

export async function resetarSenha(usuarioId, novaSenha) {
  const response = await fetchApi(`${API_URL}/usuarios/${usuarioId}/resetar-senha`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ novaSenha }),
  });
  const corpo = await response.json().catch(() => null);
  if (!response.ok || corpo?.status === false) {
    throw new Error(corpo?.message || "Não foi possível resetar a senha.");
  }
}
