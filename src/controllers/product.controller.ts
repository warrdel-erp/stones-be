import { Request, Response } from "express";
import catchAsync from "../helper/asyncCatch";
import { addProduct } from "../services/product.service";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await addProduct(req.body);
  return res.status(201).json({ message: "Product created successfully", product });
});
