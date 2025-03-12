import express from 'express';
import { getAllWithdrawRequests, requestWithdraw , deleteWithdrawRequest} from '../app/controllers/withdrawController.js';

const router= express.Router();


router.post("/:userId", requestWithdraw);
router.get("/withdraw-requests", getAllWithdrawRequests);
router.delete("/:requestId", deleteWithdrawRequest);

export default router;