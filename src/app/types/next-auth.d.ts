import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      nickname: string | null;
      phone: string | null;
      token: string;
    } & DefaultSession["user"];
  }
}