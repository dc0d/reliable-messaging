export const region = process.env.AWS_REGION || "eu-north-1";
export const prefix = process.env.DEPLOYMENT_PREFIX || "";

const name = (s: string): string => {
  if (s.startsWith(prefix)) {
    return s;
  }

  return `${prefix}${s}`;
};

export const stacks = {
  base: name("Svc"),
  messaging: name("Messaging"),
  persistence: name("Persistence"),
  serverless: name("Serverless"),
};

export const tables = {
  incomingEvents: name("IncomingEvents"),
  stocks: name("Stocks"),
  outgoingEvents: name("OutgoingEvents"),
};

const incomingEventsQueue = name("PriceUpdates");
const incomingEventsDLQ = `${incomingEventsQueue}DLQ`;
const outgoingDynamoDbDLQ = name("OutgoingDynamoDbDLQ");

export const queues = {
  incomingEventsQueue: incomingEventsQueue,
  incomingEventsDLQ: incomingEventsDLQ,
  outgoingDynamoDbDLQ: outgoingDynamoDbDLQ,
};

export const lambdas = {
  serviceFn: name(`ServiceFn`),
  notifierFn: name(`NotifierFn`),
};
