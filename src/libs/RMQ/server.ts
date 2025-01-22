import { Channel, connect, Connection, ConsumeMessage } from "amqplib";
import { RMQMessageHandler } from "./message-handler";

const RMQConfig = {
  URL: "amqp://admin:password@localhost:5672",
  QUEUES: {
    RPC_QUEUE: "RPC_QUEUE",
  },
};

class RMQServerStub {
  private static instance: RMQServerStub;
  private isInitalized: boolean = false;
  private producer!: Producer;
  private consumer!: Consumer;
  private connection!: Connection;
  private productChannel!: Channel;
  private consumerChannel!: Channel;

  public static getInstance(): RMQServerStub {
    if (!RMQServerStub.instance) {
      RMQServerStub.instance = new RMQServerStub();
    }
    return RMQServerStub.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitalized) {
      return;
    }

    this.connection = await connect(RMQConfig.URL);

    // Create channels
    this.productChannel = await this.connection.createChannel();
    this.consumerChannel = await this.connection.createChannel();

    // Assert reply queue
    const { queue: RPCQueueName } = await this.consumerChannel.assertQueue(
      RMQConfig.QUEUES.RPC_QUEUE,
      {
        exclusive: true, // Auto-delete queue when connection is closed
      }
    );

    // Initialize consumer and producer
    this.consumer = new Consumer(this.consumerChannel, RPCQueueName);
    this.producer = new Producer(this.productChannel);

    // Start consuming messages
    this.consumer.consume();

    this.isInitalized = true;
  }

  public async produce(
    replyToQueueName: string,
    correlationId: string,
    data: Object
  ): Promise<void> {
    if (!this.isInitalized) await this.initialize();
    else await this.producer.produce(replyToQueueName, correlationId, data);
  }

  public async close(): Promise<void> {
    if (!this.isInitalized) {
      console.warn("Server stub RabbitMQ connection is not initialized.");
      return;
    }
    await this.productChannel.close();
    await this.consumerChannel.close();
    await this.connection.close();
    console.log("Server stub RabbitMQ connection closed.");
  }
}

export class Consumer {
  constructor(
    private readonly channel: Channel,
    private readonly RPCQueueName: string
  ) {}

  public async consume(): Promise<void> {
    console.log(
      `Starting server stub consumer for reply queue: ${this.RPCQueueName}`
    );
    await this.channel.consume(
      this.RPCQueueName,
      async (message: ConsumeMessage | null) => {
        if (!message) {
          console.warn("Server stub no message received from server stub.");
          return;
        }

        const { correlationId, replyTo } = message.properties;

        const operation = message.properties.headers!.operation;

        if (!correlationId || !replyTo)
          throw new Error(
            "Missing correlation ID or reply to properties from client stub."
          );

        // Perform message handlers
        const content = JSON.parse(message.content.toString());
        console.log("Received reply from client stub:", content);

        await RMQMessageHandler.MessageHandler.handle(
          operation,
          replyTo,
          correlationId,
          content
        );

        this.channel.ack(message);
      },
      {
        noAck: true,
      }
    );
  }
}

export class Producer {
  constructor(private readonly channel: Channel) {}

  public async produce(
    replyToQueueName: string,
    correlationId: string,
    data: Object
  ): Promise<void> {
    this.channel.sendToQueue(
      replyToQueueName,
      Buffer.from(JSON.stringify(data)),
      {
        correlationId,
      }
    );
    console.log(
      `Message sent to queue ${replyToQueueName} with correlationId ${correlationId} from server stub.`
    );
  }
}

export const RMQServerInstance = RMQServerStub.getInstance();

export default RMQServerInstance;
