import { Request, Response } from "express";
import { registerVendor } from "../services/vendor.service";
import catchAsync from "../helper/asyncCatch";
import { SuccessResponse } from "../helper/response";

/**
 * Controller to handle vendor creation.
 */
export const createVendorController = catchAsync(
  async (req: Request, res: Response) => {
    const vendorData = req.body;

    // Call service function
    const newVendor = await registerVendor(vendorData);

    return SuccessResponse(res, 201, "Vendor created successfully.", newVendor);
  }
);
