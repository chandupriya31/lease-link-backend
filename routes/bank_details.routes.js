
import express from 'express';
import { addBankDetails, deleteBankDetails, getDetails, getDetailsById, updateDetails } from '../app/controllers/bank_details.controller.js';
const router = express.Router();

router.post('/add-details', addBankDetails);
router.get('/bank-details', getDetails);
router.get('/:id', getDetailsById);
router.put('/:id', updateDetails);
router.delete('/:id', deleteBankDetails);

export default router;