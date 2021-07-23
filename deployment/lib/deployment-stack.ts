import * as cdk from "@aws-cdk/core";

import { MessagingStack } from "./messaging-stack";
import { PersistenceStack } from "./persistence-stack";
import { ServerlessStack } from "./serverless-stack";
import * as conf from "./conf";

export class DeploymentStack extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props?: {}) {
    super(scope, id);

    new PersistenceStack(this, conf.stacks.persistence, props);

    const messagingStack = new MessagingStack(
      this,
      conf.stacks.messaging,
      props
    );

    new ServerlessStack(
      this,
      conf.stacks.serverless,
      props,
      messagingStack.incomingEventsQueue
    );
  }
}
