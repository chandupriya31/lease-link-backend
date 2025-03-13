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

router.put("/:Id", updateInsurancePlan);


router.delete("/:Id", deleteInsurancePlan);

export default router;
