import * as opportunitiyService from '../services/opportunityServices.js';

//create opportunity
export const addOpportunity = async (req, res) => {
    try {
        const info = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await opportunitiyService.addOpportunity({ ...info, createdBy });
        res.status(200).json({
            status: 'success',
            message: 'Opportunity created successfully',
            data: result
        });
    } catch (error) {
        console.error("Error in adding opportunity:", error);
        res.status(500).send({ message: 'Failed to add opportunity.' });
    }
};

// get all account type and account sub type
export const getAllOpportunity = async (req, res) => {
    let { search } = req.query;
    const clientId = req.clientId;
    try {
        search = search || '';
        const result = await opportunitiyService.getAllOpportunity({ search, clientId });
        res.status(200).json({
            status: 'success',
            message: 'Opportunity list retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error("Error in getting all opportunities:", error);
        res.status(500).send({ message: 'Failed to retrieve opportunities.' });
    }
};

//get opportunity number
export const getOpportunityNumber = async (req, res) => {
    try {
        const clientId = req.clientId;
        const result = await opportunitiyService.getOpportunityNumber(clientId);
        res.status(200).json({
            status: 'success',
            message: 'Opportunity number retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error("Error in  opportunities:", error);
        res.status(500).send({ message: 'Failed to retrieve opportunities.' });
    }
};


//create selection sheet for opportunity
export const createSelectionSheet = async (req, res) => {
    try {
        const info = req.body;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await opportunitiyService.createSelectionSheet({ ...info, createdBy });
        res.status(201).send(result);
    } catch (error) {
        console.error("Error in opportunity selection sheet:", error);
        res.status(500).send({ message: 'Failed to add opportunity selection sheet.' });
    }
};

//get single opportunity details page
export const getOpportunityDetails = async (req, res) => {
    try {
        const data = req.query
        const clientId = req.clientId;
        const result = await opportunitiyService.getOpportunityDetails({ ...data, clientId });
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting opportunities details:", error);
        res.status(500).send({ message: 'Failed to retrieve opportunities details.' });
    }
};


//get productInventory
export const getProductInventory = async (req, res) => {
    try {
        const clientId = req.clientId;
        const page = parseInt(req.query.page) || 0;
        const limit = 10;
        const result = await opportunitiyService.getProductInventory(page, limit, clientId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting Product Inventory:", error);
        res.status(500).send("Internal Server Error");
    }
};


//get selection sheet details 
export const getSelectionSheetDetails = async (req, res) => {
    try {
        const selectionSheetId = req.query.selectionSheetId;
        const result = await opportunitiyService.getSelectionSheetDetails(selectionSheetId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in opportunity selection sheet:", error);
        res.status(500).send({ message: 'Failed to add opportunity selection sheet.' });
    }
};


//update selection sheet slabs 
export const updateSelectionSheet = async (req, res) => {
    try {
        const selectionSheetId = req.query.selectionSheetId;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const result = await opportunitiyService.updateSelectionSheet(selectionSheetId, createdBy);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in opportunity selection sheet:", error);
        res.status(500).send({ message: 'Failed to add opportunity selection sheet.' });
    }
};

//update selectionsheet to Salesorder 
export const convertSelectionSheetToSO = async (req, res) => {
    try {
        const selectionSheetId = req.query.selectionSheetId;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const clientId = req.clientId;
        const result = await opportunitiyService.convertSelectionSheetToSO(selectionSheetId, createdBy, clientId);
        res.status(200).json({
            status: 'success',
            message: 'Opportunity retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error("Error in opportunity selection sheet:", error);
        res.status(500).send({ message: 'Failed to add opportunity selection sheet.' });
    }
};

//convert opportunity to SO
export const convertOpportunityToSO = async (req, res) => {
    try {
        const opportunityId = req.query.opportunityId;
        const user = req.user;
        const createdBy = user.dataValues.id;
        const clientId = req.clientId;
        // const result = await opportunitiyService.convertOpportunityToSO(opportunityId,createdBy,clientId);
        const selectedSlabsData = req.body;
        const result = await opportunitiyService.convertOpportunityToSO(opportunityId, selectedSlabsData, createdBy, clientId);
        res.status(200).json({
            status: 'success',
            message: 'Opportunity converted to SO  successfully',
            data: result
        });
    } catch (error) {
        console.error("Error in opportunity to SO conversion:", error);
        res.status(500).send({ message: 'Error in opportunity to SO conversion.' });
    }
};