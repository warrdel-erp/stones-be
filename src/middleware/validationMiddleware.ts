import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { AppError } from '../helper/appError';
import catchAsync from '../helper/asyncCatch';

export const validateRequest = (schema: ZodTypeAny) => {
    return catchAsync(async (req: Request, _: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                throw new AppError('Validation failed', 400, validationErrors);
            }

            throw new AppError('Internal server error during validation', 500);
        }
    });
}; 