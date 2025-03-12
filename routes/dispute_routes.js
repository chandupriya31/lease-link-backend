import express from "express"
const router = express.Router()
import { getAllDisputes, getDisputeById, createDispute, updateDisputeStatus, deleteDispute } from "../app/controllers/dispute.controller.js"
router.get("/",getAllDisputes)
router.get("/:id",getDisputeById)
router.post("/",createDispute)
router.put("/:id",updateDisputeStatus)
router.delete("/:id",deleteDispute)
export default router