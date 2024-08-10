export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_API_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
    }
  }
}
