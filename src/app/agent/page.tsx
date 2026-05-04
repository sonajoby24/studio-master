"use client";

import { useState } from "react";

export default function AgentPage() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [masterId, setMasterId] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const runAnalysis = async () => {
    if (!masterId || !transactionId) {
      alert("Enter both Master ID and Transaction ID");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          masterId,
          transactionId,
        }),
      });

      const data = await res.json();
      setResponse(data);

    } catch (error) {
      console.error("FRONTEND ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Agent Analysis</h1>

      {/* INPUTS */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Master Quote ID (M1)"
          value={masterId}
          onChange={(e) => setMasterId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Transaction Quote ID (T1)"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
      </div>

      {/* BUTTON */}
      <button onClick={runAnalysis} disabled={loading}>
        {loading ? "Running..." : "Run Analysis"}
      </button>

      {/* TABLE */}
      {response?.table?.length > 0 && (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              {Object.keys(response.table[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {response.table.map((row: any, i: number) => (
              <tr key={i}>
                {Object.values(row).map((val: any, j: number) => (
                  <td key={j}>
                    {val === "Included" ? "Included 🔥" : val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* SUMMARY */}
      {response?.summary && (
        <p>
          <b>Summary:</b> {response.summary}
        </p>
      )}

      {/* AI OUTPUT */}
      {response?.aiSummary && (
        <pre>{response.aiSummary}</pre>
      )}

      {/* BEST VENDOR */}
      {response?.overallBestVendor && (
        <p>
          <b>Overall Best Vendor:</b> {response.overallBestVendor}
        </p>
      )}
    </div>
  );
}