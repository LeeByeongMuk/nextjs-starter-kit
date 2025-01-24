export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_API_URL: string;
      APP_API_PORT: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
    }
  }
}
