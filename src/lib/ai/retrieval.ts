import { adminDb } from "@/lib/firebase-admin";

export async function retrieveRelevantData(
  query: string
) {

  const lowerQuery =
    query.toLowerCase();

  const data: any = {};

  try {

    // --------------------------
    // QUOTE SEARCH
    // --------------------------

    const quoteMatch =
      query.match(/0Q0[a-zA-Z0-9]+/);

    if (quoteMatch) {

      const quoteId =
        quoteMatch[0];

      const snapshot =
        await adminDb
          .collection("quotes")
          .get();

      snapshot.forEach((doc) => {

        const quote =
          doc.data();

        const parentQuoteId =
          quote?.QuoteInfo?.[0]
            ?.ParentQuoteID;

        const actualQuoteId =
          quote?.QuoteInfo?.[0]
            ?.QuoteId;

        if (
          parentQuoteId === quoteId ||
          actualQuoteId === quoteId
        ) {

          data.quote = {
            id: doc.id,
            ...quote,
          };

        }

      });

      return data;
    }

    // --------------------------
    // PRODUCT SEARCH
    // --------------------------

    const productMatch =
      query.match(/P\d+/i);

    if (productMatch) {

      const productId =
        productMatch[0];

      const snapshot =
        await adminDb
          .collection("products")
          .get();

      snapshot.forEach((doc) => {

        const product =
          doc.data();

        if (
          product.productId === productId ||
          doc.id === productId
        ) {

          data.product = {
            id: doc.id,
            ...product,
          };

        }

      });

      return data;
    }

    // --------------------------
    // VENDOR SEARCH
    // --------------------------

    const vendorMatch =
      query.match(/VEND-\d+/i);

    if (vendorMatch) {

      const vendorId =
        vendorMatch[0];

      const snapshot =
        await adminDb
          .collection("vendor")
          .get();

      snapshot.forEach((doc) => {

        const vendor =
          doc.data();

        if (
          vendor.vendorId === vendorId ||
          vendor.Vendor === vendorId ||
          doc.id === vendorId
        ) {

          data.vendor = {
            id: doc.id,
            ...vendor,
          };

        }

      });

      return data;
    }

    // --------------------------
    // ORDER SEARCH
    // --------------------------

    const orderMatch =
      query.match(/ORD\d+/i);

    if (orderMatch) {

      const orderId =
        orderMatch[0];

      const snapshot =
        await adminDb
          .collection("orders")
          .get();

      snapshot.forEach((doc) => {

        const order =
          doc.data();

        if (
          order.orderId === orderId ||
          doc.id === orderId
        ) {

          data.order = {
            id: doc.id,
            ...order,
          };

        }

      });

      return data;
    }

    // --------------------------
    // GENERAL PRODUCTS
    // --------------------------

    if (
      lowerQuery.includes("product") ||
      lowerQuery.includes("products") ||
      lowerQuery.includes("item")
    ) {

      const snapshot =
        await adminDb
          .collection("products")
          .limit(20)
          .get();

      data.products =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return data;
    }

    // --------------------------
    // GENERAL QUOTES
    // --------------------------

    if (
      lowerQuery.includes("quote") ||
      lowerQuery.includes("quotes")
    ) {

      const snapshot =
        await adminDb
          .collection("quotes")
          .limit(20)
          .get();

      data.quotes =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return data;
    }

    // --------------------------
    // GENERAL VENDORS
    // --------------------------

    if (
      lowerQuery.includes("vendor") ||
      lowerQuery.includes("supplier")
    ) {

      const snapshot =
        await adminDb
          .collection("vendor")
          .limit(20)
          .get();

      data.vendors =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return data;
    }

    // --------------------------
    // GENERAL ORDERS
    // --------------------------

    if (
      lowerQuery.includes("order")
    ) {

      const snapshot =
        await adminDb
          .collection("orders")
          .limit(20)
          .get();

      data.orders =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return data;
    }

    // --------------------------
    // DEFAULT
    // --------------------------

    data.message =
      "No matching Firebase records found.";

    return data;

  } catch (error) {

    console.error(
      "RETRIEVAL ERROR:",
      error
    );

    return {
      error:
        "Failed to retrieve Firebase data",
    };
  }
}