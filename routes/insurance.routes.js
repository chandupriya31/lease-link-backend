import express from "express";
import {
  getAllInsurancePlans,
  getInsurancePlanIdsByUserId,
  createInsurancePlan,
  updateInsurancePlan,
  deleteInsurancePlan
} from "../app/controllers/insurance.controller.js";
import {
  authenticateUser,
  isAuthorizedUser,
} from "../app/middlewares/auth_middlewares.js";

const router = express.Router();


router.get("/", getAllInsurancePlans);

router.get("/:userId", getInsurancePlanIdsByUserId);

router.post("/", createInsurancePlan);

router.put("/:id", updateInsurancePlan);


router.delete("/:id", deleteInsurancePlan);

export default router;
