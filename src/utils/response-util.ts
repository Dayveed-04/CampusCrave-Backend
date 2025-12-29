import {Response} from 'express';

interface ApiResponse<T> {
    sucess: boolean;
    message: string;
    data?: T;
}

export const sendSuccessResponse = <T>(
    res: Response, 
    message: string,
     data?: T,
     statusCode: number = 200
    )=>{
    const response: ApiResponse<T> = {
        sucess: true,
        message,
    };
    return res.status(statusCode).json(response);
};

export const sendErrorResponse = <T>(
    res: Response, 
    message: string,
     data?: T,
     statusCode: number = 400
    )=>{
    const response: ApiResponse<T> = {
        sucess: false,
        message,
    };
    return res.status(statusCode).json(response);
};