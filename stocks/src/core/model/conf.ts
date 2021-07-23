export interface Conf {
  readonly awsRegion: string;

  readonly incomingQueueUrl: string;

  readonly tableIncomingEvents: string;
  readonly tableStocks: string;
  readonly tableOutgoingEvents: string;
}

const load = (): Conf => {
  const result: Conf = {
    awsRegion: process.env.SVC_AWS_REGION,
    incomingQueueUrl: process.env.INCOMING_QUEUE_URL,
    tableIncomingEvents: process.env.TABLE_INCOMING_EVENTS,
    tableStocks: process.env.TABLE_STOCKS,
    tableOutgoingEvents: process.env.TABLE_OUTGOING_EVENTS,
  } as Conf;
  return result;
};

let cnfObj: any;

export const get = (): Conf => {
  if (cnfObj) {
    return cnfObj;
  }

  cnfObj = load();

  return cnfObj;
};

// maybe conf and logger would go into instrumentation later
