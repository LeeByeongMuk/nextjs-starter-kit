import { Response } from 'express';

export class CustomError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export function handleErrorResponse(err: unknown, res: Response) {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message,
    });
  } else if (err instanceof Error) {
    return res.status(500).json({
      ok: false,
      message: err.message || 'Internal Server Error',
    });
  } else {
    return res.status(500).json({
      ok: false,
      message: 'An unknown error occurred',
    });
  }
}

export function handleError(err: unknown) {
  if (err instanceof CustomError) {
    throw err;
  } else {
    throw new CustomError('Internal Server Error', 500);
  }
}
