import express from "express"
import type { Router } from "express"
import { apiRouter } from "./api"

/**
 * Mounts the unified API router under /api.
 * This is a TypeScript-only module to describe the public API surface.
 * The runtime server can import the JS-compiled version or mount analogous JS router.
 */
export function mountApi(app: any): Router {
  const router = express.Router()
  router.use("/", apiRouter)
  app.use("/api", router)
  return router
}

export default mountApi
