import RMQServerStub from "./server";

enum Operation {
  NOTIFY = "NOTIFY",
}

type MessageResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const sendMessage = <T>(message: MessageResponse<T>) => {
  return message;
};

class MessageHandler {
  static async handle(
    operation: Operation,
    replyToQueueName: string,
    correlationId: string,
    data: object
  ) {
    let response = {};
    console.log("MessageHandler data: ", { data });
    switch (operation) {
      case Operation.NOTIFY:
        response = {
          success: true,
          message: "Notification sent successfully.",
        };
        break;
      default:
        response = {
          success: false,
          message: `Invalid operation: ${operation}`,
        };
    }

    await RMQServerStub.produce(replyToQueueName, correlationId, response);
  }
}

export const RMQMessageHandler = {
  Operation,
  sendMessage,
  MessageHandler,
};

export default RMQMessageHandler;
