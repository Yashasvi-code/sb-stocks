"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stock } from "@/store";
import { Loader2 } from "lucide-react";

interface StockFormProps {
  stock?: Stock | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const sectors = [
  "Technology",
  "Financial Services",
  "Healthcare",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Communication Services",
  "Energy",
  "Industrial",
  "Utilities",
  "Real Estate",
  "Basic Materials",
];

export function StockForm({ stock, open, onClose, onSuccess }: StockFormProps) {
  const [formData, setFormData] = useState({
    symbol: stock?.symbol || "",
    name: stock?.name || "",
    price: stock?.price?.toString() || "",
    marketCap: stock?.marketCap?.toString() || "0",
    sector: stock?.sector || "Technology",
    description: stock?.description || "",
    change: stock?.change?.toString() || "0",
    high52Week: stock?.high52Week?.toString() || "0",
    low52Week: stock?.low52Week?.toString() || "0",
    volume: stock?.volume?.toString() || "0",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!stock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const url = isEdit ? `/api/stocks/${stock.id}` : "/api/stocks";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          symbol: formData.symbol.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save stock");
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Stock" : "Add New Stock"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the stock information"
              : "Add a new stock to the platform"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                placeholder="AAPL"
                required
                disabled={isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="150.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Apple Inc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) =>
                  setFormData({ ...formData, sector: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketCap">Market Cap ($)</Label>
              <Input
                id="marketCap"
                type="number"
                value={formData.marketCap}
                onChange={(e) =>
                  setFormData({ ...formData, marketCap: e.target.value })
                }
                placeholder="2800000000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="change">Change (%)</Label>
              <Input
                id="change"
                type="number"
                step="0.01"
                value={formData.change}
                onChange={(e) =>
                  setFormData({ ...formData, change: e.target.value })
                }
                placeholder="1.25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="high52Week">52W High</Label>
              <Input
                id="high52Week"
                type="number"
                step="0.01"
                value={formData.high52Week}
                onChange={(e) =>
                  setFormData({ ...formData, high52Week: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low52Week">52W Low</Label>
              <Input
                id="low52Week"
                type="number"
                step="0.01"
                value={formData.low52Week}
                onChange={(e) =>
                  setFormData({ ...formData, low52Week: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                type="number"
                value={formData.volume}
                onChange={(e) =>
                  setFormData({ ...formData, volume: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Company description..."
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `${isEdit ? "Update" : "Create"} Stock`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
