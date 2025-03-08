import express from "express";
import {
  getAllInsurancePlans,
  getInsurancePlanById,
  createInsurancePlan,
  updateInsurancePlan,
  deleteInsurancePlan
} from "../app/controllers/insurance.controller.js";
import {
  authenticateUser,
  isAuthorizedUser,
} from "../app/middlewares/auth_middlewares.js";

const router = express.Router();

// Public routes
router.get("/", getAllInsurancePlans);
router.get("/:id", getInsurancePlanById);

// Protected routes - require authentication (admin only)
router.post(
  "/",
  // authenticateUser,
  // isAuthorizedUser,
  createInsurancePlan
);

router.put(
  "/:id",
  // authenticateUser,
  // isAuthorizedUser,
  updateInsurancePlan
);

// Delete route
router.delete(
  "/:id",
  // authenticateUser,
  // isAuthorizedUser,
  deleteInsurancePlan
);

export default router;
