import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { TaggedStack } from "./tagged-stack";
import * as env from "../env";

const names = {
  IncomingEvents: env.tables.IncomingEvents,
  Entities: env.tables.Entities,
  OutgoingEvents: env.tables.OutgoingEvents,
};

export class DataStack extends TaggedStack {
  outgoingEvents: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new dynamodb.Table(this, names.IncomingEvents, {
      tableName: names.IncomingEvents,
      partitionKey: {
        name: "ID",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    } as any);

    new dynamodb.Table(this, names.Entities, {
      tableName: names.Entities,
      partitionKey: {
        name: "ID",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    } as any);

    this.outgoingEvents = new dynamodb.Table(this, names.OutgoingEvents, {
      tableName: names.OutgoingEvents,
      partitionKey: {
        name: "ID",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "Timestamp",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    } as any);
  }
}
