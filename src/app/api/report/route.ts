import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

function normalize(value: string = "") {

  return value
    .replace(/Â/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

}

export async function POST(req: Request) {
  try {
    const { quoteId,quoteNumber } = await req.json();

    // -------------------------------
    // Find Quote
    // -------------------------------

    const quoteSnapshot = await adminDb
      .collection("quotes")
      .get();

    let vendorQuote: any = null;
    
    console.log("INPUT QUOTE ID:", quoteId);
    console.log("INPUT QUOTE NUMBER:", quoteNumber);

// Find the transactional/vendor quote
for (const doc of quoteSnapshot.docs) {

  const data = doc.data();

  const actualQuoteId =
    data?.QuoteInfo?.[0]?.QuoteId;

  const actualQuoteNumber =
    String(data?.QuoteInfo?.[0]?.QuoteNumber || "");
  
  console.log(
  "Checking:",
  actualQuoteId,
  actualQuoteNumber,
  doc.id
);

  if (
    actualQuoteId === quoteId ||
    actualQuoteNumber === String(quoteNumber)
  ) {

    console.log("VENDOR QUOTE FOUND:", doc.id);

    vendorQuote = data;

    break;
  }
}
const parentQuoteId =
  vendorQuote.QuoteInfo?.[0]?.ParentQuoteID;

const vendorType =
  vendorQuote?.QuoteInfo?.[0]?.QuoteType;

let quoteData: any = vendorQuote;

console.log("QUOTE TYPE:", vendorType);

if (parentQuoteId) {

  for (const doc of quoteSnapshot.docs) {

    const data = doc.data();

    const actualQuoteId =
      data?.QuoteInfo?.[0]?.QuoteId;

    if (actualQuoteId === parentQuoteId) {

      console.log("MASTER QUOTE FOUND:", doc.id);

      quoteData = data;

      break;
    }
  }
}

if (!vendorQuote) {
  return NextResponse.json({
    success: false,
    message: "Quote not found",
  });
}

    if (!quoteData) {
      return NextResponse.json({
        success: false,
        message: "Quote not found",
      });
    }
const masterInfo =
  quoteData?.QuoteInfo?.[0];

const vendorInfo =
  vendorQuote?.QuoteInfo?.[0];

const masterLines =
  masterInfo?.Qlines || [];

const vendorLines =
  vendorInfo?.Qlines || [];

const missingProducts = masterLines.filter((master: any) => {

  const found = vendorLines.find((vendor: any) =>

    normalize(vendor.ProductName) === normalize(master.ProductName) &&
    normalize(vendor.specValue) === normalize(master.specValue)

  );

  return !found;

});

const extraProducts = vendorLines.filter((vendor: any) => {

  const found = masterLines.find((master: any) =>

    normalize(master.ProductName) === normalize(vendor.ProductName) &&
    normalize(master.specValue) === normalize(vendor.specValue)

  );

  return !found;

});

  console.log(
  "MASTER:",
  masterLines.length
);

console.log(
  "VENDOR:",
  vendorLines.length
);

    console.log(
  "FIRST MASTER LINE:",
  JSON.stringify(masterLines[0], null, 2)
);

console.log(
  "MASTER LINE 18:",
  JSON.stringify(masterLines[18], null, 2)
);

    console.log(
      "MASTER INFO:",
      JSON.stringify(
        masterInfo,
        null,
        2
      )
    );

      

    // -------------------------------
    // Build Analysis Rows
    // -------------------------------

    const analysisProducts: any[] = masterLines.map(
      (item: any) => {
    const vendorMatch =
  vendorLines.find((vendor: any) => {

    return (

      normalize(vendor.ProductName) ===
      normalize(item.ProductName)

      &&

      normalize(vendor.specValue) ===
      normalize(item.specValue)

    );

  }) || null;

const specMatched = !!
vendorMatch;
 
        const requestedQty =
          Number(
            item.Quantity ||
              0
          );

        const addressedQty =
          Number(
            vendorMatch?.Quantity || 0
          );

        const targetPrice =
          Number(
            item.TargetPrice ||
              0
          );

        const vendorPrice =
          Number(
            vendorMatch?.UnitPrice || 0
          );

        const priceDifference =
          (
            vendorPrice -
            targetPrice
          ).toFixed(2);

        const qtyMatched =
          requestedQty ===
          addressedQty;

        const priceMatched =
          vendorPrice <=
          targetPrice;

let recommendation = "Not Recommended";

if (vendorMatch) {

    if (qtyMatched && priceMatched) {

        recommendation = "Recommended";

    } else if (qtyMatched) {

        recommendation = "Qty Match";

    }

}

        if (
          qtyMatched &&
          priceMatched
        ) {
          recommendation =
            "Recommended";
        } else if (
          qtyMatched
        ) {
          recommendation =
            "Qty Match";
        } else {
          recommendation =
            "Not Recommended";
        }

       return {
         productName:
           `${item.ProductName} (${item.specValue || "NA"})`,
          
          specMatched,

         specStatus:

!vendorMatch
  ? "Missing Product"
  : specMatched
      ? "Specification Match"
      : "Wrong Specification",

          specValue:
            vendorMatch?.specValue || 
            item.specValue || "",

          requestedQty,

          addressedQty,

          targetPrice,

          vendorPrice,

          priceDifference,

          recommendation,
remarks:

!vendorMatch
  ? "Not Quoted"
  : qtyMatched
      ? "Qty Match"
      : "Qty Mismatch",
        };
      }
    );

    // -------------------------------
    // Summary Metrics
    // -------------------------------

    let totalAmount = 0;

    vendorLines.forEach((item: any) => {
      totalAmount +=
        Number(
          item.UnitPrice || 0
        ) *
        Number(
          item.Quantity || 0
        );
    });

    totalAmount = Number(
      totalAmount.toFixed(2)
    );

    const qtyMatchedCount =
      analysisProducts.filter(
        (p: any) =>
          p.requestedQty ===
          p.addressedQty
      ).length;

    const qtyMatchPercentage =
      analysisProducts.length > 0
        ? Math.round(
            (qtyMatchedCount /
              analysisProducts.length) *
              100
          )
        : 0;

    const priceMatchedCount =
      analysisProducts.filter(
        (p: any) =>
          p.vendorPrice <=
          p.targetPrice
      ).length;

    const priceMatchPercentage =
      analysisProducts.length > 0
        ? Math.round(
            (priceMatchedCount /
              analysisProducts.length) *
              100
          )
        : 0;

    const insights = [
      `${qtyMatchedCount} of ${analysisProducts.length} products matched requested quantity.`,
      `${priceMatchedCount} of ${analysisProducts.length} products met target pricing.`,
      `Overall quantity compliance: ${qtyMatchPercentage}%`,
      `Overall pricing compliance: ${priceMatchPercentage}%`,
    ];

    let recommendationSummary =
      "";

    if (
      qtyMatchPercentage ===
        100 &&
      priceMatchPercentage ===
        100
    ) {
      recommendationSummary =
        "All products satisfy quantity and pricing requirements. This vendor quote is recommended for approval.";
    } else if (
      qtyMatchPercentage >=
        80 &&
      priceMatchPercentage >=
        80
    ) {
      recommendationSummary =
        "Most products satisfy procurement requirements. Manual review is recommended before approval.";
    } else {
      recommendationSummary =
        "Multiple quantity or pricing mismatches were detected. This vendor quote is not recommended.";
    }

    return NextResponse.json({
      success: true,
      report: {
        inputQuoteId:
          quoteId,

        recommendationSummary,

        parentQuoteId:
          vendorInfo?.ParentQuoteID ||
          "",

        quoteId:
          vendorInfo?.QuoteId ||
          "",

        quoteName:
          vendorInfo?.QuoteName ||
          "",

        quoteNumber:
          vendorInfo?.QuoteNumber ||
          "",

        quoteType:
          vendorInfo?.QuoteType ||
          "",

        totalProducts:
          masterLines.length,

        totalAmount,

         qtyMatchPercentage,

        priceMatchPercentage,

         missingProductCount:
           missingProducts.length,

        extraProductCount:
          extraProducts.length,

missingProducts: missingProducts.map((p: any) => ({
    productName: p.ProductName,
    specValue: p.specValue
})),
extraProducts: extraProducts.map((p: any) => ({
    productName: p.ProductName,
    specValue: p.specValue
})),

        insights,

        products:
          analysisProducts,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Server Error",
    });
  }
}