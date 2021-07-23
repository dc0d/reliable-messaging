import * as sqs from "@aws-cdk/aws-sqs";
import * as cdk from "@aws-cdk/core";

import * as conf from "./conf";
import { TaggedStack } from "./tagged-stack";

const createQueuePairs = (
  scope: cdk.Construct,
  queueName: string,
  dlqName: string
): sqs.Queue => {
  const dlq = new sqs.Queue(scope, dlqName, {
    queueName: dlqName,
    retentionPeriod: cdk.Duration.hours(2),
    receiveMessageWaitTime: cdk.Duration.seconds(20),
    visibilityTimeout: cdk.Duration.seconds(120),
  } as sqs.QueueProps);

  const result = new sqs.Queue(scope, queueName, {
    queueName: queueName,
    retentionPeriod: cdk.Duration.hours(1),
    receiveMessageWaitTime: cdk.Duration.seconds(20),
    deadLetterQueue: {
      queue: dlq,
      maxReceiveCount: 3,
    },
    visibilityTimeout: cdk.Duration.seconds(300),
  } as sqs.QueueProps);

  return result;
};

export class MessagingStack extends TaggedStack {
  public incomingEventsQueue: sqs.Queue;
  public outgoingDynamoDbDLQ: sqs.Queue;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.incomingEventsQueue = createQueuePairs(
      this,
      conf.queues.incomingEventsQueue,
      conf.queues.incomingEventsDLQ
    );

    this.outgoingDynamoDbDLQ = new sqs.Queue(
      this,
      conf.queues.outgoingDynamoDbDLQ,
      {
        queueName: conf.queues.outgoingDynamoDbDLQ,
        retentionPeriod: cdk.Duration.hours(2),
        receiveMessageWaitTime: cdk.Duration.seconds(20),
        visibilityTimeout: cdk.Duration.seconds(120),
      } as sqs.QueueProps
    );
  }
}
