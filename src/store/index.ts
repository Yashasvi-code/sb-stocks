import { create } from "zustand";

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  sector: string;
  description: string | null;
  change: number;
  high52Week: number;
  low52Week: number;
  volume: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  averagePrice: number;
  stock: Stock;
  currentValue: number;
  investedValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface Transaction {
  id: string;
  userId: string;
  stockId: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  date: string;
  stock: Stock;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  stockId: string;
  stock: Stock;
  createdAt: string;
}

interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

interface AppState {
  // User
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    balance: number;
  } | null;
  setUser: (user: AppState["user"]) => void;

  // Stocks
  stocks: Stock[];
  setStocks: (stocks: Stock[]) => void;
  selectedStock: Stock | null;
  setSelectedStock: (stock: Stock | null) => void;

  // Portfolio
  portfolio: PortfolioItem[];
  setPortfolio: (portfolio: PortfolioItem[]) => void;
  portfolioSummary: PortfolioSummary | null;
  setPortfolioSummary: (summary: PortfolioSummary | null) => void;

  // Watchlist
  watchlist: WatchlistItem[];
  setWatchlist: (watchlist: WatchlistItem[]) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Trading Modal
  tradingModalOpen: boolean;
  setTradingModalOpen: (open: boolean) => void;
  tradingType: "buy" | "sell";
  setTradingType: (type: "buy" | "sell") => void;
  tradingStock: Stock | null;
  setTradingStock: (stock: Stock | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Stocks
  stocks: [],
  setStocks: (stocks) => set({ stocks }),
  selectedStock: null,
  setSelectedStock: (stock) => set({ selectedStock: stock }),

  // Portfolio
  portfolio: [],
  setPortfolio: (portfolio) => set({ portfolio }),
  portfolioSummary: null,
  setPortfolioSummary: (summary) => set({ portfolioSummary: summary }),

  // Watchlist
  watchlist: [],
  setWatchlist: (watchlist) => set({ watchlist }),

  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),

  // UI State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Trading Modal
  tradingModalOpen: false,
  setTradingModalOpen: (open) => set({ tradingModalOpen: open }),
  tradingType: "buy",
  setTradingType: (type) => set({ tradingType: type }),
  tradingStock: null,
  setTradingStock: (stock) => set({ tradingStock: stock }),
}));
