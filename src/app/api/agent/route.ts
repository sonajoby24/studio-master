import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { masterId, transactionId } = await req.json();

    // ✅ Fetch using ADMIN SDK
    const masterSnap = await adminDb
      .collection("masterQuotes")
      .doc(masterId)
      .get();

    const transSnap = await adminDb
      .collection("transactionQuotes")
      .doc(transactionId)
      .get();

    if (!masterSnap.exists || !transSnap.exists) {
      return NextResponse.json(
        { error: "Data not found" },
        { status: 404 }
      );
    }

    // 🤖 Run agent
    const result = await runAgent({
      masterQuote: masterSnap.data(),
      transactionQuote: transSnap.data(),
    });

    // ✅ Store result (optional)
    try {
      await adminDb
        .collection("analysisResults")
        .doc(`${masterId}_${transactionId}`)
        .set({
          masterId,
          transactionId,
          ...result,
          createdAt: new Date(),
        });
    } catch (dbError) {
      console.error("FIREBASE SAVE ERROR:", dbError);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong in API" },
      { status: 500 }
    );
  }
}