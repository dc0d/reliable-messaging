import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import {
  SqsEventSource,
  DynamoEventSource,
  SqsDlq,
} from "@aws-cdk/aws-lambda-event-sources";

import { MessagingStack } from "./messaging-stack";
import { ServiceStack } from "./service-stack";
import { DataStack } from "./data-stack";
import * as env from "../env";

const messagingStackName = env.messagingStackName;
const serviceStackName = env.serviceStackName;
const dataStackName = env.dataStackName;

export class TransactionalService extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props?: {}) {
    super(scope, id);

    const dataStack = new DataStack(this, dataStackName);

    const messagingStac = new MessagingStack(this, messagingStackName);

    const serviceStack = new ServiceStack(this, serviceStackName);
    serviceStack.addDependency(messagingStac);

    //

    serviceStack.serviceFn.addEventSource(
      new SqsEventSource(messagingStac.incomingQueues.incomingEventsQueue, {
        batchSize: 1,
      })
    );

    //

    serviceStack.notifierFn.addEventSource(
      new DynamoEventSource(dataStack.outgoingEvents, {
        batchSize: 10,
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        bisectBatchOnError: true,
        onFailure: new SqsDlq(messagingStac.outgoingDynamoDBDLQ),
        retryAttempts: 10,
      } as any)
    );
  }
}
