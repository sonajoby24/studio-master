import { NextResponse } from "next/server";
import { seedFirestore } from "@/lib/seedData";

export async function GET() {
  try {
    await seedFirestore();

    return NextResponse.json({
      message: "Data seeded successfully",
    });
  } catch (error) {
    console.error("SEED ERROR:", error);

    return NextResponse.json(
      { error: "Seeding failed" },
      { status: 500 }
    );
  }
}