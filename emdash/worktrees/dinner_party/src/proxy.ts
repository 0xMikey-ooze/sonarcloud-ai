import { auth } from "@/lib/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isAdmin = nextUrl.pathname.startsWith("/admin")
  const isLoginPage = nextUrl.pathname === "/admin/login"
  const isAuthApi = nextUrl.pathname.startsWith("/api/auth")
  const isWebhook = nextUrl.pathname.startsWith("/api/webhooks")
  const isPublicEvent = nextUrl.pathname.startsWith("/events/")
  const isRsvpApi = nextUrl.pathname.startsWith("/api/rsvps")

  if (isAuthApi || isWebhook || isPublicEvent || isRsvpApi) return

  if (isLoginPage) {
    if (req.auth?.user) return Response.redirect(new URL("/admin", nextUrl))
    return
  }

  if (isAdmin && !req.auth?.user) {
    return Response.redirect(new URL("/admin/login", nextUrl))
  }
})

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
