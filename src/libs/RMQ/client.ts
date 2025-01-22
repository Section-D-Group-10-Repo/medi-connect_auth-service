import { Channel, connect, Connection, ConsumeMessage } from "amqplib";
import { randomUUID } from "crypto";
import RMQMessageHandler from "./message-handler";
import EventEmitter from "events";

const RMQConfig = {
  URL: "amqp://admin:password@localhost:5672",
  QUEUES: {
    RPC_QUEUE: "RPC_QUEUE",
  },
};

class RMQClientStub {
  private static instance: RMQClientStub;
  private isInitalized: boolean = false;
  private producer!: Producer;
  private consumer!: Consumer;
  private connection!: Connection;
  private productChannel!: Channel;
  private consumerChannel!: Channel;
  private eventEmitter!: EventEmitter;

  public static getInstance(): RMQClientStub {
    if (!RMQClientStub.instance) {
      RMQClientStub.instance = new RMQClientStub();
    }
    return RMQClientStub.instance;
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
    const { queue: replyQueueName } = await this.consumerChannel.assertQueue(
      "",
      {
        exclusive: true, // Auto-delete queue when connection is closed
      }
    );

    this.eventEmitter = new EventEmitter();

    // Initialize consumer and producer
    this.consumer = new Consumer(
      this.consumerChannel,
      replyQueueName,
      this.eventEmitter
    );
    this.producer = new Producer(
      this.productChannel,
      replyQueueName,
      this.eventEmitter
    );

    // Start consuming messages
    this.consumer.consume();

    this.isInitalized = true;
  }

  // Sends a message to the RPC queue.
  public async produce(
    operation: typeof RMQMessageHandler.Operation,
    data: Object
  ): Promise<void> {
    if (!this.isInitalized) await this.initialize();
    else await this.producer.produce(operation, data);
  }

  public async close(): Promise<void> {
    if (!this.isInitalized) {
      console.warn("Client stub RabbitMQ connection is not initialized.");
      return;
    }
    await this.productChannel.close();
    await this.consumerChannel.close();
    await this.connection.close();
    console.log("Client stub RabbitMQ connection closed.");
  }
}

class Consumer {
  constructor(
    private readonly channel: Channel,
    private readonly replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  public async consume(): Promise<void> {
    console.log(
      `Starting client stub consumer for reply queue: ${this.replyQueueName}`
    );
    await this.channel.consume(
      this.replyQueueName,
      (message: ConsumeMessage | null) => {
        if (!message) {
          console.warn("Client stub no message received.");
          return;
        }

        const data = JSON.parse(message.content.toString());

        console.log("Client stub received reply:", data);

        this.eventEmitter.emit(message.properties.correlationId, data);

        // Acknowledge the message to prevent re-delivery
        this.channel.ack(message);
      },
      {
        noAck: true,
      }
    );
  }
}

export class Producer {
  constructor(
    private readonly channel: Channel,
    private readonly replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  public async produce(
    operation: typeof RMQMessageHandler.Operation,
    data: Object
  ): Promise<Object> {
    const correlationId = randomUUID();
    this.channel.sendToQueue(
      RMQConfig.QUEUES.RPC_QUEUE,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyQueueName,
        correlationId,
        headers: {
          operation: operation,
        },
      }
    );
    console.log(
      `Message sent to queue ${RMQConfig.QUEUES.RPC_QUEUE} with correlationId ${correlationId} from server stub.`
    );

    return new Promise((resolve, _) => {
      this.eventEmitter.once(correlationId, (data) => {
        console.log(
          `Received response for correlationId ${correlationId}: from server stub.`,
          data
        );

        resolve(data);
      });
    });
  }
}

export const RMQClientInstance = RMQClientStub.getInstance();

export default RMQClientInstance;
