export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_API_URL: string;
      APP_API_PORT: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_DATABASE: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
    }
  }
}
