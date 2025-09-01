import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "./lib/mongodb";
import bcrypt from "bcryptjs";
import {
  type NextAuthConfig,
  type Session,
  type DefaultSession,
} from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      emailVerified: Date | null;
      createdAt: Date | null;
      updatedAt: Date | null;
      role?:
        | ("user" | "professional" | "admin" | "business_owner")[]
        | "user"
        | "professional"
        | "admin"
        | "business_owner"
        | null;
      isPremiumPersonal?: boolean;
      isPremiumProfessional?: boolean;
      activeContext?: "user" | "professional" | "admin" | "business";
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
    role?:
      | ("user" | "professional" | "admin" | "business_owner")[]
      | "user"
      | "professional"
      | "admin"
      | "business_owner"
      | null;
    isPremiumPersonal?: boolean;
    isPremiumProfessional?: boolean;
    activeContext?: "user" | "professional" | "admin" | "business";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    name: string | null;
    image: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
    role?:
      | ("user" | "professional" | "admin" | "business_owner")[]
      | "user"
      | "professional"
      | "admin"
      | "business_owner"
      | null;
    isPremiumPersonal?: boolean;
    isPremiumProfessional?: boolean;
    activeContext?: "user" | "professional" | "admin" | "business";
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const client = await clientPromise;
          const db = client.db();
          const now = new Date();

          // Sprawdź czy to konto Google nie jest już połączone z innym użytkownikiem
          if (account.providerAccountId) {
            const existingGoogleAccount = await db
              .collection("accounts")
              .findOne({
                provider: "google",
                providerAccountId: account.providerAccountId,
              });

            if (existingGoogleAccount) {
              // Sprawdź czy to konto Google jest połączone z innym użytkownikiem
              const existingUser = await db.collection("users").findOne({
                _id: existingGoogleAccount.userId,
              });

              if (
                existingUser &&
                existingUser.email?.toLowerCase() !== user.email?.toLowerCase()
              ) {
                console.error(
                  "Google account already connected to different user"
                );
                // Rzuć błąd OAuthAccountNotLinked
                throw new Error("OAuthAccountNotLinked");
              }
            }
          }

          const existingUser = await db
            .collection("users")
            .findOne({ email: user.email?.toLowerCase() });

          if (existingUser) {
            // Update Google account data
            await db.collection("users").updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  name: user.name,
                  image: user.image,
                  emailVerified: now,
                  updatedAt: now,
                  // Don't set role if it doesn't exist - let user choose
                },
              }
            );
          } else {
            // Create new user for Google account
            await db.collection("users").insertOne({
              email: user.email?.toLowerCase(),
              name: user.name,
              image: user.image,
              emailVerified: now,
              role: null, // No role assigned initially
              isPremiumPersonal: false,
              isPremiumProfessional: false,
              activeContext: null, // No context until role is selected
              createdAt: now,
              updatedAt: now,
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          // Jeśli to błąd OAuthAccountNotLinked, przepuść go dalej
          if (
            error instanceof Error &&
            error.message === "OAuthAccountNotLinked"
          ) {
            throw error;
          }
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session: sessionParam }) {
      // Podczas pierwszego logowania
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name ?? null;
        token.image = user.image ?? null;
        token.emailVerified = user.emailVerified ?? null;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
        token.role = user.role;
        token.isPremiumPersonal = user.isPremiumPersonal;
        token.isPremiumProfessional = user.isPremiumProfessional;
        token.activeContext = user.activeContext;
      } else {
        // Przy każdym refresh tokena, pobierz aktualną rolę z bazy danych
        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection("users").findOne({
            email: token.email?.toLowerCase(),
          });

          if (dbUser) {
            token.role = dbUser.role; // Keep null if role is null
            token.isPremiumPersonal = dbUser.isPremiumPersonal || false;
            token.isPremiumProfessional = dbUser.isPremiumProfessional || false;
            token.activeContext = dbUser.activeContext; // Keep null if activeContext is null
          }
        } catch (error) {
          console.error("Error fetching user role from DB:", error);
        }
      }

      // Gdy update() jest wywołane z frontendu
      if (trigger === "update" && sessionParam?.user) {
        console.log("JWT callback - update trigger:", sessionParam.user);
        token.name = sessionParam.user.name ?? token.name;
        token.email = sessionParam.user.email ?? token.email;
        token.image = sessionParam.user.image ?? token.image;
        console.log("JWT callback - updated token name:", token.name);
        console.log("JWT callback - updated token email:", token.email);
      }

      return token;
    },
    async session({ session, token }): Promise<Session> {
      session.user = {
        ...(session.user ?? {}),
        id: token.id as string,
        email: token.email as string,
        name: token.name as string | null,
        image: token.image as string | null,
        emailVerified: token.emailVerified as Date | null,
        createdAt: token.createdAt as Date,
        updatedAt: token.updatedAt as Date,
        role: token.role as
          | ("user" | "professional" | "admin" | "business_owner")[]
          | "user"
          | "professional"
          | "admin"
          | "business_owner"
          | undefined,
        isPremiumPersonal: token.isPremiumPersonal as boolean | undefined,
        isPremiumProfessional: token.isPremiumProfessional as
          | boolean
          | undefined,
        activeContext: token.activeContext as
          | "user"
          | "professional"
          | "admin"
          | "business"
          | undefined,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Jeśli URL zawiera błąd OAuthAccountNotLinked, przekieruj do strony błędów
      if (url.includes("error=OAuthAccountNotLinked")) {
        return `${baseUrl}/auth/error?error=OAuthAccountNotLinked`;
      }

      // Jeśli to callback URL, użyj go
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        const now = new Date();
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: now,
          createdAt: now,
          updatedAt: now,
        };
      },
    }),
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db();
          const user = await db
            .collection("users")
            .findOne({ email: (credentials.email as string).toLowerCase() });

          if (!user?.password) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: user.role,
            isPremiumPersonal: user.isPremiumPersonal,
            isPremiumProfessional: user.isPremiumProfessional,
            activeContext: user.activeContext,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig);
