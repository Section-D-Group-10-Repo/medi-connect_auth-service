import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes";
import middlewares from "./middleware";
import { ENV } from "./config";
import path from "path";

const app = express();

// Registering middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(middlewares.limiter);
app.use(cookieParser(ENV.COOKIE_SECRET)); // Use a secret key for signing

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/", routes.authRouter);
app.use("/users", routes.userRouter);

// Error handling middleware
app.use(middlewares.routeErrorHandlingMiddleware);

export default app;
