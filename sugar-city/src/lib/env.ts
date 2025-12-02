import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        // Clerk
        CLERK_SECRET_KEY: z.string().min(1),

        // Stripe
        STRIPE_SECRET_KEY: z.string().min(1),
        STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),

        // Internal auth for server-only endpoints
        ADMIN_API_KEY: z.string().min(1).optional(),

        // Firebase Admin
        FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
        FIREBASE_PROJECT_ID: z.string().min(1),
        FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
        FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),

        // Upstash Redis (Rate Limiting)
        UPSTASH_REDIS_REST_URL: z.string().url().optional(),
        UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

        // Resend (Email)
        RESEND_API_KEY: z.string().min(1).optional(),

        // Bird (SMS & WhatsApp)
        BIRD_API_KEY: z.string().min(1).optional(),

        // Tremendous
        TREMENDOUS_API_KEY: z.string().min(1).optional(),
        TREMENDOUS_API_BASE: z.string().url().optional(),

        // Sentry
        SENTRY_DSN: z.string().url().optional(),
        SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

        // Logging
        LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

        // Node environment
        NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    },
    client: {
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
        NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
        NEXT_PUBLIC_APP_URL: z.string().url().optional(),
        // Contact information
        NEXT_PUBLIC_CONTACT_PHONE: z.string().min(1).optional(),
        NEXT_PUBLIC_CONTACT_EMAIL: z.string().email().optional(),
    },
    runtimeEnv: {
        // Server
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        ADMIN_API_KEY: process.env.ADMIN_API_KEY,
        FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID?.trim(),
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL?.trim(),
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        BIRD_API_KEY: process.env.BIRD_API_KEY,
        TREMENDOUS_API_KEY: process.env.TREMENDOUS_API_KEY,
        TREMENDOUS_API_BASE: process.env.TREMENDOUS_API_BASE,
        SENTRY_DSN: process.env.SENTRY_DSN,
        SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
        LOG_LEVEL: process.env.LOG_LEVEL,
        NODE_ENV: process.env.NODE_ENV,

        // Client
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
        NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    },
});
