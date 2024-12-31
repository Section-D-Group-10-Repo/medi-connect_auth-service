import { Router } from "express";
import {
  adminSignUpController,
  changePasswordController,
  doctorSignUpController,
  patientSignUpController,
  signInController,
  verifyController,
} from "../controllers/auth.controller";
import middleware from "../middleware";

const router = Router();

router.get("/verify", verifyController);
router.post("/patients/sign-up", patientSignUpController);
router.post(
  "/doctors/sign-up",
  middleware.uploaders.doctorUploader.fields([
    { name: "profile" },
    {
      name: "certificates",
    },
  ]),
  doctorSignUpController
);
router.post("/admins/sign-up", adminSignUpController);
router.post("/sign-in", signInController);

router.patch(
  "/change-password",
  middleware.auth.authenticationMiddleWare,
  changePasswordController
);


export default router;
