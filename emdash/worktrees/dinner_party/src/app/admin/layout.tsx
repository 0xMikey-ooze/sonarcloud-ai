import Link from "next/link"
import { signOut } from "@/lib/auth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex gap-6">
              <Link href="/admin" className="font-semibold text-foreground hover:text-accent transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/restaurants" className="text-sm text-muted hover:text-foreground transition-colors">
                Restaurants
              </Link>
              <Link href="/admin/dinners" className="text-sm text-muted hover:text-foreground transition-colors">
                Dinner Parties
              </Link>
            </div>
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/admin/login" })
              }}
            >
              <button type="submit" className="text-sm text-muted hover:text-foreground transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
