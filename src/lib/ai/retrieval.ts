import { adminDb } from '@/lib/firebase-admin';

export async function retrieveRelevantData(
  query: string
) {

  const lowerQuery =
    query.toLowerCase();

  let data: any = {};

  // VENDORS

  if (
    lowerQuery.includes('vendor') ||
    lowerQuery.includes('supplier') ||
    lowerQuery.includes('cheapest') ||
    lowerQuery.includes('best')
  ) {

    const snapshot =
      await adminDb
        .collection('vendors')
        .get();

    data.vendors =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  // PRODUCTS

  if (
    lowerQuery.includes('product') ||
    lowerQuery.includes('laptop') ||
    lowerQuery.includes('monitor') ||
    lowerQuery.includes('item')
  ) {

    const snapshot =
      await adminDb
        .collection('products')
        .get();

    data.products =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  // QUOTES

  if (
    lowerQuery.includes('quote') ||
    lowerQuery.includes('pricing') ||
    lowerQuery.includes('price') ||
    lowerQuery.includes('cost')
  ) {

    const snapshot =
      await adminDb
        .collection('quotes')
        .get();

    data.quotes =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  // DEFAULT FALLBACK

  if (
    Object.keys(data).length === 0
  ) {

    const snapshot =
      await adminDb
        .collection('vendors')
        .get();

    data.vendors =
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  }

  return data;
}

