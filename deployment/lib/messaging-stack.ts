import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import { TaggedStack } from "./tagged-stack";
import * as env from "../env";

const names = {
  incomingEventsQueue: env.queues.IncomingEventsQueue,
  incomingEventsDLQ: env.queues.IncomingEventsDLQ,
};

const outgoingDynamoDBDLQ = env.queues.OutgoingDynamoDbDLQ;

class IncomingQueues extends cdk.Construct {
  incomingEventsQueue: sqs.Queue;

  constructor(scope: cdk.Construct, id: string, props?: {}) {
    super(scope, id);

    const incomingEventsDLQ = new sqs.Queue(this, names.incomingEventsDLQ, {
      queueName: names.incomingEventsDLQ,
      retentionPeriod: cdk.Duration.hours(6),
    } as any);

    this.incomingEventsQueue = new sqs.Queue(this, names.incomingEventsQueue, {
      queueName: names.incomingEventsQueue,
      retentionPeriod: cdk.Duration.hours(1),
      receiveMessageWaitTime: cdk.Duration.seconds(20),
      deadLetterQueue: {
        queue: incomingEventsDLQ,
        maxReceiveCount: 3,
      },
    } as any);
  }
}

export class MessagingStack extends TaggedStack {
  incomingQueues: IncomingQueues;
  outgoingDynamoDBDLQ: sqs.Queue;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.incomingQueues = new IncomingQueues(this, "incoming_queues");

    this.outgoingDynamoDBDLQ = new sqs.Queue(this, outgoingDynamoDBDLQ, {
      queueName: outgoingDynamoDBDLQ,
      retentionPeriod: cdk.Duration.hours(6),
    } as any);
  }
}
