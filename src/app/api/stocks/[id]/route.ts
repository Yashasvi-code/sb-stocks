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

// GET - Fetch single stock
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stock = await db.stock.findUnique({
      where: { id },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Fetch stock error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}

// PUT - Update stock (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as SessionUser).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const stock = await db.stock.update({
      where: { id },
      data: {
        ...body,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        marketCap: body.marketCap !== undefined ? parseFloat(body.marketCap) : undefined,
        change: body.change !== undefined ? parseFloat(body.change) : undefined,
        high52Week: body.high52Week !== undefined ? parseFloat(body.high52Week) : undefined,
        low52Week: body.low52Week !== undefined ? parseFloat(body.low52Week) : undefined,
        volume: body.volume !== undefined ? parseInt(body.volume) : undefined,
      },
    });

    return NextResponse.json({ stock });
  } catch (error) {
    console.error("Update stock error:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}

// DELETE - Delete stock (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as SessionUser).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await db.stock.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Stock deleted successfully" });
  } catch (error) {
    console.error("Delete stock error:", error);
    return NextResponse.json(
      { error: "Failed to delete stock" },
      { status: 500 }
    );
  }
}
