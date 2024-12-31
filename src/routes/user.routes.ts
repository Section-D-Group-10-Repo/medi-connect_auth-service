import { Router } from "express";
import middleware from "../middleware";
import { Role } from "@prisma/client";
import {
  getUserByIdController,
  getUsersController,
  updateFlagsByUserIdController,
  updateProfileController,
} from "../controllers/user.controller";

const router = Router();

router.get(
  "/",
  middleware.auth.roleAuthenticationMiddleware([Role.ADMIN]),
  getUsersController
);

router.get("/service:/id", getUserByIdController);

router.get(
  "/:id",
  middleware.auth.roleAuthenticationMiddleware([Role.ADMIN]),
  getUserByIdController
);
router.patch(
  "/profile",
  middleware.auth.authenticationMiddleWare,
  updateProfileController
);

router.patch(
  "/flags/:id",
  middleware.auth.roleAuthenticationMiddleware([Role.ADMIN]),
  updateFlagsByUserIdController
);

export default router;
