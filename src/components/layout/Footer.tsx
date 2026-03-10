import Link from "next/link";
import { BarChart3 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      {/* <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">SB Stocks</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A stock trading simulation platform. Practice trading with virtual funds in a risk-free environment.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Real-time Stock Data</li>
              <li>Virtual Trading</li>
              <li>Portfolio Management</li>
              <li>Watchlist</li>
              <li>Transaction History</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/auth/login" className="hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-primary transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              This is a simulation platform. No real money is involved. Stock prices are simulated and do not reflect actual market conditions.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SB Stocks. All rights reserved.</p>
        </div>
      </div> */}
    </footer>
  );
}
