import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Já temos CLAUDE.md apontando para docs/FRONTEND_PROMPT.md (seção "Como usar"
  // do prompt); não precisamos do AGENTS.md gerado automaticamente pelo Next.
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
