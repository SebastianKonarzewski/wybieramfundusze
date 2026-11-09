import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const BASE_URL = "https://wybieramfundusze-api.knf.gov.pl";
const UNQUOTED_SUBFUND_IDS = new Set([
  204752, 203670, 211676, 211703, 193106, 191488, 197674, 203645, 635470, 193134, 203695, 635515,
]);

function calculateReturnRates(valuations) {
  if (!valuations || valuations.length < 2) {
    return {
      r1m: null,
      r3m: null,
      r1y: null,
      r2y: null,
      r2ya: null,
      rytd: null,
    };
  }

  const latest = valuations[0];
  const latestDate = new Date(latest.date);
  const latestVal = latest.valuation;

  if (!latestVal || latestVal <= 0 || isNaN(latestDate.getTime())) {
    return {
      r1m: null,
      r3m: null,
      r1y: null,
      r2y: null,
      r2ya: null,
      rytd: null,
    };
  }

  const findPastValuation = (targetDate, maxMarginDays) => {
    const targetTime = targetDate.getTime();
    for (const v of valuations) {
      const vDate = new Date(v.date);
      if (isNaN(vDate.getTime())) continue;
      if (vDate.getTime() <= targetTime) {
        const diffDays = Math.abs((targetTime - vDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= maxMarginDays && v.valuation > 0) {
          return v.valuation;
        }
        return null;
      }
    }
    return null;
  };

  // 1M (~30d, max 20d)
  const d1M = new Date(latestDate);
  d1M.setDate(d1M.getDate() - 30);
  const v1M = findPastValuation(d1M, 20);
  const r1m = v1M ? Number(((latestVal - v1M) / v1M).toFixed(6)) : null;

  // 3M (~91d, max 25d)
  const d3M = new Date(latestDate);
  d3M.setDate(d3M.getDate() - 91);
  const v3M = findPastValuation(d3M, 25);
  const r3m = v3M ? Number(((latestVal - v3M) / v3M).toFixed(6)) : null;

  // 1Y (~365d, max 35d)
  const d1Y = new Date(latestDate);
  d1Y.setDate(d1Y.getDate() - 365);
  const v1Y = findPastValuation(d1Y, 35);
  const r1y = v1Y ? Number(((latestVal - v1Y) / v1Y).toFixed(6)) : null;

  // 2Y (~730d, max 45d)
  const d2Y = new Date(latestDate);
  d2Y.setDate(d2Y.getDate() - 730);
  const v2Y = findPastValuation(d2Y, 45);
  const r2y = v2Y ? Number(((latestVal - v2Y) / v2Y).toFixed(6)) : null;
  let r2ya = null;
  if (r2y !== null && r2y > -1) {
    r2ya = Number((Math.sqrt(1 + r2y) - 1).toFixed(6));
  }

  // YTD
  const dYTD = new Date(latestDate.getFullYear(), 0, 1);
  const vYTD = findPastValuation(dYTD, 20);
  const rytd = vYTD ? Number(((latestVal - vYTD) / vYTD).toFixed(6)) : null;

  return { r1m, r3m, r1y, r2y, r2ya, rytd };
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log("Fetching subfunds and standalone funds from UKNF API...");

  const standalonePath = path.join(projectRoot, "src/data/standalone-funds.json");
  const standaloneFunds = JSON.parse(fs.readFileSync(standalonePath, "utf-8"));

  const listRes = await fetchJson(
    `${BASE_URL}/v1/subfunds?size=2000&includeInactive=false&includeLiquidating=false&sort=name,asc`
  );
  if (!listRes || !listRes.content) {
    console.error("Failed to fetch subfunds list from KNF!");
    process.exit(1);
  }

  const subfunds = listRes.content.filter((sf) => !UNQUOTED_SUBFUND_IDS.has(sf.subfundId));
  const allProducts = [
    ...subfunds.map((sf) => ({ id: sf.subfundId, isFundOnly: false })),
    ...standaloneFunds
      .filter((sf) => !UNQUOTED_SUBFUND_IDS.has(sf.subfundId))
      .map((sf) => ({ id: sf.subfundId, isFundOnly: true })),
  ];

  console.log(`Found ${allProducts.length} total investable products. Fetching valuations & metrics...`);

  const metricsMap = {};
  const chunkSize = 25;

  for (let i = 0; i < allProducts.length; i += chunkSize) {
    const chunk = allProducts.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (prod) => {
        try {
          const valUrl = prod.isFundOnly
            ? `${BASE_URL}/v1/valuations?fundId=${prod.id}&size=780&sort=date,desc`
            : `${BASE_URL}/v1/valuations?subfundId=${prod.id}&size=780&sort=date,desc`;

          const kidUrl = prod.isFundOnly
            ? `${BASE_URL}/v1/key-information?fundId=${prod.id}&size=1`
            : `${BASE_URL}/v1/key-information?subfundId=${prod.id}&size=1`;

          const assetUrl = prod.isFundOnly
            ? `${BASE_URL}/v1/assets?fundId=${prod.id}&size=1&sort=date,desc`
            : `${BASE_URL}/v1/assets?subfundId=${prod.id}&size=1&sort=date,desc`;

          const [valRes, kidRes, assetRes] = await Promise.all([
            fetchJson(valUrl),
            fetchJson(kidUrl),
            fetchJson(assetUrl),
          ]);

          const valList = valRes?.content || [];
          const latestVal = valList[0];
          const rates = calculateReturnRates(valList);

          let fee = null;
          let risk = null;
          let tc = null;
          if (kidRes?.content?.[0]?.documentUuid) {
            const kidDetail = await fetchJson(
              `${BASE_URL}/v1/key-information/${kidRes.content[0].documentUuid}`
            );
            if (kidDetail) {
              fee = kidDetail.managementAndOtherFeesRate ?? null;
              risk = kidDetail.riskLevel ?? null;
              tc = kidDetail.transactionCostsRate ?? null;
            }
          }

          const latestAsset = assetRes?.content?.[0];
          const cur = latestVal?.currency || latestAsset?.currency || "PLN";

          metricsMap[String(prod.id)] = {
            ...rates,
            v: latestVal ? latestVal.valuation : null,
            vd: latestVal ? latestVal.date : null,
            fee,
            risk,
            tc,
            a: latestAsset?.netAssets ?? null,
            ad: latestAsset?.date ?? null,
            cur,
          };
        } catch (err) {
          console.warn(`Error syncing prod ${prod.id}:`, err.message);
        }
      })
    );

    const progress = Math.min(i + chunkSize, allProducts.length);
    process.stdout.write(`\rProgress: ${progress}/${allProducts.length} (${Math.round((progress / allProducts.length) * 100)}%)`);
    await new Promise((r) => setTimeout(r, 20));
  }

  console.log("\nDone fetching metrics!");

  const targetPath = path.join(projectRoot, "src/data/subfunds-metrics.json");
  fs.writeFileSync(targetPath, JSON.stringify(metricsMap, null, 2), "utf-8");
  console.log(`Successfully wrote ${Object.keys(metricsMap).length} subfund metrics to ${targetPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
