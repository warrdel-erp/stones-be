import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import * as clientService from "../services/client.service";
import { SuccessResponse } from "../helper/response";

export const registerClientHandler = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.registerClient(req.body);
  SuccessResponse(res, 201, "Client registered successfully", client);
});

/**
 * Controller to get all clients with pagination.
 * Supports optional search filtering.
 */
export const getClients = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  // Fetch paginated clients list
  const result = await clientService.fetchAllClients(Number(page), Number(limit), search as string);

  SuccessResponse(res, 200, "Clients retrieved successfully", result.clients, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
});

/**
 * Controller to update an existing client.
 * Updates the client details based on the provided ID and body.
 */
export const updateClient = catchAsync(async (req, res) => {
  const clientId = Number(req.params.id);
  const updateData = req.body;

  // Attempt to update the client
  const updatedClient = await clientService.modifyClient(clientId, updateData);

  if (!updatedClient) {
    return res.status(404).json({
      success: false,
      message: "Client not found or update failed",
    });
  }

  return SuccessResponse(res, 200, "Vendor updated successfully", updatedClient);
});

/**
 * Public controller to permanently delete a client's account.
 * Expects { email, password } in the request body.
 * The client must provide valid credentials to confirm the deletion.
 * Input is validated upstream by Zod middleware.
 */
import { AuthRequest } from "../middleware/authMiddleware";

export const getMyQrCodeHandler = catchAsync(async (req: AuthRequest, res: Response) => {
  const clientId = req.user?.clientId;
  if (!clientId) {
    return res.status(400).json({ success: false, message: "Client ID not found" });
  }
  const data = await clientService.getClientQrCode(clientId);
  return SuccessResponse(res, 200, "Client QR Code retrieved successfully", data);
});

export const deleteClientAccountHandler = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  await clientService.deleteClientAccount(email, password);

  return SuccessResponse(res, 200, "Account deleted successfully", null);
});