"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
];

interface DashboardProps {
  reportData: any;
}

export default function ProcurementDashboard({
  reportData,
}: DashboardProps) {

  if (!reportData) {
    return (
      <div className="bg-slate-900 p-6 rounded-xl mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Procurement Dashboard
        </h2>

        <p className="text-zinc-400">
          Generate a report from chat to view dashboard analytics.
        </p>
      </div>
    );
  }

  const chartData =
    reportData.products.map(
      (item: any) => ({
        name: item.productName,
        value: item.addressedQty,
      })
    );

  return (
    <div className="space-y-8 mb-10">

      <h2 className="text-3xl font-bold">
        Procurement Dashboard
      </h2>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-7 gap-4">

        <div className="bg-slate-800 p-5 rounded-xl">
          <h3>Total Products</h3>
          <p className="text-3xl font-bold">
            {reportData.totalProducts}
          </p>
        </div>

        <div className="bg-green-800 p-5 rounded-xl">
          <h3>Total Amount</h3>
          <p className="text-3xl font-bold">
            ${reportData.totalAmount}
          </p>
        </div>

        <div className="bg-yellow-700 p-5 rounded-xl">
          <h3>Qty Match %</h3>
          <p className="text-3xl font-bold">
            {reportData.qtyMatchPercentage}%
          </p>
        </div>

        <div className="bg-blue-700 p-5 rounded-xl">
          <h3>Price Match %</h3>
          <p className="text-3xl font-bold">
            {reportData.priceMatchPercentage}%
          </p>
        </div>
        <div className="bg-red-700 p-5 rounded-xl">
          <h3>Missing Products</h3>
          <p className="text-3xl font-bold">
            {reportData.missingProductCount || 0}
          </p>
        </div>

         <div className="bg-orange-700 p-5 rounded-xl">
           <h3>Extra Products</h3>
           <p className="text-3xl font-bold">
             {reportData.extraProductCount || 0}
            </p>
          </div>

         <div className="bg-purple-700 p-5 rounded-xl">
           <h3>Wrong Specs</h3>
           <p className="text-3xl font-bold">
    {
      reportData.products?.filter(
        (p: any) =>
          p.specStatus ===
          "Wrong Specification"
      ).length
    }
  </p>
</div>
      </div>

      {/* Product Distribution */}

      <div className="bg-slate-900 p-6 rounded-xl">

        <h3 className="text-xl font-bold mb-4">
          Product Distribution
        </h3>

        <div
          style={{
            width: "100%",
            height: 350,
          }}
        >

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                label
              >

                {chartData.map(
                  (
                    entry,
                    index
                  ) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Procurement Analysis */}

      <div className="bg-slate-900 p-6 rounded-xl overflow-x-auto">

        <h3 className="text-xl font-bold mb-4">
          Procurement Analysis
        </h3>

        <table className="w-full border-collapse">

          <thead>

            <tr className="border-b border-slate-700">

              <th className="p-2 text-left">
                Product
              </th>

              <th className="p-2 text-left">
                Requested Qty
              </th>

              <th className="p-2 text-left">
                Addressed Qty
              </th>

              <th className="p-2 text-left">
                Target Price
              </th>

              <th className="p-2 text-left">
                Vendor Price
              </th>

              <th className="p-2 text-left">
                Price Difference
              </th>
              
              <th className="p-2 text-left">
                Specification Status
              </th>

              <th className="p-2 text-left">
                Remarks
              </th>

              <th className="p-2 text-left">
                AI Recommendation
              </th>

            </tr>

          </thead>

          <tbody>

            {reportData.products.map(
              (
                item: any,
                index: number
              ) => (

                <tr
                  key={index}
                  className="border-b border-slate-800"
                >

                  <td className="p-2">
                    {item.productName}
                  </td>

                  <td className="p-2">
                    {item.requestedQty}
                  </td>

                  <td className="p-2">
                    {item.addressedQty}
                  </td>

                  <td className="p-2">
                    ${item.targetPrice}
                  </td>

                  <td className="p-2">
                    ${item.vendorPrice}
                  </td>

                  <td className="p-2">
                    ${item.priceDifference}
                  </td>
                  
                  <td className="p-2">
                    {item.specStatus}
                  </td>

                  <td className="p-2">
                    {item.remarks}
                  </td>

                  <td className="p-2">

                    <span
                      className={`px-3 py-1 rounded text-white ${
                        item.recommendation ===
                        "Recommended"
                          ? "bg-green-600"
                          : item.recommendation ===
                            "Qty Match"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                    >

                      {item.recommendation}

                    </span>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>
      

      {/* Missing Products */}
      
      <div className="bg-slate-900 p-6 rounded-xl">

        <h3 className="text-xl font-bold mb-4">
          Missing Products
        </h3>

        {reportData.missingProducts?.length > 0 ? (

    <ul>

      {reportData.missingProducts.map(
        (
          item: any,
          index: number
        ) => (

          <li key={index}>
            ❌ {item.productName}
            {" "}
            (
            {item.SpecValue || "NA"}
            )
          </li>

        )
      )}

    </ul>

  ) : (

    <p>
      No Missing Products
    </p>

  )}

</div>

<div className="bg-slate-900 p-6 rounded-xl">

  <h3 className="text-xl font-bold mb-4">
    Extra Products
  </h3>

  {reportData.extraProducts?.length > 0 ? (

    <ul>

      {reportData.extraProducts.map(
        (
          item: any,
          index: number
        ) => (

          <li key={index}>
            ⚠️ {item.ProductName}
            {" "}
            (
            {item.SpecValue || "NA"}
            )
          </li>

        )
      )}

    </ul>

  ) : (

    <p>
      No Extra Products
    </p>

  )}

</div>

      {/* AI Insights */}

      <div className="bg-slate-900 p-6 rounded-xl">

        <h3 className="text-xl font-bold mb-4">
          AI Procurement Insights
        </h3>

        <ul className="space-y-2">

          {reportData.insights?.map(
            (
              insight: string,
              index: number
            ) => (

              <li key={index}>
                ✅ {insight}
              </li>

            )
          )}

        </ul>

      </div>

      {/* Quote Details */}

      <div className="bg-slate-900 p-6 rounded-xl">

        <h3 className="text-xl font-bold mb-4">
          Quote Details
        </h3>

        <ul className="space-y-2">

          <li>
            Parent Quote ID:
            {" "}
            {reportData.parentQuoteId}
          </li>

          <li>
            Quote ID:
            {" "}
            {reportData.quoteId}
          </li>

          <li>
            Quote Name:
            {" "}
            {reportData.quoteName}
          </li>

          <li>
            Quote Number:
            {" "}
            {reportData.quoteNumber}
          </li>

          <li>
            Quote Type:
            {" "}
            {reportData.quoteType}
          </li>

          <li>
            Total Products:
            {" "}
            {reportData.totalProducts}
          </li>

          <li>
            Total Amount:
            $
            {reportData.totalAmount}
          </li>

        </ul>

      </div>

    </div>
  );
}