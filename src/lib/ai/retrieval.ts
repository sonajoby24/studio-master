import { adminDb } from "@/lib/firebase-admin";

export async function retrieveRelevantData(
  query: string
) {

  const lowerQuery =
    query.toLowerCase();

  let data: any = {};

  /* ================= PRODUCTS ================= */

  if (
    lowerQuery.includes("product") ||
    lowerQuery.includes("products") ||
    lowerQuery.includes("item")
  ) {

    const snapshot =
      await adminDb
        .collection("products")
        .get();

    data.products =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  /* ================= QUOTES ================= */

  if (
    lowerQuery.includes("quote") ||
    lowerQuery.includes("quotes") ||
    lowerQuery.includes("price")
  ) {

    const snapshot =
      await adminDb
        .collection("quotes")
        .get();

    data.quotes =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  /* ================= VENDOR ================= */

  if (
    lowerQuery.includes("vendor") ||
    lowerQuery.includes("supplier")
  ) {

    const snapshot =
      await adminDb
        .collection("vendor")
        .get();

    data.vendor =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  /* ================= ORDERS ================= */

  if (
    lowerQuery.includes("order")
  ) {

    const snapshot =
      await adminDb
        .collection("orders")
        .get();

    data.orders =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  /* ================= DEFAULT ================= */

  if (
    Object.keys(data).length === 0
  ) {

    const snapshot =
      await adminDb
        .collection("products")
        .get();

    data.products =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  return JSON.stringify(
    data,
    null,
    2
  );
}