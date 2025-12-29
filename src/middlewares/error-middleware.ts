import {Request,Response,NextFunction} from 'express';
import { AppError } from '../utils/appError';

export const globalErrorHandler = (
    err:Error,
    req:Request,
    res:Response,
    next:NextFunction
)=>{

    console.error('Error: ', err);
    let statusCode = 500;
    let status = 'error';
    let message = 'Something went wrong';


    if (err instanceof AppError){
        statusCode = err.statusCode;
        status= err.status;
        message = err.message;
    }

    res.status(statusCode).json({
        status,
        message
    });
}