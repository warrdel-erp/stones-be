import { Router } from 'express';
const router = Router();
import { userAuth } from '../middleware/authUser.js';
import { addOpportunity, convertOpportunityToSO, convertSelectionSheetToSO, createSelectionSheet, getAllOpportunity, getOpportunityDetails, getOpportunityNumber, getProductInventory, getSelectionSheetDetails, updateSelectionSheet } from '../controllers/opportunityController.js';

router.post('/', userAuth, addOpportunity);

router.get('/all',userAuth, getAllOpportunity);

router.get('/getOpNo', userAuth, getOpportunityNumber);

router.post('/selectionSheet', userAuth, createSelectionSheet);

router.get('/opportunityDetails', userAuth, getOpportunityDetails);

router.get('/getProductInventory', userAuth, getProductInventory);

router.get('/selectionSheetDetails', getSelectionSheetDetails);

router.patch('/selectionSheetUpdate',userAuth, updateSelectionSheet);

router.patch('/selectionSheettoSO', userAuth, convertSelectionSheetToSO);

router.patch('/opportunityToSO',userAuth, convertOpportunityToSO);


export default router;