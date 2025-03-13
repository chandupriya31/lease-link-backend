import { createAddress, getAddressById, getAllAddresses, upload } from "../app/controllers/address.controller.js";

import express from "express";

const router = express.Router();

// Add upload middleware to handle file uploads
router.post("/",  upload.single('proof_document'), createAddress);
router.get("/user/:user_id", getAddressById);
router.get("/", getAllAddresses);

export default router;