"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { PortfolioItem, Transaction } from "@/store";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-1 mt-1">
            {trend && (
              <Badge
                variant={trend === "up" ? "default" : "destructive"}
                className={`text-xs ${
                  trend === "up" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {trendValue}
              </Badge>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PortfolioStatsProps {
  portfolio: PortfolioItem[];
  balance: number;
}

export function PortfolioStats({ portfolio, balance }: PortfolioStatsProps) {
  const stats = useMemo(() => {
    const totalInvested = portfolio.reduce((sum, p) => sum + p.investedValue, 0);
    const totalCurrentValue = portfolio.reduce(
      (sum, p) => sum + p.currentValue,
      0
    );
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
    const totalValue = balance + totalCurrentValue;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercent,
      totalValue,
    };
  }, [portfolio, balance]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Portfolio Value"
        value={`$${stats.totalValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Cash Balance"
        value={`$${balance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Invested Value"
        value={`$${stats.totalCurrentValue.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`}
        trend={stats.totalProfitLoss >= 0 ? "up" : "down"}
        trendValue={`${Math.abs(stats.totalProfitLossPercent).toFixed(2)}%`}
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Total Profit/Loss"
        value={`$${Math.abs(stats.totalProfitLoss).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`}
        description={stats.totalProfitLoss >= 0 ? "Total profit" : "Total loss"}
        trend={stats.totalProfitLoss >= 0 ? "up" : "down"}
        icon={
          stats.totalProfitLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )
        }
      />
    </div>
  );
}

interface TransactionStatsProps {
  transactions: Transaction[];
}

export function TransactionStats({ transactions }: TransactionStatsProps) {
  const stats = useMemo(() => {
    const buys = transactions.filter((t) => t.type === "buy");
    const sells = transactions.filter((t) => t.type === "sell");

    const totalBought = buys.reduce((sum, t) => sum + t.total, 0);
    const totalSold = sells.reduce((sum, t) => sum + t.total, 0);

    return {
      totalTransactions: transactions.length,
      totalBuys: buys.length,
      totalSells: sells.length,
      totalBought,
      totalSold,
    };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Transactions"
        value={stats.totalTransactions.toString()}
        icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Total Buys"
        value={stats.totalBuys.toString()}
        description={`$${stats.totalBought.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} invested`}
        icon={<TrendingUp className="h-4 w-4 text-green-500" />}
      />
      <StatsCard
        title="Total Sells"
        value={stats.totalSells.toString()}
        description={`$${stats.totalSold.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })} withdrawn`}
        icon={<TrendingDown className="h-4 w-4 text-red-500" />}
      />
      <StatsCard
        title="Net Flow"
        value={`$${Math.abs(stats.totalBought - stats.totalSold).toLocaleString(
          "en-US",
          { minimumFractionDigits: 2 }
        )}`}
        description={
          stats.totalBought > stats.totalSold ? "Net invested" : "Net withdrawn"
        }
        trend={stats.totalBought > stats.totalSold ? "up" : "down"}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
