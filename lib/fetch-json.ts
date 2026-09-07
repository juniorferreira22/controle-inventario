export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const body = await response.text();
  let data: unknown = null;
  if (body) {
    try {
      data = JSON.parse(body);
    } catch {
      throw new Error("A resposta do servidor nao esta em JSON.");
    }
  }
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data && typeof data.error === "string" ? data.error : "Nao foi possivel concluir a solicitacao.";
    throw new Error(message);
  }
  if (data === null) throw new Error("O servidor retornou uma resposta vazia.");
  return data as T;
}