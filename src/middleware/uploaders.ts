import multer from "multer";
import path from "path";
import { Request } from "express";
import { fsUtils, RouteError } from "../utils";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];

export enum DOCTOR_UPLOAD_FIELDNAME {
  Profile = "profile",
  Certificates = "certificates",
}

const doctorStorage = multer.diskStorage({
  destination: async (_, file, cb) => {
    if (file.size === 0) cb(null, "");
    const destinationPath =
      file.fieldname === DOCTOR_UPLOAD_FIELDNAME.Profile
        ? path.resolve(path.join("uploads", "doctors", "profiles"))
        : path.resolve(path.join("uploads", "doctors", "certificates")); // project_directory/uploads/profiles
    const { success } = await fsUtils.createDirectory(destinationPath);
    cb(
      success
        ? null
        : RouteError.InternalServerError(
            "Error occured while creating a folder for profile images!"
          ),
      destinationPath
    );
  },
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${path.extname(file.originalname)}`);
  },
});

const doctorFilter = (
  _: Request,
  file: Express.Multer.File,
  cb: (error: any, status: boolean) => void
) => {
  const allowedExtensions =
    file.fieldname === DOCTOR_UPLOAD_FIELDNAME.Profile
      ? IMAGE_EXTENSIONS
      : [".pdf"];

  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(extension))
    cb(RouteError.BadRequest("Unsupported format"), false);
  else cb(null, true);
};

const doctorUploader = multer({
  fileFilter: doctorFilter,
  storage: doctorStorage,
});

export default {
  doctorUploader,
};
