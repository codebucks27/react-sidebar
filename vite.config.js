import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { parse } from "dotenv";
import { expand } from "dotenv-expand";

const isCraPublicEnv = (name) =>
  name.startsWith("REACT_APP_") || name === "PUBLIC_URL";

function loadCraEnv(mode) {
  const context = { ...process.env };
  const files = [
    `.env.${mode}.local`,
    mode !== "test" && ".env.local",
    `.env.${mode}`,
    ".env",
  ].filter(Boolean);

  // CRA gives the first file priority and skips .env.local in test mode.
  for (const file of files) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    const parsed = parse(readFileSync(path));
    for (const name of Object.keys(parsed)) {
      if (Object.hasOwn(context, name)) delete parsed[name];
    }
    Object.assign(context, parsed);
    expand({ parsed, processEnv: context });
  }

  return Object.fromEntries(
    Object.entries(context).filter(([name]) => isCraPublicEnv(name))
  );
}

export default defineConfig(({ mode, command }) => {
  const env = loadCraEnv(mode);
  const publicUrl = (env.PUBLIC_URL || "").replace(/\/$/, "");
  const clientEnv = {
    ...env,
    PUBLIC_URL: publicUrl,
    NODE_ENV:
      process.env.NODE_ENV || (command === "build" ? "production" : "development"),
  };
  const craImportMetaEnv = Object.fromEntries(
    Object.entries(env)
      .filter(([name]) => name.startsWith("REACT_APP_"))
      .map(([name, value]) => [`import.meta.env.${name}`, JSON.stringify(value)])
  );

  return {
    plugins: [react()],
    base: publicUrl ? `${publicUrl}/` : "/",
    envPrefix: "VITE_",
    define: {
      ...craImportMetaEnv,
      "process.env": JSON.stringify(clientEnv),
    },
    server: { port: 3000 },
    build: {
      outDir: "build",
      target: browserslistToEsbuild(undefined, { env: "production" }),
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/setupTests.js"],
    },
  };
});
