"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { Stock } from "@/store";

interface StockCardProps {
  stock: Stock;
  onBuy: (stock: Stock) => void;
  onSell: (stock: Stock) => void;
  onAddToWatchlist: (stock: Stock) => void;
  onRemoveFromWatchlist: (stock: Stock) => void;
  isInWatchlist: boolean;
  ownedQuantity?: number;
}

export function StockCard({
  stock,
  onBuy,
  onSell,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
  ownedQuantity = 0,
}: StockCardProps) {
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">{stock.symbol}</CardTitle>
            <p className="text-sm text-muted-foreground truncate max-w-[180px]">
              {stock.name}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stock.sector}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
          <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
            <ChangeIcon className="h-4 w-4" />
            <span>
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="block">Market Cap</span>
            <span className="font-medium text-foreground">
              ${(stock.marketCap / 1e12).toFixed(2)}T
            </span>
          </div>
          <div>
            <span className="block">Volume</span>
            <span className="font-medium text-foreground">
              {(stock.volume / 1e6).toFixed(2)}M
            </span>
          </div>
          <div>
            <span className="block">52W High</span>
            <span className="font-medium text-foreground">
              ${stock.high52Week.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="block">52W Low</span>
            <span className="font-medium text-foreground">
              ${stock.low52Week.toFixed(2)}
            </span>
          </div>
        </div>

        {ownedQuantity > 0 && (
          <div className="text-sm bg-muted px-2 py-1 rounded">
            You own: <span className="font-semibold">{ownedQuantity} shares</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onBuy(stock)}
          >
            Buy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onSell(stock)}
            disabled={ownedQuantity === 0}
          >
            Sell
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              isInWatchlist
                ? onRemoveFromWatchlist(stock)
                : onAddToWatchlist(stock)
            }
          >
            {isInWatchlist ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
