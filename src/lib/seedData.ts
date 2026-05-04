import { adminDb } from "@/lib/firebase-admin";

export async function seedFirestore() {
  try {
    /* ================= MASTER ================= */
    await adminDb.collection("masterQuotes").doc("M1").set({
      bomId: "M1",
      projectName: "Vehicle Service Kit",
      expectedDate: "2026-05-01",
      products: [
        { name: "Brake Pad", quantity: 4, unit: "pcs", spec: "Ceramic" },
        { name: "Engine Oil", quantity: 5, unit: "litre", spec: "5W-30" },
        { name: "Oil Filter", quantity: 1, unit: "pcs", spec: "Standard" },
        { name: "Air Filter", quantity: 1, unit: "pcs", spec: "Dust Control" },
        { name: "Clutch Plate", quantity: 1, unit: "pcs", spec: "Heavy Duty" },
        { name: "Spark Plug", quantity: 4, unit: "pcs", spec: "NGK" },
        { name: "Coolant", quantity: 2, unit: "litre", spec: "Green" },
        { name: "Battery", quantity: 1, unit: "pcs", spec: "12V" },
      ],
    });

    /* ================= TRANSACTION ================= */
    await adminDb.collection("transactionQuotes").doc("T1").set({
      transactionId: "T1",
      masterQuoteId: "M1",
      vendors: [
        {
          vendor: "vendor A",
          rating: 4.5,
          deliveryDays: 2,
          expectedDate: "2026-05-04",
          products: [
            { name: "Brake Pad", price: 1100 },
            { name: "Engine Oil", price: 2500 },
            { name: "Oil Filter", price: 400 },
            { name: "Air Filter", price: 600 },
            { name: "Clutch Plate", price: 2000 },
            { name: "Spark Plug", price: 800 },
            { name: "Coolant", price: 700 },
            { name: "Battery", price: 4500 },
          ],
        },
        {
          vendor: "vendor B",
          rating: 4.2,
          deliveryDays: 4,
          expectedDate: "2026-05-01",
          products: [
            { name: "Brake Pad", price: 1000 },
            { name: "Engine Oil", price: 2600 },
            { name: "Oil Filter", price: 450 },
            { name: "Air Filter", price: 650 },
            { name: "Clutch Plate", price: 2100 },
            { name: "Spark Plug", price: 750 },
            { name: "Coolant", price: 720 },
            { name: "Battery", price: 4300 },
          ],
        },
        {
          vendor: "vendor C",
          rating: 3.5,
          deliveryDays: 3,
          expectedDate: "2026-05-01",
          products: [
            { name: "Brake Pad", price: 1150 },
            { name: "Engine Oil", price: 2400 },
            { name: "Oil Filter", price: 420 },
            { name: "Air Filter", price: 580 },
            { name: "Clutch Plate", price: 2050 },
            { name: "Spark Plug", price: 820 },
            { name: "Coolant", price: 710 },
            { name: "Battery", price: 4400 },
          ],
        },
      ],
    });

    console.log("✅ Data inserted");
  } catch (err) {
    console.error("❌ Seed error:", err);
    throw err;
  }
}