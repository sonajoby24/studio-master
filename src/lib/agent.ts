export async function runEnterpriseAgent(
  data: any,
  q1: string,
  q2: string
) {
  try {
    const vendors =
      data?.transactionQuote?.vendors || [];

    if (!vendors.length) {
      return {
        answer: "No vendor data available",
      };
    }

    // CALCULATE VENDOR METRICS
    const comparison = vendors.map((vendor: any) => {
      const totalCost = vendor.products.reduce(
        (sum: number, product: any) => sum + product.price,
        0
      );

      // ENTERPRISE SCORE
      const score =
        (10000 - totalCost) * 0.5 +
        vendor.rating * 1000 * 0.3 +
        (10 - vendor.deliveryDays) * 500 * 0.2;

      return {
        vendor: vendor.vendor,
        totalCost,
        rating: vendor.rating,
        deliveryDays: vendor.deliveryDays,
        score,
      };
    });

    // SORT BEST VENDOR
    comparison.sort((a: any, b: any) => b.score - a.score);

    const bestVendor = comparison[0];

    // BUILD RESPONSE
    let response = `
ENTERPRISE PROCUREMENT ANALYSIS

Question 1:
${q1}

Question 2:
${q2}

----------------------------------

VENDOR COMPARISON

`;

    comparison.forEach((vendor: any) => {
      response += `
${vendor.vendor}

- Total Cost: ₹${vendor.totalCost}
- Rating: ${vendor.rating}/5
- Delivery Days: ${vendor.deliveryDays}
- Enterprise Score: ${vendor.score.toFixed(2)}

`;
    });

    response += `
----------------------------------

BEST VENDOR

${bestVendor.vendor}

REASON

${bestVendor.vendor} is recommended because it provides the best balance between:

- Procurement cost
- Vendor rating
- Delivery efficiency
- Overall enterprise score

This recommendation is generated using structured procurement scoring logic.
`;

    return {
      answer: response,
    };

  } catch (error) {
    console.error("AGENT ERROR:", error);

    return {
      answer: "Error processing enterprise analysis",
    };
  }
}