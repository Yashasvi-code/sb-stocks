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

// POST - Sell stock
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
    const { stockId, quantity } = body;

    if (!stockId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid stock or quantity" },
        { status: 400 }
      );
    }

    const stock = await db.stock.findUnique({
      where: { id: stockId },
    });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const portfolio = await db.portfolio.findUnique({
      where: {
        userId_stockId: {
          userId: user.id,
          stockId: stock.id,
        },
      },
    });

    if (!portfolio || portfolio.quantity < quantity) {
      return NextResponse.json(
        { error: `Insufficient shares. You have ${portfolio?.quantity || 0} shares of ${stock.symbol}` },
        { status: 400 }
      );
    }

    const totalValue = stock.price * quantity;

    const result = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: user.balance + totalValue },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          stockId: stock.id,
          type: "sell",
          quantity,
          price: stock.price,
          total: totalValue,
        },
      });

      const newQuantity = portfolio.quantity - quantity;

      if (newQuantity === 0) {
        await tx.portfolio.delete({
          where: {
            userId_stockId: {
              userId: user.id,
              stockId: stock.id,
            },
          },
        });
      } else {
        await tx.portfolio.update({
          where: {
            userId_stockId: {
              userId: user.id,
              stockId: stock.id,
            },
          },
          data: {
            quantity: newQuantity,
          },
        });
      }

      return transaction;
    });

    return NextResponse.json({
      message: `Successfully sold ${quantity} shares of ${stock.symbol}`,
      transaction: result,
    });
  } catch (error) {
    console.error("Sell stock error:", error);
    return NextResponse.json(
      { error: "Failed to sell stock" },
      { status: 500 }
    );
  }
}