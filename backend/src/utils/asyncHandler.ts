import { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncHandler = (reqHandler: (req: Request, res: Response, next: NextFunction) => Promise<any> | any): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next)).catch((err) => next(err));
    }
}

export { asyncHandler };
