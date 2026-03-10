import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all stocks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sector = searchParams.get("sector") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { symbol: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (sector) {
      where.sector = sector;
    }

    const stocks = await db.stock.findMany({
      where,
      orderBy: { symbol: "asc" },
    });

    return NextResponse.json({ stocks });
  } catch (error) {
    console.error("Fetch stocks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stocks" },
      { status: 500 }
    );
  }
}

// POST - Create new stock (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      symbol,
      name,
      price,
      marketCap = 0,
      sector = "Technology",
      description = "",
      change = 0,
      high52Week = 0,
      low52Week = 0,
      volume = 0,
    } = body;

    // Validation
    if (!symbol || !name || price === undefined) {
      return NextResponse.json(
        { error: "Symbol, name, and price are required" },
        { status: 400 }
      );
    }

    // Check if stock already exists
    const existingStock = await db.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (existingStock) {
      return NextResponse.json(
        { error: "Stock with this symbol already exists" },
        { status: 400 }
      );
    }

    const stock = await db.stock.create({
      data: {
        symbol: symbol.toUpperCase(),
        name,
        price: parseFloat(price),
        marketCap: parseFloat(marketCap),
        sector,
        description,
        change: parseFloat(change),
        high52Week: parseFloat(high52Week),
        low52Week: parseFloat(low52Week),
        volume: parseInt(volume),
      },
    });

    return NextResponse.json({ stock }, { status: 201 });
  } catch (error) {
    console.error("Create stock error:", error);
    return NextResponse.json(
      { error: "Failed to create stock" },
      { status: 500 }
    );
  }
}
