import { SQSEvent } from "aws-lambda";
import * as Pino from "pino";
import * as dynamo from "@aws-sdk/client-dynamodb";
import * as sqs from "@aws-sdk/client-sqs";

import { UpdatePrice } from "./../../../core/ports/update-price";
import { StockDomainService } from "./../../../core/model/stock-domain-service";
import { Repository } from "./../../../core/infrastructure/repository";
import { IDGen } from "./../../../core/model/seq-gen";
import { UTCNow } from "./../../../core/model/time-source";
import { PriceUpdated } from "./../../../core/model/events";
import * as conf from "./../../../core/model/conf";
import { EventAlreadyHandledError } from "../../../core/model/errors";

const logger = Pino.default({
  name: "stock-updater",
  level: "debug",
});

export const main = async (event: SQSEvent) => {
  logger.info(event, "received sqs event");

  const messages = event.Records.map((record) => {
    const body = JSON.parse(record.body);

    return {
      record,
      body,
    };
  });

  const cnf = conf.get();

  for (var msg of messages) {
    const db = new dynamo.DynamoDB({ region: cnf.awsRegion });

    const idGen = new IDGen();
    const timeSource = new UTCNow();
    const repo = new Repository(db);
    const ds = new StockDomainService(repo, idGen, timeSource);
    const port = new UpdatePrice(ds);

    try {
      await port.execute(msg.body as PriceUpdated);
    } catch (error) {
      if (error instanceof EventAlreadyHandledError) {
        logger.info(error, "event already processed - ignored");
      } else {
        const logMsg = {
          msg,
          error,
        };
        logger.error(logMsg, `failed to process message`);
        // continue;
      }
    }

    try {
      const sqsClient = new sqs.SQSClient({ region: cnf.awsRegion });
      const deleteParams = {
        QueueUrl: cnf.incomingQueueUrl,
        ReceiptHandle: msg.record.receiptHandle,
      };
      const data = await sqsClient.send(
        new sqs.DeleteMessageCommand(deleteParams)
      );
      logger.info(data, "message deleted");
    } catch (error) {
      const logMsg = {
        msg,
        error,
      };
      logger.error(logMsg, "while deleting from sqs");
    }
  }
};
