import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import client from "./lib/mongodb";
import authConfig from "./auth.config";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  adapter: MongoDBAdapter(client),
  pages: authConfig.pages,
  callbacks: authConfig.callbacks,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>
      ) {
        try {
          const email = credentials?.email as string;
          const password = credentials?.password as string;

          if (!email || !password) {
            return null;
          }

          await client.connect();
          const db = client.db();
          const user = await db
            .collection("users")
            .findOne({ email: email.toLowerCase() });

          if (!user) return null;

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
});
