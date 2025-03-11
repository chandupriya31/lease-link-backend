import express from "express";
import { getUserProfile, getUsers, profileUpdate } from "../app/controllers/user_controller.js";
import { authenticateUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();


router.put("/profile-update", authenticateUser, profileUpdate);

router.get("/profile", authenticateUser, getUserProfile);

router.get('/users', getUsers);

export default router;