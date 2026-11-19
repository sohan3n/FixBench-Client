import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "./mongodb";

const hasGoogleOAuth =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
  process.env.GOOGLE_CLIENT_ID !== "your_google_client_id";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ].filter(Boolean),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  ...(hasGoogleOAuth
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      area: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false, // Locked from client input; upgraded via Stripe webhook only
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const rawRole = (user as Record<string, unknown>).role;
          // Server-side guard: only 'customer' or 'technician' allowed on signup
          const safeRole =
            rawRole === "customer" || rawRole === "technician"
              ? rawRole
              : "customer";

          return {
            data: {
              ...user,
              role: safeRole,
              phone:
                typeof (user as Record<string, unknown>).phone === "string"
                  ? (user as Record<string, unknown>).phone
                  : "",
              area:
                typeof (user as Record<string, unknown>).area === "string"
                  ? (user as Record<string, unknown>).area
                  : "",
              bio:
                typeof (user as Record<string, unknown>).bio === "string"
                  ? (user as Record<string, unknown>).bio
                  : "",
              plan: "free",
            },
          };
        },
      },
    },
  },

  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role:
            ((user as Record<string, unknown>).role as string) || "customer",
        }),
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;