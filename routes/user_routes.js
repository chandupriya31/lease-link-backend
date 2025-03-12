import express from "express";

import { getUserProfile, getUsers, profileUpdate, updateUser } from "../app/controllers/user_controller.js";
import { authenticateUser, isAuthorizedUser } from "../app/middlewares/auth_middlewares.js";

const router = express.Router();


router.put("/profile-update", authenticateUser, profileUpdate);

router.get("/profile", authenticateUser, getUserProfile);

router.put("/update", authenticateUser, updatePassword );
router.get('/users', getUsers);
router.put('/:id', authenticateUser, isAuthorizedUser, updateUser);

export default router;