/**
 * Serviço de autenticação DEMONSTRATIVO.
 *
 * - Nenhuma senha é armazenada ou transmitida.
 * - Contas existem apenas no armazenamento local deste navegador.
 * - Para integrar o Supabase Auth, substitua estas funções por chamadas
 *   a `supabase.auth.signInWithPassword`, `signUp` e `resetPasswordForEmail`,
 *   mantendo as mesmas assinaturas assíncronas.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface Credentials {
  email: string;
  password: string;
}

export interface RegistrationData extends Credentials {
  name: string;
  confirm: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateCredentials(data: Credentials): FieldErrors<Credentials> {
  const errors: FieldErrors<Credentials> = {};
  if (!data.email.trim()) errors.email = "Informe seu e-mail.";
  else if (!EMAIL_PATTERN.test(data.email.trim())) errors.email = "Este e-mail não parece válido. Confira o formato (ex.: nome@email.com).";
  if (!data.password) errors.password = "Informe sua senha.";
  else if (data.password.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres.";
  return errors;
}

export function validateRegistration(data: RegistrationData): FieldErrors<RegistrationData> {
  const errors: FieldErrors<RegistrationData> = validateCredentials(data);
  if (data.name.trim().length < 2) errors.name = "Informe seu nome (mínimo de 2 letras).";
  if (data.password && data.password.length >= 6) {
    if (!/[0-9]/.test(data.password) || !/[a-zA-Z]/.test(data.password))
      errors.password = "Use letras e números para uma senha mais segura.";
  }
  if (!errors.password && data.confirm !== data.password) errors.confirm = "As senhas não coincidem.";
  return errors;
}

/** Simula a latência de uma requisição para exibir estados de carregamento reais. */
export function simulateLatency(ms = 650): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function accountIdFromEmail(email: string): string {
  return `conta-${email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
}

export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password) || /[A-Z]/.test(password)) score++;
  const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] };
}
