import * as cdk from "@aws-cdk/core";

export const addTag = (scope: any, tagName: string, tagValue: string) => {
  cdk.Tags.of(scope).add(tagName, tagValue);
};

export const addNameTag = (scope: any, tagValue: string) => {
  addTag(scope, "Name", tagValue);
};

export class TaggedStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    addTag(this, `Kind`, `DevRes`);
  }
}
