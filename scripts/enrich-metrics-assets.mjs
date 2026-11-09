import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const BASE_URL = "https://wybieramfundusze-api.knf.gov.pl";

async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log("Loading metrics and standalone funds data...");
  const metricsPath = path.join(projectRoot, "src/data/subfunds-metrics.json");
  const standalonePath = path.join(projectRoot, "src/data/standalone-funds.json");

  const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf-8"));
  const standaloneFunds = JSON.parse(fs.readFileSync(standalonePath, "utf-8"));
  const standaloneSet = new Set(standaloneFunds.map((f) => String(f.subfundId)));

  const ids = Object.keys(metrics);
  console.log(`Starting enrichment for ${ids.length} products with transactionCostsRate and netAssets...`);

  const chunkSize = 25;
  let processed = 0;
  let tcCount = 0;
  let assetsCount = 0;

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const isFundOnly = standaloneSet.has(id);
          const param = isFundOnly ? `fundId=${id}` : `subfundId=${id}`;

          const [assetRes, kidRes] = await Promise.all([
            fetchJson(`${BASE_URL}/v1/assets?${param}&size=1&sort=date,desc`),
            fetchJson(`${BASE_URL}/v1/key-information?${param}&size=1`),
          ]);

          let tc = null;
          if (kidRes?.content?.[0]?.documentUuid) {
            const kidDetail = await fetchJson(
              `${BASE_URL}/v1/key-information/${kidRes.content[0].documentUuid}`
            );
            if (kidDetail && kidDetail.transactionCostsRate !== undefined) {
              tc = kidDetail.transactionCostsRate;
            }
          }

          const latestAsset = assetRes?.content?.[0];
          const a = latestAsset?.netAssets ?? null;
          const ad = latestAsset?.date ?? null;

          if (tc !== null && tc !== undefined) tcCount++;
          if (a !== null && a !== undefined) assetsCount++;

          metrics[id] = {
            ...metrics[id],
            tc: tc !== undefined ? tc : null,
            a: a !== undefined ? a : null,
            ad: ad !== undefined ? ad : null,
          };
        } catch (err) {
          console.warn(`Error enriching ${id}:`, err.message);
        }
      })
    );

    processed = Math.min(i + chunkSize, ids.length);
    process.stdout.write(
      `\rProgress: ${processed}/${ids.length} (${Math.round((processed / ids.length) * 100)}%) - TC found: ${tcCount}, Assets found: ${assetsCount}`
    );
    await new Promise((r) => setTimeout(r, 40));
  }

  console.log("\nEnrichment complete. Writing updated metrics to JSON...");
  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), "utf-8");
  console.log(`Successfully saved ${Object.keys(metrics).length} entries to ${metricsPath}`);
}

main().catch((err) => {
  console.error("Enrichment script failed:", err);
  process.exit(1);
});
