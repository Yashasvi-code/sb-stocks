"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Stock } from "@/store";
import { useAppStore } from "@/store";

interface TradingModalProps {
  stock: Stock;
  type: "buy" | "sell";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userBalance: number;
  ownedQuantity?: number;
}

export function TradingModal({
  stock,
  type,
  open,
  onClose,
  onSuccess,
  userBalance,
  ownedQuantity = 0,
}: TradingModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalCost = stock.price * quantity;
  const isBuy = type === "buy";

  const handleTrade = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/trading/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId: stock.id, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${type} stock`);
      } else {
        onSuccess();
        onClose();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const maxQuantity = isBuy
    ? Math.floor(userBalance / stock.price)
    : ownedQuantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBuy ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-500" />
                Buy {stock.symbol}
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-500" />
                Sell {stock.symbol}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {stock.name} - ${stock.price.toFixed(2)} per share
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Input
                id="quantity"
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(maxQuantity)}
              >
                Max
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isBuy ? "Available to buy" : "Available to sell"}: {maxQuantity} shares
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price per share:</span>
              <span>${stock.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span>Your Balance:</span>
            <span>${userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>

          {isBuy && totalCost > userBalance && (
            <Alert variant="destructive">
              <AlertDescription>Insufficient funds for this transaction</AlertDescription>
            </Alert>
          )}

          {!isBuy && quantity > ownedQuantity && (
            <Alert variant="destructive">
              <AlertDescription>You don&apos;t have enough shares to sell</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleTrade}
              disabled={
                isLoading ||
                (isBuy && totalCost > userBalance) ||
                (!isBuy && quantity > ownedQuantity) ||
                quantity <= 0
              }
              className={`flex-1 ${isBuy ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isBuy ? "Buy" : "Sell"} {quantity} Shares
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
