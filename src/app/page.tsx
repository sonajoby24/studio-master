"use client";

import { useState } from "react";

// ✅ CHART IMPORTS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ✅ REGISTER CHART
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AgentPage() {
  const [masterId, setMasterId] = useState("M1");
  const [transactionId, setTransactionId] = useState("T1");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ RUN ANALYSIS
  const runAnalysis = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterId, transactionId }),
      });

      const data = await res.json();
      setResponse(data);

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  // ✅ SEED DATA
  const seedData = async () => {
    try {
      await fetch("/api/seed");
      alert("✅ Data inserted!");
    } catch {
      alert("❌ Seed failed");
    }
  };

  // ✅ CHART DATA (INSIDE COMPONENT)
  const chartData = response?.reduced
    ? {
        labels: response.reduced.map((r: any) => r.vendor),
        datasets: [
          {
            label: "Score",
            data: response.reduced.map((r: any) => r.score),
          },
          {
            label: "Risk",
            data: response.reduced.map((r: any) => r.risk),
          },
        ],
      }
    : null;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Agent Analysis Dashboard</h1>

      {/* SEED */}
      <button onClick={seedData}>Seed Data</button>

      <br /><br />

      {/* INPUTS */}
      <input
        value={masterId}
        onChange={(e) => setMasterId(e.target.value)}
        placeholder="Master ID"
        style={{ marginRight: 10 }}
      />

      <input
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        placeholder="Transaction ID"
      />

      <br /><br />

      {/* RUN */}
      <button onClick={runAnalysis}>
        {loading ? "Running..." : "Run Analysis"}
      </button>

      {/* OUTPUT */}
      {response && (
        <div style={{ marginTop: 20 }}>

          {/* TABLE */}
          <h3>📊 Product vs Vendor Table</h3>
          <table border={1} cellPadding={8}>
            <thead>
              <tr>
                <th>Product</th>
                {Object.keys(response.table[0] || {})
                  .filter((k) => k !== "product")
                  .map((vendor: string) => (
                    <th key={vendor}>{vendor}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {response.table.map((row: any, i: number) => (
                <tr key={i}>
                  <td>{row.product}</td>
                  {Object.keys(row)
                    .filter((k) => k !== "product")
                    .map((vendor: string) => (
                      <td key={vendor}>{row[vendor]}</td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>

          <br />

          {/* METRICS */}
          <h3>📦 Vendor Metrics</h3>
          <pre>{JSON.stringify(response.metrics, null, 2)}</pre>

          {/* REDUCED */}
          <h3>📉 Score & Risk</h3>
          <pre>{JSON.stringify(response.reduced, null, 2)}</pre>

          {/* ✅ CHART (CORRECT PLACE) */}
          {chartData && (
            <>
              <h3>📊 Score vs Risk Chart</h3>
              <Bar data={chartData} />
            </>
          )}

          {/* RESULT */}
          <h3>✅ Result</h3>
          <p><b>Best Vendor:</b> {response.bestVendor}</p>
          <p><b>Overall Best:</b> {response.overallBestVendor}</p>

          {/* AI */}
          <h3>🤖 AI Recommendation</h3>
          <div
            style={{
              padding: "10px",
              background: "#e6f0ff",
              borderRadius: "8px",
            }}
          >
            {response.recommendation}
          </div>

        </div>
      )}
    </div>
  );
}