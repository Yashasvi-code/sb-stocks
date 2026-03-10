import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  balance?: number;
}

// GET - Fetch user's watchlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const userId = (session.user as SessionUser).id;

    const watchlist = await db.watchlist.findMany({
      where: { userId },
      include: {
        stock: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Fetch watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const userId = (session.user as SessionUser).id;
    const body = await request.json();
    const { stockId } = body;

    if (!stockId) {
      return NextResponse.json(
        { error: "Stock ID is required" },
        { status: 400 }
      );
    }

    const stock = await db.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    const existing = await db.watchlist.findUnique({
      where: {
        userId_stockId: {
          userId,
          stockId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Stock already in watchlist" },
        { status: 400 }
      );
    }

    const watchlistEntry = await db.watchlist.create({
      data: {
        userId,
        stockId,
      },
      include: { stock: true },
    });

    return NextResponse.json({
      message: `${stock.symbol} added to watchlist`,
      watchlistEntry,
    });
  } catch (error) {
    console.error("Add to watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

// DELETE - Remove stock from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const userId = (session.user as SessionUser).id;
    const { searchParams } = new URL(request.url);
    const stockId = searchParams.get("stockId");

    if (!stockId) {
      return NextResponse.json(
        { error: "Stock ID is required" },
        { status: 400 }
      );
    }

    await db.watchlist.delete({
      where: {
        userId_stockId: {
          userId,
          stockId,
        },
      },
    });

    return NextResponse.json({
      message: "Stock removed from watchlist",
    });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}