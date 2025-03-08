import express from "express"
const router = express.Router()
import contactUsValidator from "../app/validators/query_validation.js"
import {checkSchema} from "express-validator"
import { createQuery,getQueryById,getAllQuery } from "../app/controllers/query_controller.js"

router.post("/create", checkSchema(contactUsValidator),createQuery)

router.get("/query/:id",getQueryById)

router.get("/queries",getAllQuery)

export default  router