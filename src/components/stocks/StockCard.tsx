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

  return (
    <Card className="card-hover bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-primary">{stock.symbol}</CardTitle>
            <p className="text-sm text-muted-foreground truncate max-w-[180px]">
              {stock.name}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs bg-secondary/50 border border-border/50"
          >
            {stock.sector}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-secondary/30 rounded-md p-2">
            <span className="block text-muted-foreground">Market Cap</span>
            <span className="font-semibold">
              ${(stock.marketCap / 1e12).toFixed(2)}T
            </span>
          </div>
          <div className="bg-secondary/30 rounded-md p-2">
            <span className="block text-muted-foreground">Volume</span>
            <span className="font-semibold">
              {(stock.volume / 1e6).toFixed(2)}M
            </span>
          </div>
          <div className="bg-secondary/30 rounded-md p-2">
            <span className="block text-muted-foreground">52W High</span>
            <span className="font-semibold text-emerald-400">
              ${stock.high52Week.toFixed(2)}
            </span>
          </div>
          <div className="bg-secondary/30 rounded-md p-2">
            <span className="block text-muted-foreground">52W Low</span>
            <span className="font-semibold text-rose-400">
              ${stock.low52Week.toFixed(2)}
            </span>
          </div>
        </div>

        {ownedQuantity > 0 && (
          <div className="text-sm bg-primary/10 border border-primary/30 text-primary px-3 py-2 rounded-md text-center">
            You own: <span className="font-bold">{ownedQuantity} shares</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            onClick={() => onBuy(stock)}
          >
            Buy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-rose-500/50 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            onClick={() => onSell(stock)}
            disabled={ownedQuantity === 0}
          >
            Sell
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`${isInWatchlist ? "text-accent" : "text-muted-foreground"} hover:text-primary`}
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