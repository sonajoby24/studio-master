import { ai } from "../genkit";

/* ================= MAIN AGENT ================= */
export async function runAgent(input: any) {
  try {
    const context = prepareContext(input);

    const table = buildComparisonTable(context);
    const metrics = buildMetrics(context);
    const reduced = reduceMetrics(metrics);

    // ✅ Always compute fallback (TRUE decision source)
    const sorted = [...reduced].sort((a, b) => b.score - a.score);
    const fallbackBest = sorted[0];

    const aiResult = await generateAI(reduced);

    return {
      table,
      metrics,
      reduced,

      // ✅ FIX: fallback FIRST (important)
      bestVendor: fallbackBest?.vendor || aiResult.bestVendor || "N/A",

      recommendation:
        aiResult.reason ||
        "Selected based on highest score and lowest risk",

      overallBestVendor:
        fallbackBest?.vendor || aiResult.bestVendor || "N/A",
    };
  } catch (error) {
    console.error("AGENT ERROR:", error);

    return {
      table: [],
      metrics: [],
      reduced: [],
      bestVendor: "N/A",
      recommendation: "Error",
      overallBestVendor: "N/A",
    };
  }
}

/* ================= CONTEXT ================= */
function prepareContext(input: any) {
  return {
    masterQuote: input?.masterQuote || {},
    vendors: input?.transactionQuote?.vendors || [],
  };
}

/* ================= TABLE ================= */
function buildComparisonTable(context: any) {
  const table: any[] = [];

  context.masterQuote.products?.forEach((product: any) => {
    const row: any = { product: product.name };

    context.vendors.forEach((vendor: any) => {
      const found = vendor.products?.find(
        (p: any) => p.name === product.name
      );

      row[vendor.vendor] = found ? found.price : "Missing";
    });

    table.push(row);
  });

  return table;
}

/* ================= METRICS ================= */
function buildMetrics(context: any) {
  const requiredDate = new Date(context.masterQuote.expectedDate);

  return context.vendors.map((v: any) => {
    const totalCost = (v.products || []).reduce(
      (sum: number, p: any) => sum + (p.price || 0),
      0
    );

    const missing = context.masterQuote.products.filter(
      (mp: any) =>
        !v.products.some((vp: any) => vp.name === mp.name)
    ).length;

    const delayDays =
      (new Date(v.expectedDate).getTime() -
        requiredDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return {
      vendor: v.vendor,
      cost: totalCost,
      delay: Math.max(0, delayDays),
      missing,
      rating: v.rating || 0,
      speed: v.deliveryDays || 1,
    };
  });
}

/* ================= REDUCED ================= */
function reduceMetrics(metrics: any[]) {
  return metrics.map((m) => {
    const score =
      (1 / (m.cost || 1)) * 0.4 +
      (1 / (1 + m.delay)) * 0.2 +
      (1 / (1 + m.missing)) * 0.2 +
      (m.rating / 5) * 0.1 +
      (1 / (m.speed || 1)) * 0.1;

    const risk =
      m.delay * 0.6 +
      m.missing * 0.4;

    return {
      vendor: m.vendor,
      score: Number(score.toFixed(4)),
      risk: Number(risk.toFixed(4)),
    };
  });
}

/* ================= AI DECISION ================= */
async function generateAI(reduced: any[]) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a procurement decision assistant. Be precise with numerical comparison.",
          },
          {
            role: "user",
            content: `
Each vendor has:
- score (higher is better)
- risk (lower is better)

DATA:
${JSON.stringify(reduced, null, 2)}

IMPORTANT:
- The best vendor MUST be the one with highest score and lowest risk.
- Do not guess.

Return ONLY valid JSON:
{
  "bestVendor": "vendor name",
  "reason": "short explanation"
}
            `,
          },
        ],
      }),
    });

    const data = await res.json();

    const text =
      data?.choices?.[0]?.message?.content?.trim() || "";

    // ✅ Safe parsing
    try {
      const parsed = JSON.parse(text);
      return {
        bestVendor: parsed.bestVendor || "",
        reason: parsed.reason || "",
      };
    } catch {
      return {
        bestVendor: "",
        reason: text || "AI response not in JSON format",
      };
    }

  } catch (err) {
    console.error("AI ERROR:", err);

    return {
      bestVendor: "",
      reason: "AI failed (fallback used)",
    };
  }
}