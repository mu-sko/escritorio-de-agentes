// Valida os exemplos de /exemplos contra os JSON Schemas de /schemas
// e confere a sintaxe dos scripts do painel. Roda na CI a cada push.
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

let falhas = 0;
for (const arq of readdirSync("exemplos")) {
  const nome = arq.replace(".json", "");
  const schema = JSON.parse(readFileSync(`schemas/${nome}.schema.json`, "utf8"));
  const doc = JSON.parse(readFileSync(`exemplos/${arq}`, "utf8"));
  const validar = ajv.compile(schema);
  if (validar(doc)) console.log(`✔ exemplos/${arq}`);
  else { falhas++; console.error(`✘ exemplos/${arq}`, validar.errors); }
}

for (const js of ["painel/app.js", "painel/demo-store.js"]) {
  try { execFileSync(process.execPath, ["--check", js]); console.log(`✔ ${js}`); }
  catch (e) { falhas++; console.error(`✘ ${js}\n${e.stderr}`); }
}

JSON.parse(readFileSync("agentes.config.json", "utf8"));
console.log("✔ agentes.config.json");

process.exit(falhas ? 1 : 0);
