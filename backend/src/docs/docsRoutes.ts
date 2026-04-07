import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";
import { swaggerSpec } from "./swagger";

const router = Router();

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.get(
  "/redoc",
  redoc({
    title: "CRMS API Docs",
    specUrl: "/docs.json"
  })
);

router.get("/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

export default router;