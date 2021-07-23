import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as iam from "@aws-cdk/aws-iam";
import { TaggedStack } from "./tagged-stack";

import * as env from "../env";

const names = {
  serviceFn: env.lambdas.serviceFn,
  notifierFn: env.lambdas.notifierFn,
};

const createNotifier = (stack: ServiceStack) => {
  new logs.LogGroup(stack, `${names.notifierFn}LogGroup`, {
    logGroupName: `/aws/lambda/${names.notifierFn}`,
    retention: 3,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  stack.notifierFn = new lambda.Function(stack, names.notifierFn, {
    runtime: lambda.Runtime.GO_1_X,
    handler: `notifierfn`,
    code: lambda.Code.fromAsset(
      `${__dirname}/../../cmd/notifierfn/notifierfn.zip`
    ),
    functionName: names.notifierFn,
    environment: { ...env.appEnv },
  } as lambda.FunctionProps);
};

const createService = (stack: ServiceStack) => {
  new logs.LogGroup(stack, `${names.serviceFn}LogGroup`, {
    logGroupName: `/aws/lambda/${names.serviceFn}`,
    retention: 3,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  stack.serviceFn = new lambda.Function(stack, names.serviceFn, {
    runtime: lambda.Runtime.GO_1_X,
    handler: `logicfn`,
    code: lambda.Code.fromAsset(`${__dirname}/../../cmd/logicfn/logicfn.zip`),
    functionName: names.serviceFn,
    environment: { ...env.appEnv },
  } as lambda.FunctionProps);

  stack.serviceFn.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ["dynamodb:*"],
      effect: iam.Effect.ALLOW,
      resources: ["*"],
    })
  );
};

export class ServiceStack extends TaggedStack {
  serviceFn: lambda.Function;
  notifierFn: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    createService(this);
    createNotifier(this);
  }
}
