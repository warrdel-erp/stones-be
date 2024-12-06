import * as clientService from '../services/clientServices.js';

export const register = async (req, res) => {
  try {

    const result = await clientService.register(req.body);
    res.status(200).send(result);

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({
      message: "Internal server error",
      error: error.message || error
    });
  }
};




export const getClientDetails = async (req, res) => {
  const { clientId } = req.query;

  try {
    if (!clientId) {
      return res.status(400).send("Missing clientId in query parameters");
    }
    const result = await clientService.getClientDetails({ clientId });

    if (!result) {
      return res.status(404).send("Client not found");
    }

    res.status(200).send(result);
  } catch (error) {
    console.error("Error in getting client details:", error);
    res.status(500).send("Internal Server Error");
  }
};



export const clientLocationCreate = async (req, res) => {
  try {
    const result = await clientService.clientLocationCreate(req.body);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error in adding client details:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const getClientLocations = async (req, res) => {
  try {
    const result = await clientService.getClientLocations(req.query);
    res.status(200).send(result);
  } catch (error) {
    console.error("Error in getting client details:", error);
    res.status(500).send("Internal Server Error");
  }
};