import cron from "node-cron";
import { serviceHeartbeat } from "../services";

const announceServiceExistance = cron.schedule(
  "*/2 * * * *",
  async () => {
    console.log("Running serviceHeartbeat task");
    serviceHeartbeat();
  },
  {
    scheduled: false,
  }
);

const CRON = {
  announceServiceExistance,
};

export default CRON;
