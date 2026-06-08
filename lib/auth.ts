import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7
  },

  providers: [
    // 🔵 Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🟢 Credentials Login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        phone: {},
        password: {},
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("User not found");

        const isValid = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!isValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          email: user.email,
          phone: user.phone,
          name: user.name,
          role:user.role
        };
      },
    }),
  ],

 callbacks: {
  async signIn({ user, account }) {
    await connectDB();

    if (account?.provider === "google") {
      const existing = await User.findOne({ email: user.email });

      if (!existing) {
        const newUser = await User.create({
          email: user.email,
          name: user.name,
          image: user.image,
          role:"user",
          provider: "google",
        });

        // attach mongo id to user object for jwt step 
        (user as any).id = newUser._id.toString();
        (user as any ).role=newUser.role.toString()
      } else {
        // attach existing mongo id
        (user as any).id = existing._id.toString();
        (user as any).role=existing.role.toString()
      }
    }

    return true;
  },

  async jwt({ token, user }) {
    if (user) {
      token.id = (user as any).id;
      token.role=(user as any).role
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
    (session.user as any).id = token.id as string;
    (session.user as any).role = token.role;

    }
    return session;
  },
}

 
};