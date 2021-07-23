import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as conf from "./conf";

import { TaggedStack } from "./tagged-stack";

export class PersistenceStack extends TaggedStack {
  public outgoingEvents: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new dynamodb.Table(this, conf.tables.incomingEvents, {
      tableName: conf.tables.incomingEvents,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    } as dynamodb.TableProps);

    new dynamodb.Table(this, conf.tables.stocks, {
      tableName: conf.tables.stocks,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    } as dynamodb.TableProps);

    this.outgoingEvents = new dynamodb.Table(this, conf.tables.outgoingEvents, {
      tableName: conf.tables.outgoingEvents,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    } as dynamodb.TableProps);
  }
}
