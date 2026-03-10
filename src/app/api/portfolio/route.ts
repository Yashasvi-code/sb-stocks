import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch user's portfolio
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const portfolios = await db.portfolio.findMany({
      where: { userId: session.user.id },
      include: {
        stock: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate current values and profit/loss
    const portfolioWithStats = portfolios.map((p) => {
      const currentValue = p.stock.price * p.quantity;
      const investedValue = p.averagePrice * p.quantity;
      const profitLoss = currentValue - investedValue;
      const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

      return {
        ...p,
        currentValue,
        investedValue,
        profitLoss,
        profitLossPercent,
      };
    });

    // Calculate total portfolio value
    const totalInvested = portfolioWithStats.reduce((sum, p) => sum + p.investedValue, 0);
    const totalCurrentValue = portfolioWithStats.reduce((sum, p) => sum + p.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return NextResponse.json({
      portfolio: portfolioWithStats,
      summary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent,
      },
    });
  } catch (error) {
    console.error("Fetch portfolio error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}
