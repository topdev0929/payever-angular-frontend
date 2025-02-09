import { Channel, Connection } from 'amqplib';
import * as amqplib from 'amqplib';

export class RabbitMqService {
  private static connection: Connection;

  private static async getConnection(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await amqplib.connect(process.env.RABBITMQ_URL ?? '');
    }

    return this.connection;
  }

  public static async createChannel(): Promise<Channel> {
    const connection = await this.getConnection();

    return connection.createChannel();
  }

  public static async establishConnection(): Promise<void> {
    await this.getConnection();
  }
}
