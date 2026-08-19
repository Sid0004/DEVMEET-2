import { Router } from "express";
import {
    loginUser,
    googleLoginUser,
    logoutUser,
    registerUser,
    getCurrentUser,
    refreshAccessToken,
    updateProfile,
    changePassword,
    completeOnboarding
} from "./user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/login").post(loginUser);
router.route("/google-login").post(googleLoginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateProfile);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/onboard").post(verifyJWT, completeOnboarding);

export default router;
