import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as iam from "@aws-cdk/aws-iam";
import * as sqs from "@aws-cdk/aws-sqs";
import * as path from "path";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

import * as conf from "./conf";
import { TaggedStack } from "./tagged-stack";

const serviceEnv = (incomingEventsQueue?: sqs.Queue) => {
  const lambdaEnv = {
    SVC_AWS_REGION: conf.region,
    INCOMING_QUEUE_URL: "",
    TABLE_INCOMING_EVENTS: conf.tables.incomingEvents,
    TABLE_STOCKS: conf.tables.stocks,
    TABLE_OUTGOING_EVENTS: conf.tables.outgoingEvents,
  };

  if (incomingEventsQueue) {
    lambdaEnv.INCOMING_QUEUE_URL = incomingEventsQueue.queueUrl;
  }

  return lambdaEnv;
};

const createService = (
  scope: cdk.Construct,
  incomingEventsQueue?: sqs.Queue
) => {
  const lambdaEnv = serviceEnv(incomingEventsQueue);

  const serviceFn = new NodejsFunction(scope, conf.lambdas.serviceFn, {
    memorySize: 128,
    timeout: cdk.Duration.seconds(30),
    runtime: lambda.Runtime.NODEJS_14_X,
    handler: "main",
    entry: path.join(
      __dirname,
      `/../../stocks/src/adapters/lambda/stock-updater/main.ts`
    ),
    depsLockFilePath: path.join(
      __dirname,
      `/../../stocks/gen.package-lock.json`
    ),
    environment: lambdaEnv,
    bundling: { minify: true, sourceMap: true },
  });

  serviceFn.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ["dynamodb:*"],
      effect: iam.Effect.ALLOW,
      resources: ["*"],
    })
  );

  if (incomingEventsQueue) {
    serviceFn.addEventSource(
      new SqsEventSource(incomingEventsQueue, {
        batchSize: 10,
      })
    );
  } else {
    console.warn("incomingEventsQueue should be provided");
  }
};

export class ServerlessStack extends TaggedStack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props?: cdk.StackProps,
    incomingEventsQueue?: sqs.Queue
  ) {
    super(scope, id, props);

    createService(this, incomingEventsQueue);
  }
}
