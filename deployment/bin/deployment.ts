#!/usr/bin/env node

import "source-map-support/register";
import * as cdk from "@aws-cdk/core";

import { TransactionalService } from "../lib";
import * as env from "../env";

const serviceName = env.appName;

const app = new cdk.App();
new TransactionalService(app, serviceName);
