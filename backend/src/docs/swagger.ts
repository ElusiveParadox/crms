import swaggerJSDoc from "swagger-jsdoc";
import { env } from "../config/env";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRMS API",
      version: "1.0.0",
      description: "Campus Resource Management System API"
    },
    servers: [
      {
        url: env.BACKEND_URL
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ["./src/controllers/*.ts"] 
});