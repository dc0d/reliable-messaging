export const region = process.env.AWS_REGION || "eu-north-1";

const appPrefix = "SRV";

export const appName = `${appPrefix}TransactionalService`;
export const messagingStackName = `${appPrefix}MessagingStack`;
export const serviceStackName = `${appPrefix}ServiceStack`;
export const dataStackName = `${appPrefix}DataStack`;

export const tables = {
  IncomingEvents: `${appPrefix}IncomingEvents`,
  Entities: `${appPrefix}Stocks`,
  OutgoingEvents: `${appPrefix}OutgoingEvents`,
};

const IncomingEventsQueue = `${appPrefix}PriceUpdates`;
const IncomingEventsDLQ = `${IncomingEventsQueue}DLQ`;
const OutgoingDynamoDbDLQ = `${appPrefix}OutgoingDynamoDbDLQ`;

export const queues = {
  IncomingEventsQueue,
  IncomingEventsDLQ,
  OutgoingDynamoDbDLQ,
};

export const appEnv = {
  OPS_AWS_REGION: region,
  OPS_INCOMING_EVENTS: tables.IncomingEvents,
  OPS_ENTITIES_TABLE: tables.Entities,
  OPS_OUTGOING_EVENTS: tables.OutgoingEvents,
};

export const lambdas = {
  serviceFn: `${appPrefix}ServiceFn`,
  notifierFn: `${appPrefix}NotifierFn`,
};
