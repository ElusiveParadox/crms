import dotenv from "dotenv";

dotenv.config();

function getEnvVariable(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} must be defined`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  JWT_SECRET: getEnvVariable("JWT_SECRET"),
  DATABASE_URL: getEnvVariable("DATABASE_URL"),
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5001",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
