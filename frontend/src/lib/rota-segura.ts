/**
 * Valida `?proxima=` (seção 10.1, tela 1): só aceita caminhos internos, nunca
 * uma URL de outro domínio (evita open redirect).
 */
export function caminhoInternoSeguro(valor: string | null | undefined): string | null {
  if (!valor) return null;
  if (!valor.startsWith("/") || valor.startsWith("//")) return null;
  if (valor.includes("://")) return null;
  return valor;
}
