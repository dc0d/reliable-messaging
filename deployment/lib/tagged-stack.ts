import * as cdk from "@aws-cdk/core";

export class TaggedStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add(`Kind`, `DevRes`);
  }
}
