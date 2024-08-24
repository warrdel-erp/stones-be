import * as clientService from '../services/clientServices.js';

export const register = async (req, res) => {
  try {
    const { clientName, clientPassword, clientEmail, clientLocation } = req.body;

    if (!clientName || !clientPassword || !clientEmail) {
      return res.status(400).send("Missing required fields");
    }

    const result = await clientService.register({ clientName, clientPassword, clientEmail, clientLocation });
    res.status(200).send(result);

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ 
      message: "Internal server error", 
      error: error.message || error 
    });
  }
};
