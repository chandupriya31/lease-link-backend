import express from "express";
import { getUserProfile, profileUpdate, updatePassword } from "../app/controllers/user_controller.js";
import { authenticateUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();


router.put("/profile-update", authenticateUser, profileUpdate);

router.get("/profile", authenticateUser, getUserProfile);

router.put("/update", authenticateUser, updatePassword );
export default router;