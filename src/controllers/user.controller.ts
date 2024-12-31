import { StatusCodes } from "http-status-codes";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { queryValidator, userValidator } from "../validators";
import { db, passwordCrypt, zodErrorFmt } from "../libs";
import { Doctor, Patient } from "@prisma/client";

export const getUsersController = asyncWrapper(async (req, res) => {
  const users = await db.user.findMany({
    include: {
      admin: true,
      doctor: true,
      patient: true,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrived successfully",
    result: users,
  });
});

export const getUserByIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("User ID not provided or invalid.")
    .safeParse(req.params);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  const user = await db.user.findUnique({
    where: {
      id: queryParamValidation.data.id,
    },
    include: {
      admin: true,
      doctor: true,
      patient: true,
    },
  });

  if (!user) throw RouteError.NotFound("User not found with the provide ID.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User retrived successfully",
    result: user,
  });
});

export const updateProfileController = asyncWrapper(async (req, res) => {
  const bodyValidation = userValidator.updateProfile.safeParse(req.body);
  const tokenPayload = req.user!;

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existingUser = await db.user.findUnique({
    where: {
      id: tokenPayload._id,
    },
  });

  if (!existingUser)
    throw RouteError.NotFound("User not found with the provide token.");

  const isCorrectPassword = passwordCrypt.verifyPassword(
    bodyValidation.data.password,
    existingUser.password
  );

  if (!isCorrectPassword)
    throw RouteError.Unauthorized("Invalid password provided.");

  const updatedUser = await db.user.update({
    where: {
      id: tokenPayload._id,
    },
    data: {
      firstName: bodyValidation.data.firstName,
      lastName: bodyValidation.data.lastName,
      phoneNumber: bodyValidation.data.phoneNumber,
    },
  });

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User profile updated successfully",
    result: updatedUser,
  });
});

export const updateFlagsByUserIdController = asyncWrapper(async (req, res) => {
  const queryParamValidation = queryValidator
    .queryParamIDValidator("User ID not provided or invalid.")
    .safeParse(req.params);
  const bodyValidation = userValidator.updateFlags.safeParse(req.body);

  if (!queryParamValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(queryParamValidation.error)[0].message,
      zodErrorFmt(queryParamValidation.error)
    );

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existingUser = await db.user.findUnique({
    where: {
      id: queryParamValidation.data.id,
    },
  });

  if (!existingUser)
    throw RouteError.NotFound("User not found with the provide ID.");

  let user: Doctor | Patient;

  if (existingUser.role === "DOCTOR")
    user = await db.doctor.update({
      where: {
        userId: queryParamValidation.data.id,
      },
      data: {
        flag: {
          update: {
            data: { ...bodyValidation.data },
          },
        },
      },
      include: { flag: true },
    });
  else if (existingUser.role === "PATIENT")
    user = await db.patient.update({
      where: {
        userId: queryParamValidation.data.id,
      },
      data: {
        flag: {
          update: {
            data: { ...bodyValidation.data },
          },
        },
      },
      include: { flag: true },
    });
  else throw RouteError.BadRequest("Invalid user role.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User flag updated successfully",
    result: user,
  });
});
