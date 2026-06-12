import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { quoteId } = await req.json();

    // -------------------------------
    // Find Quote
    // -------------------------------

    const quoteSnapshot = await adminDb
      .collection("quotes")
      .get();

    let quoteData: any = null;

    quoteSnapshot.forEach((doc) => {
      const data = doc.data();

      const parentQuoteId =
        data?.QuoteInfo?.[0]?.ParentQuoteID;

      const actualQuoteId =
        data?.QuoteInfo?.[0]?.QuoteId;

      if (
        parentQuoteId === quoteId ||
        actualQuoteId === quoteId
      ) {
        quoteData = data;
      }
    });

    if (!quoteData) {
      return NextResponse.json({
        success: false,
        message: "Quote not found",
      });
    }

    const quoteInfo =
      quoteData?.QuoteInfo?.[0];

    const lines =
      quoteInfo?.Qlines || [];

    // -------------------------------
    // Load RFQ Data
    // -------------------------------

    const rfqSnapshot = await adminDb
      .collection("RFQ")
      .get();

    const rfqItems: any[] = [];

    rfqSnapshot.forEach((doc) => {
      rfqItems.push(doc.data());
    });

    // -------------------------------
    // Build Analysis Rows
    // -------------------------------

    const analysisProducts =
      lines.map((item: any) => {

        const rfqMatch =
          rfqItems.find(
            (rfq) =>
              rfq.productName
                ?.toLowerCase()
                .trim() ===
              item.ProductName
                ?.toLowerCase()
                .trim()
          ) || null;

        const requestedQty =
          Number(
            rfqMatch?.requestedQty || 0
          );

        const addressedQty =
          Number(
            item.Quantity || 0
          );

        const targetPrice =
          Number(
            rfqMatch?.targetPrice || 0
          );

        const vendorPrice =
          Number(
            item.UnitPrice || 0
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

        let recommendation =
          "Needs Review";

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
            item.ProductName,

          requestedQty,

          addressedQty,

          targetPrice,

          vendorPrice,

          priceDifference,

          recommendation,

          remarks:
            qtyMatched
              ? "Qty Match"
              : "Qty Mismatch",
        };
      });

    // -------------------------------
    // Summary Metrics
    // -------------------------------

    let totalAmount = 0;

    lines.forEach((item: any) => {
      totalAmount +=
        Number(item.UnitPrice || 0) *
        Number(item.Quantity || 0);
    });
    totalAmount = Number(totalAmount.toFixed(2));

    const qtyMatchedCount =
      analysisProducts.filter(
        (p) =>
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
        (p) =>
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

    // -------------------------------
    // AI Insights
    // -------------------------------

    const insights = [
      `${qtyMatchedCount} of ${analysisProducts.length} products matched requested quantity.`,
      `${priceMatchedCount} of ${analysisProducts.length} products met target pricing.`,
      `Overall quantity compliance: ${qtyMatchPercentage}%`,
      `Overall pricing compliance: ${priceMatchPercentage}%`,
    ];
    let recommendationSummary = "";

if (
  qtyMatchPercentage === 100 &&
  priceMatchPercentage === 100
) {
  recommendationSummary =
    "All products satisfy quantity and pricing requirements. This vendor quote is recommended for approval.";
}
else if (
  qtyMatchPercentage >= 80 &&
  priceMatchPercentage >= 80
) {
  recommendationSummary =
    "Most products satisfy procurement requirements. Manual review is recommended before approval.";
}
else {
  recommendationSummary =
    "Multiple quantity or pricing mismatches were detected. This vendor quote is not recommended.";
}
    return NextResponse.json({
      success: true,

      report: {
        inputQuoteId: quoteId,

      recommendationSummary,
      
        parentQuoteId:
          quoteInfo?.ParentQuoteID || "",

        quoteId:
          quoteInfo?.QuoteId || "",

        quoteName:
          quoteInfo?.QuoteName || "",

        quoteNumber:
          quoteInfo?.QuoteNumber || "",

        quoteType:
          quoteInfo?.QuoteType || "",

        totalProducts:
          lines.length,

        totalAmount,

        qtyMatchPercentage,

        priceMatchPercentage,

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