import axios from "axios";
import { ENV } from "../config";
import { SERVICE_ADDRESS, SERVICE_NAME } from "../constants";
import { handleTC, logger } from "../utils";

export const registerService = async () => {
  const [response] = await handleTC.handleAsync(
    axios.post<{
      success: boolean;
      message: string;
      result: any;
    }>(`${ENV.DISCOVER_SERVER_URL}/register`, {
      name: SERVICE_NAME.AUTH_SERVICE,
      port: ENV.PORT,
      address: SERVICE_ADDRESS,
    })
  );

  if (!response || !response.data) logger.warn("Error registering service");
  else if (!response.data.success) logger.error(response.data.message);
  else logger.info(response.data.message);
};

export const serviceHeartbeat = async () => {
  const [response] = await handleTC.handleAsync(
    axios.patch<{
      success: boolean;
      message: string;
      result: any;
    }>(`${ENV.DISCOVER_SERVER_URL}/heartbeat`, {
      name: SERVICE_NAME.AUTH_SERVICE,
      port: ENV.PORT,
      address: SERVICE_ADDRESS,
    })
  );

  if (!response || !response.data)
    logger.warn("Error while sending heartbeat.");
  else if (!response.data.success) logger.error(response.data.message);
  else logger.info(response.data.message);
};

 