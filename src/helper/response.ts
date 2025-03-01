import { Response } from "express";

export const ErrorResponse = (res: Response, statusCode: number, message: string, errorObj?: any) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errorObj || null, // Ensures errorObj is explicitly null if not provided
  });
};

type PaginationData = {
  page: number;
  limit: number;
  total: number;
};

export const SuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any,
  paginationData?: PaginationData
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    paginationData: paginationData && {
      ...paginationData,
      totalPages: Math.ceil(paginationData.total / paginationData.limit),
    },
  });
};
