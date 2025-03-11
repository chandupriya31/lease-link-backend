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

router.post("/", createInsurancePlan);

router.put("/:id", updateInsurancePlan);

// Delete route
router.delete("/:id", deleteInsurancePlan);

export default router;
