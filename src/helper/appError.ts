export class AppError extends Error {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly errors?: string | string[] | object;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.errors = errors;
    // Error.captureStackTrace(this, this.constructor);
  }
}
