"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BarChart3, User, LogOut, Settings, LayoutDashboard } from "lucide-react";

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  balance?: number;
}

export function Navbar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const user = session?.user as SessionUser | undefined;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SB Stocks</span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
              </div>
            ) : session ? (
              <>
                {/* All links point to home page with tabs */}
                {/* <nav className="hidden md:flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/?tab=portfolio"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                  >
                    Portfolio
                  </Link>
                  <Link
                    href="/?tab=watchlist"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                  >
                    Watchlist
                  </Link>
                  <Link
                    href="/?tab=transactions"
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                  >
                    Transactions
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/?tab=admin"
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                    >
                      Admin
                    </Link>
                  )}
                </nav> */}

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-primary">
                      ${user?.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                    </span>
                    <span className="text-xs text-muted-foreground">Virtual Balance</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-primary/20 hover:ring-primary/50 transition-all">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                            {user?.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                          <p className="text-xs leading-none text-muted-foreground capitalize">
                            {user?.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        {/* <Link href="/?tab=portfolio">
                          <User className="mr-2 h-4 w-4" />
                          Portfolio
                        </Link> */}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/login" })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}