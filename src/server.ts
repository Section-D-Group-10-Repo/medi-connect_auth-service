import { createServer } from "http";
import app from "./app";
import { ENV } from "./config";
import CRON from "./cron";
import { registerService } from "./services";

const server = createServer(app);

const PORT = ENV.PORT;

server.listen(PORT, () => {
  registerService();
  CRON.announceServiceExistance.start();

  console.log("Server is running on port: ", PORT);
});
