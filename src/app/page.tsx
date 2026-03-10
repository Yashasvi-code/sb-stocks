"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "@/components/auth/LoginForm";
import { StockCard } from "@/components/stocks/StockCard";
import { TradingModal } from "@/components/trading/TradingModal";
import { StockForm } from "@/components/stocks/StockForm";
import { StockTable } from "@/components/stocks/StockTable";
import { PortfolioChart } from "@/components/charts/PortfolioChart";
import { StatsCard, PortfolioStats, TransactionStats } from "@/components/charts/StockChart";
import {
  Stock,
  PortfolioItem,
  WatchlistItem,
  Transaction,
} from "@/store";
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  History,
  Eye,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  balance?: number;
}

// get user data from session
const getSessionUser = (session: { user?: unknown } | null): SessionUser | null => {
  if (!session?.user) return null;
  return session.user as SessionUser;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "dashboard";
  const router = useRouter();
  const user = getSessionUser(session);

  // State
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<{
    totalInvested: number;
    totalCurrentValue: number;
    totalProfitLoss: number;
    totalProfitLossPercent: number;
  } | null>(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Trading Modal State
  const [tradingModalOpen, setTradingModalOpen] = useState(false);
  const [tradingType, setTradingType] = useState<"buy" | "sell">("buy");
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  // Admin State
  const [stockFormOpen, setStockFormOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  // Fetch functions
  const fetchStocks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (sectorFilter && sectorFilter !== "all") params.append("sector", sectorFilter);

      const response = await fetch(`/api/stocks?${params}`);
      const data = await response.json();
      setStocks(data.stocks || []);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    }
  }, [searchQuery, sectorFilter]);

  const fetchPortfolio = useCallback(async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/portfolio");
      const data = await response.json();
      setPortfolio(data.portfolio || []);
      setPortfolioSummary(data.summary || null);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    }
  }, [session]);

  const fetchWatchlist = useCallback(async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/watchlist");
      const data = await response.json();
      setWatchlist(data.watchlist || []);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    }
  }, [session]);

  const fetchTransactions = useCallback(async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, [session]);

  const seedDatabase = async () => {
    setIsSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchStocks();
    } catch (error) {
      console.error("Failed to seed database:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    if (session?.user) {
      fetchPortfolio();
      fetchWatchlist();
      fetchTransactions();
    }
  }, [session, fetchPortfolio, fetchWatchlist, fetchTransactions]);

  // Trading handlers
  const handleBuy = (stock: Stock) => {
    setSelectedStock(stock);
    setTradingType("buy");
    setTradingModalOpen(true);
  };

  const handleSell = (stock: Stock) => {
    setSelectedStock(stock);
    setTradingType("sell");
    setTradingModalOpen(true);
  };

  const handleTradeSuccess = () => {
    fetchPortfolio();
    fetchWatchlist();
    fetchTransactions();
  };

  // Watchlist handlers
  const addToWatchlist = async (stock: Stock) => {
    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockId: stock.id }),
      });
      fetchWatchlist();
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
    }
  };

  const removeFromWatchlist = async (stock: Stock) => {
    try {
      await fetch(`/api/watchlist?stockId=${stock.id}`, {
        method: "DELETE",
      });
      fetchWatchlist();
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  // Admin handlers
  const handleCreateStock = () => {
    setEditingStock(null);
    setStockFormOpen(true);
  };

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setStockFormOpen(true);
  };

  const handleDeleteStock = async (stockId: string) => {
    try {
      await fetch(`/api/stocks/${stockId}`, { method: "DELETE" });
      fetchStocks();
    } catch (error) {
      console.error("Failed to delete stock:", error);
    }
  };

  // Helpers
  const isInWatchlist = (stockId: string) =>
    watchlist.some((w) => w.stockId === stockId);

  const getOwnedQuantity = (stockId: string) =>
    portfolio.find((p) => p.stockId === stockId)?.quantity || 0;

  const uniqueSectors = [...new Set(stocks.map((s) => s.sector))];

  // Show loading state while checking session
if (status === "loading") {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" suppressHydrationWarning></div>
    </div>
  );
}

  // Not authenticated - show landing page with login
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-primary">SB Stocks</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Practice stock trading with $100,000 virtual funds in a risk-free
              environment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Real Market Data</h3>
              <p className="text-muted-foreground">
                Trade with simulated stocks based on real companies
              </p>
            </Card>
            <Card className="text-center p-6">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Track Portfolio</h3>
              <p className="text-muted-foreground">
                Monitor your investments and track performance
              </p>
            </Card>
            <Card className="text-center p-6">
              <History className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
              <p className="text-muted-foreground">
                Review all your trades and learn from your decisions
              </p>
            </Card>
          </div>

          <div className="max-w-md mx-auto">
            <LoginForm />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Portfolio Stats */}
        <div className="mb-8">
          <PortfolioStats
            portfolio={portfolio}
            balance={user?.balance || 0}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue={tabFromUrl} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Watchlist</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {uniqueSectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {stocks.length === 0 ? (
              <Card className="text-center p-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Stocks Available</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by seeding the database with sample stocks.
                </p>
                <Button onClick={seedDatabase} disabled={isSeeding}>
                  {isSeeding ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Seed Sample Stocks
                    </>
                  )}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocks.map((stock) => (
                  <StockCard
                    key={stock.id}
                    stock={stock}
                    onBuy={handleBuy}
                    onSell={handleSell}
                    onAddToWatchlist={addToWatchlist}
                    onRemoveFromWatchlist={removeFromWatchlist}
                    isInWatchlist={isInWatchlist(stock.id)}
                    ownedQuantity={getOwnedQuantity(stock.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Portfolio Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PortfolioChart portfolio={portfolio} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No holdings yet. Start trading to build your portfolio!
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {portfolio.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div>
                            <div className="font-semibold">{item.stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} shares @ ${item.averagePrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${item.currentValue.toFixed(2)}
                            </div>
                            <div
                              className={`text-sm flex items-center justify-end gap-1 ${
                                item.profitLoss >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {item.profitLoss >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {item.profitLoss >= 0 ? "+" : ""}
                              {item.profitLossPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {portfolioSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Total Invested
                      </div>
                      <div className="text-xl font-bold">
                        ${portfolioSummary.totalInvested.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Current Value
                      </div>
                      <div className="text-xl font-bold">
                        ${portfolioSummary.totalCurrentValue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Profit/Loss
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          portfolioSummary.totalProfitLoss >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {portfolioSummary.totalProfitLoss >= 0 ? "+" : "$"}
                        {portfolioSummary.totalProfitLoss.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Return</div>
                      <div
                        className={`text-xl font-bold ${
                          portfolioSummary.totalProfitLossPercent >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {portfolioSummary.totalProfitLossPercent >= 0 ? "+" : ""}
                        {portfolioSummary.totalProfitLossPercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Your Watchlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                {watchlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No stocks in your watchlist. Add stocks from the dashboard to
                    track them!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watchlist.map((item) => (
                      <StockCard
                        key={item.id}
                        stock={item.stock}
                        onBuy={handleBuy}
                        onSell={handleSell}
                        onAddToWatchlist={addToWatchlist}
                        onRemoveFromWatchlist={removeFromWatchlist}
                        isInWatchlist={true}
                        ownedQuantity={getOwnedQuantity(item.stockId)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <TransactionStats transactions={transactions} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions yet. Start trading to see your history!
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm">
                              {new Date(tx.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={tx.type === "buy" ? "default" : "destructive"}
                                className={
                                  tx.type === "buy" ? "bg-green-600" : ""
                                }
                              >
                                {tx.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {tx.stock.symbol}
                            </TableCell>
                            <TableCell>{tx.quantity}</TableCell>
                            <TableCell>${tx.price.toFixed(2)}</TableCell>
                            <TableCell
                              className={
                                tx.type === "buy" ? "text-red-500" : "text-green-500"
                              }
                            >
                              {tx.type === "buy" ? "-" : "+"}${tx.total.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {user?.role === "admin" && (
            <TabsContent value="admin" className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Stock Management</h2>
                  <p className="text-muted-foreground">
                    Add, edit, or remove stocks from the platform
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={seedDatabase} disabled={isSeeding} variant="outline">
                    {isSeeding ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Reseed Data
                  </Button>
                  <Button onClick={handleCreateStock}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stock
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <StockTable
                    stocks={stocks}
                    onEdit={handleEditStock}
                    onDelete={handleDeleteStock}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
      <Footer />

      {/* Trading Modal */}
      {selectedStock && (
        <TradingModal
          stock={selectedStock}
          type={tradingType}
          open={tradingModalOpen}
          onClose={() => {
            setTradingModalOpen(false);
            setSelectedStock(null);
          }}
          onSuccess={handleTradeSuccess}
          userBalance={user?.balance || 0}
          ownedQuantity={getOwnedQuantity(selectedStock.id)}
        />
      )}

      {/* Stock Form Modal */}
      <StockForm
        stock={editingStock}
        open={stockFormOpen}
        onClose={() => {
          setStockFormOpen(false);
          setEditingStock(null);
        }}
        onSuccess={fetchStocks}
      />
    </div>
  );
}
