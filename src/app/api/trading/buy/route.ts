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

// POST - Buy stock
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

    const totalCost = stock.price * quantity;

    if (user.balance < totalCost) {
      return NextResponse.json(
        { error: `Insufficient funds. Required: $${totalCost.toFixed(2)}, Available: $${user.balance.toFixed(2)}` },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: user.balance - totalCost },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          stockId: stock.id,
          type: "buy",
          quantity,
          price: stock.price,
          total: totalCost,
        },
      });

      const existingPortfolio = await tx.portfolio.findUnique({
        where: {
          userId_stockId: {
            userId: user.id,
            stockId: stock.id,
          },
        },
      });

      if (existingPortfolio) {
        const totalQuantity = existingPortfolio.quantity + quantity;
        const newAveragePrice =
          (existingPortfolio.averagePrice * existingPortfolio.quantity + totalCost) /
          totalQuantity;

        await tx.portfolio.update({
          where: {
            userId_stockId: {
              userId: user.id,
              stockId: stock.id,
            },
          },
          data: {
            quantity: totalQuantity,
            averagePrice: newAveragePrice,
          },
        });
      } else {
        await tx.portfolio.create({
          data: {
            userId: user.id,
            stockId: stock.id,
            quantity,
            averagePrice: stock.price,
          },
        });
      }

      return transaction;
    });

    return NextResponse.json({
      message: `Successfully purchased ${quantity} shares of ${stock.symbol}`,
      transaction: result,
    });
  } catch (error) {
    console.error("Buy stock error:", error);
    return NextResponse.json(
      { error: "Failed to buy stock" },
      { status: 500 }
    );
  }
}