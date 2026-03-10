import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST - Seed initial stocks
export async function POST() {
  try {
    const stocks = [
      {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 178.52,
        marketCap: 2800000000000,
        sector: "Technology",
        description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.",
        change: 1.25,
        high52Week: 199.62,
        low52Week: 124.17,
        volume: 58234567,
      },
      {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 141.80,
        marketCap: 1800000000000,
        sector: "Technology",
        description: "Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.",
        change: -0.45,
        high52Week: 153.78,
        low52Week: 102.21,
        volume: 23456789,
      },
      {
        symbol: "MSFT",
        name: "Microsoft Corporation",
        price: 378.91,
        marketCap: 2750000000000,
        sector: "Technology",
        description: "Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.",
        change: 2.15,
        high52Week: 384.30,
        low52Week: 245.61,
        volume: 19876543,
      },
      {
        symbol: "AMZN",
        name: "Amazon.com, Inc.",
        price: 178.25,
        marketCap: 1850000000000,
        sector: "Consumer Cyclical",
        description: "Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores.",
        change: 0.87,
        high52Week: 189.77,
        low52Week: 118.35,
        volume: 45678901,
      },
      {
        symbol: "TSLA",
        name: "Tesla, Inc.",
        price: 248.50,
        marketCap: 790000000000,
        sector: "Consumer Cyclical",
        description: "Tesla, Inc. designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems.",
        change: -2.34,
        high52Week: 299.29,
        low52Week: 152.37,
        volume: 112345678,
      },
      {
        symbol: "META",
        name: "Meta Platforms, Inc.",
        price: 505.95,
        marketCap: 1300000000000,
        sector: "Technology",
        description: "Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family.",
        change: 3.45,
        high52Week: 542.81,
        low52Week: 274.38,
        volume: 15678901,
      },
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        price: 875.35,
        marketCap: 2150000000000,
        sector: "Technology",
        description: "NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.",
        change: 4.56,
        high52Week: 974.00,
        low52Week: 373.56,
        volume: 45678234,
      },
      {
        symbol: "JPM",
        name: "JPMorgan Chase & Co.",
        price: 195.67,
        marketCap: 560000000000,
        sector: "Financial Services",
        description: "JPMorgan Chase & Co. operates as a financial services company worldwide.",
        change: 0.34,
        high52Week: 205.88,
        low52Week: 135.19,
        volume: 8765432,
      },
      {
        symbol: "V",
        name: "Visa Inc.",
        price: 279.42,
        marketCap: 570000000000,
        sector: "Financial Services",
        description: "Visa Inc. operates as a payments technology company worldwide.",
        change: 0.67,
        high52Week: 290.96,
        low52Week: 227.68,
        volume: 6543210,
      },
      {
        symbol: "JNJ",
        name: "Johnson & Johnson",
        price: 156.89,
        marketCap: 380000000000,
        sector: "Healthcare",
        description: "Johnson & Johnson researches, develops, manufactures, and sells various products in the healthcare field worldwide.",
        change: -0.23,
        high52Week: 175.97,
        low52Week: 144.95,
        volume: 7654321,
      },
      {
        symbol: "WMT",
        name: "Walmart Inc.",
        price: 165.23,
        marketCap: 445000000000,
        sector: "Consumer Defensive",
        description: "Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide.",
        change: 0.45,
        high52Week: 173.38,
        low52Week: 143.32,
        volume: 8901234,
      },
      {
        symbol: "PG",
        name: "The Procter & Gamble Company",
        price: 162.78,
        marketCap: 385000000000,
        sector: "Consumer Defensive",
        description: "The Procter & Gamble Company provides branded consumer packaged goods worldwide.",
        change: 0.12,
        high52Week: 168.98,
        low52Week: 141.45,
        volume: 5432109,
      },
      {
        symbol: "DIS",
        name: "The Walt Disney Company",
        price: 112.45,
        marketCap: 205000000000,
        sector: "Communication Services",
        description: "The Walt Disney Company operates as an entertainment company worldwide.",
        change: -1.23,
        high52Week: 123.74,
        low52Week: 86.28,
        volume: 12345678,
      },
      {
        symbol: "NFLX",
        name: "Netflix, Inc.",
        price: 628.90,
        marketCap: 270000000000,
        sector: "Communication Services",
        description: "Netflix, Inc. provides entertainment services. It offers TV series, documentaries, feature films, and mobile games.",
        change: 1.89,
        high52Week: 639.00,
        low52Week: 344.73,
        volume: 4321098,
      },
      {
        symbol: "KO",
        name: "The Coca-Cola Company",
        price: 62.34,
        marketCap: 270000000000,
        sector: "Consumer Defensive",
        description: "The Coca-Cola Company manufactures, markets, and sells various nonalcoholic beverages worldwide.",
        change: 0.08,
        high52Week: 66.64,
        low52Week: 52.28,
        volume: 15678901,
      },
    ];

    let created = 0;
    for (const stock of stocks) {
      const existing = await db.stock.findUnique({
        where: { symbol: stock.symbol },
      });
      if (!existing) {
        await db.stock.create({ data: stock });
        created++;
      }
    }

    // Create an admin user
    const existingAdmin = await db.user.findUnique({
      where: { email: "admin@sbstocks.com" },
    });

    if (!existingAdmin) {
      const bcrypt = await import("bcryptjs");
      await db.user.create({
        data: {
          name: "Admin User",
          email: "admin@sbstocks.com",
          password: await bcrypt.hash("admin123", 12),
          role: "admin",
          balance: 1000000.0,
        },
      });
    }

    return NextResponse.json({
      message: `Seeded ${created} new stocks`,
      totalStocks: stocks.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
