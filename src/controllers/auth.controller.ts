import { StatusCodes } from "http-status-codes";
import { COOKIE_EXPIRATION } from "../config";
import { db, jwt, passwordCrypt, zodErrorFmt } from "../libs";
import { asyncWrapper, RouteError, sendApiResponse } from "../utils";
import { authValidator } from "../validators";

export const verifyController = asyncWrapper(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    throw RouteError.Unauthorized("Authorization header not found.");

  const token = authHeader.split(" ")[1];

  if (!token) throw RouteError.Unauthorized("Token not found.");

  const payload = jwt.isValidToken<{
    _id: string;
  }>(token);

  if (!payload) throw RouteError.Unauthorized("Invalid token.");

  const user = await db.user.findUnique({
    where: { id: payload._id },
    include: { admin: true, doctor: true, patient: true },
  });

  if (!user) throw RouteError.Unauthorized("User not found.");

  return sendApiResponse({
    res,
    statusCode: StatusCodes.OK,
    success: true,
    message: "User data retrived successfully",
    result: user,
  });
});

export const adminSignUpController = asyncWrapper(async (req, res) => {
  const bodyValidation = authValidator.adminSignUpSchema.safeParse(req.body);

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existingUser = await db.user.findUnique({
    where: { email: bodyValidation.data.email },
  });

  if (existingUser) throw RouteError.BadRequest("Email already in use.");

  const existingPhoneNo = await db.user.findUnique({
    where: { phoneNumber: bodyValidation.data.phoneNumber },
  });

  if (existingPhoneNo)
    throw RouteError.BadRequest("Phone number already in use.");

  const hashedPassword = await passwordCrypt.hashPassword(
    bodyValidation.data.password
  );

  const user = await db.admin.create({
    data: {
      user: {
        create: {
          firstName: bodyValidation.data.firstName,
          lastName: bodyValidation.data.lastName,
          email: bodyValidation.data.email,
          phoneNumber: bodyValidation.data.phoneNumber,
          password: hashedPassword,
          role: "PENDING",
        },
      },
    },
    include: {
      user: true,
    },
  });

  const userDto = {
    firstName: user.user.firstName,
    lastName: user.user.lastName,
    email: user.user.email,
  };

  return sendApiResponse({
    res,
    statusCode: 200,
    success: true,
    message: "Admin signed up successfully",
    result: {
      user: userDto,
    },
  });
});

export const patientSignUpController = asyncWrapper(async (req, res) => {
  const bodyValidation = authValidator.patientSignUpSchema.safeParse(req.body);

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existingUser = await db.user.findUnique({
    where: { email: bodyValidation.data.email },
  });

  if (existingUser) throw RouteError.BadRequest("Email already in use.");

  const existingPhoneNo = await db.user.findUnique({
    where: { phoneNumber: bodyValidation.data.phoneNumber },
  });

  if (existingPhoneNo)
    throw RouteError.BadRequest("Phone number already in use.");

  const hashedPassword = await passwordCrypt.hashPassword(
    bodyValidation.data.password
  );

  const user = await db.patient.create({
    data: {
      dateOfBirth: bodyValidation.data.dateOfBirth,
      gender: bodyValidation.data.gender,
      user: {
        create: {
          firstName: bodyValidation.data.firstName,
          lastName: bodyValidation.data.lastName,
          email: bodyValidation.data.email,
          phoneNumber: bodyValidation.data.phoneNumber,
          password: hashedPassword,
          role: "PATIENT",
        },
      },
      flag: {
        create: {},
      },
    },
    include: {
      user: true,
    },
  });

  const userDto = {
    firstName: user.user.firstName,
    lastName: user.user.lastName,
    email: user.user.email,
  };
  return sendApiResponse({
    res,
    statusCode: 200,
    success: true,
    message: "Patient signed up successfully",
    result: {
      user: userDto,
    },
  });
});

export const doctorSignUpController = asyncWrapper(async (req, res) => {
  const bodyValidation = authValidator.doctorSignUpSchema.safeParse(req.body);
  const files = req.files;
  if (!files)
    throw RouteError.BadRequest("Error occured while uploading your profile");

  if (!("certificates" in files))
    throw RouteError.BadRequest("Doctor certificates are required");

  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existingUser = await db.user.findUnique({
    where: { email: bodyValidation.data.email },
  });

  if (existingUser) throw RouteError.BadRequest("Email already in use.");

  const existingPhoneNo = await db.user.findUnique({
    where: { phoneNumber: bodyValidation.data.phoneNumber },
  });

  if (existingPhoneNo)
    throw RouteError.BadRequest("Phone number already in use.");

  const hashedPassword = await passwordCrypt.hashPassword(
    bodyValidation.data.password
  );

  const user = await db.doctor.create({
    data: {
      specializations: bodyValidation.data.specializations.split(","),
      qualifications: bodyValidation.data.qualifications.split(","),
      yearsOfExperience: bodyValidation.data.yearsOfExperience,
      gender: bodyValidation.data.gender,
      profileImageUrl: `/uploads/doctors/profiles/${files["profile"][0].filename}`,
      certifications: files["certificates"].map(
        (certificate) => `/uploads/doctors/certificates/${certificate.filename}`
      ),
      user: {
        create: {
          firstName: bodyValidation.data.firstName,
          lastName: bodyValidation.data.lastName,
          email: bodyValidation.data.email,
          phoneNumber: bodyValidation.data.phoneNumber,
          password: hashedPassword,
          role: "DOCTOR",
        },
      },
      flag: {
        create: {},
      },
    },
    include: {
      user: true,
    },
  });

  const userDto = {
    firstName: user.user.firstName,
    lastName: user.user.lastName,
    email: user.user.email,
  };
  return sendApiResponse({
    res,
    statusCode: 200,
    success: true,
    message: "Doctor signed up successfully",
    result: {
      user: userDto,
    },
  });
});

export const signInController = asyncWrapper(async (req, res) => {
  const bodyValidation = authValidator.signInSchema.safeParse(req.body);
  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const existingUser = await db.user.findUnique({
    where: { email: bodyValidation.data.email },
  });

  if (!existingUser) throw RouteError.BadRequest("Invalid email or password");

  const isCorrectPassword = await passwordCrypt.verifyPassword(
    bodyValidation.data.password,
    existingUser.password
  );

  if (!isCorrectPassword)
    throw RouteError.BadRequest("Invalid email or password");

  const token = jwt.signToken({
    userId: existingUser.id,
    role: existingUser.role,
  });

  res.cookie("token", token, {
    httpOnly: true,
    signed: true,
    expires: COOKIE_EXPIRATION,
  });

  const { password, ...userDto } = existingUser;

  return sendApiResponse({
    res,
    statusCode: 200,
    success: true,
    message: "User signed up successfully",
    result: { user: userDto, token },
  });
});

export const changePasswordController = asyncWrapper(async (req, res) => {
  const bodyValidation = authValidator.changePasswordSchema.safeParse(req.body);
  if (!bodyValidation.success)
    throw RouteError.BadRequest(
      zodErrorFmt(bodyValidation.error)[0].message,
      zodErrorFmt(bodyValidation.error)
    );

  const user = req.user;
  if (!user) throw RouteError.Unauthorized("User is not authorized.");

  const existingUser = await db.user.findUnique({
    where: { id: user._id },
  });

  if (!existingUser) throw RouteError.NotFound("User does not exist.");

  const isCorrectPassword = await passwordCrypt.verifyPassword(
    bodyValidation.data.currentPassword,
    existingUser.password
  );

  if (!isCorrectPassword) throw RouteError.BadRequest("Wrong password");

  const newHashedPassword = await passwordCrypt.hashPassword(
    bodyValidation.data.newPassword
  );

  await db.user.update({
    where: { id: user._id },
    data: { password: newHashedPassword },
  });

  const { password, ...userDto } = existingUser;

  return sendApiResponse({
    res,
    statusCode: 200,
    success: true,
    message: "User password updated successfully",
    result: null,
  });
});
