import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).trim().toLowerCase()
        const password = credentials.password as string

        const user = await db.adminUser.findUnique({ where: { email } })
        if (!user) return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isAdmin = nextUrl.pathname.startsWith("/admin")
      const isLoginPage = nextUrl.pathname === "/admin/login"
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth")

      if (isAuthApi) return true
      if (isLoginPage) return !auth?.user ? true : Response.redirect(new URL("/admin", nextUrl))
      if (isAdmin) return !!auth?.user
      return true
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})
