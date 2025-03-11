import { createAddress, getAddressById } from "../app/controllers/address.controller.js";
import express from "express";

const router = express.Router();


router.post("/", createAddress);


router.get("/:user_id", getAddressById);

export default router;