import { expect, test } from "@playwright/test";

test.describe("Entrar", () => {
  test("credenciais inválidas mostram o resumo de erro com foco", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("aluno@teste.com");
    await page.getByLabel("Senha", { exact: true }).fill("123"); // menos de 6 caracteres
    await page.getByRole("button", { name: "Entrar" }).click();

    const resumo = page.getByRole("alert").filter({ hasText: "Não foi possível entrar" });
    await expect(resumo).toBeVisible();
    await expect(resumo).toHaveText(/E-mail ou senha incorretos/);
    await expect(resumo).toBeFocused();
  });

  test("login válido entra e leva para a rota protegida pedida (?proxima=)", async ({ page }) => {
    await page.goto("/entrar?proxima=%2Fperfil");
    await page.getByLabel("E-mail").fill("aluno@teste.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/perfil");
    expect(page.url()).toContain("/perfil");
  });

  test("rota protegida sem sessão redireciona para /entrar com ?proxima=", async ({ page }) => {
    const resposta = await page.goto("/treino");
    expect(resposta?.status()).toBe(200);
    await page.waitForURL(/\/entrar\?proxima=%2Ftreino/);
  });

  test("quem já está logado é redirecionado para fora de /entrar", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").fill("aluno@teste.com");
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("**/inicio");

    await page.goto("/entrar");
    await page.waitForURL("**/inicio");
  });

  test("fluxo completo funciona só com teclado", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("E-mail").focus();
    await page.keyboard.type("aluno@teste.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type("senha123");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/inicio");
  });
});

test.describe("Criar conta", () => {
  test("valida todos os campos obrigatórios ao enviar vazio", async ({ page }) => {
    await page.goto("/cadastrar");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Informe como quer ser chamado.")).toBeVisible();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
    await expect(page.getByText("A senha precisa ter pelo menos 6 caracteres.")).toBeVisible();
    await expect(page.getByText("Selecione uma opção.")).toBeVisible();
    await expect(page.getByText("Você precisa aceitar os Termos")).toBeVisible();
  });

  test("cadastro válido mostra a tela de confirmação de e-mail", async ({ page }) => {
    await page.goto("/cadastrar");
    await page.getByLabel("Como quer ser chamado").fill("Aluno Teste");
    await page.getByLabel("E-mail").fill(`novo-${Date.now()}@teste.com`);
    await page.getByLabel("Senha", { exact: true }).fill("senha123");
    await page.getByText("Tenho 18 anos ou mais").click();
    await page.getByText(/Li e aceito/).click();
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
    await expect(page.getByText("Modo de demonstração: nenhum e-mail é enviado de verdade.")).toBeVisible();

    await page.getByRole("button", { name: "Já confirmei, continuar" }).click();
    await page.waitForURL("**/inicio");
  });
});

test.describe("Termos e Privacidade", () => {
  for (const rota of ["/termos", "/privacidade"]) {
    test(`${rota} mostra a estrutura provisória`, async ({ page }) => {
      await page.goto(rota);
      await expect(page.getByText(/Última atualização/)).toBeVisible();
      await expect(page.getByText("TODO(equipe): texto jurídico.").first()).toBeVisible();
    });
  }
});
