import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { RouteError, sendApiResponse } from "../utils";
import { StatusCodes } from "http-status-codes";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";

const routeErrorHandlingMiddleware: ErrorRequestHandler = (
  err: any,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  // console.log(err);
  if (err instanceof RouteError)
    sendApiResponse({
      res,
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      result: err.result,
    });
  else if (
    err instanceof PrismaClientValidationError ||
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError
  ) {
    sendApiResponse({
      res,
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: err.message,
      result: err.name,
    });
  } else
    sendApiResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: err.message,
      result: err.data || null,
    });
};

export default routeErrorHandlingMiddleware;
