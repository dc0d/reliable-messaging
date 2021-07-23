import * as dynamo from "@aws-sdk/client-dynamodb";
import * as dynamotool from "@aws-sdk/util-dynamodb";
import * as Pino from "pino";

import * as repomdl from "./../model/repository";
import * as conf from "./../model/conf";
import { Stock } from "./../model/stock";
import { StockNotFoundError } from "./../model/errors";

const logger = Pino.default({
  level: "debug",
});

const dateFrom = (dateObj: any): Date => {
  return new Date(dateObj);
};

const createSubmitTxInput = (
  // TODO: next - the exception is happening here
  changeSet: repomdl.ChangeSet
): dynamo.TransactWriteItemsInput => {
  const cnf = conf.get();

  const put1: dynamo.Put = {} as dynamo.Put;
  put1.TableName = cnf.tableIncomingEvents;
  put1.Item = dynamotool.marshall(changeSet.incoming);
  put1.ConditionExpression = "attribute_not_exists(id)";

  const txitem1: dynamo.TransactWriteItem = {} as dynamo.TransactWriteItem;
  txitem1.Put = put1;

  const put2: dynamo.Put = {} as dynamo.Put;
  put2.TableName = cnf.tableStocks;
  const updatedStock = {
    ...changeSet.updatedStock,
    date: dateFrom(changeSet.updatedStock.date).getTime(),
  };
  put2.Item = dynamotool.marshall(updatedStock);

  if (changeSet.oldStockRev) {
    put2.ConditionExpression = "#rev == :rev_val";
    put2.ExpressionAttributeNames = {
      "#rev": "rev",
    };
    put2.ExpressionAttributeValues = dynamotool.marshall({
      ":rev_val": changeSet.oldStockRev,
    });
  }

  const txitem2: dynamo.TransactWriteItem = {} as dynamo.TransactWriteItem;
  txitem2.Put = put2;

  const put3: dynamo.Put = {} as dynamo.Put;
  put3.TableName = cnf.tableOutgoingEvents;
  const outgoing: any = changeSet.outgoing;
  outgoing.stock.date = dateFrom(changeSet.outgoing.stock.date).getTime();
  put3.Item = dynamotool.marshall(outgoing);

  const txitem3: dynamo.TransactWriteItem = {} as dynamo.TransactWriteItem;
  txitem3.Put = put3;

  const input: dynamo.TransactWriteItemsInput =
    {} as dynamo.TransactWriteItemsInput;
  input.TransactItems = [txitem1, txitem2, txitem3];

  return input;
};

export class Repository implements repomdl.Repository {
  protected client: dynamo.DynamoDB;

  constructor(client: dynamo.DynamoDB) {
    this.client = client;
  }

  async priceUpdatedEventExists(eventId: string): Promise<boolean> {
    const cnf = conf.get();

    const input: dynamo.GetItemCommandInput = {
      TableName: cnf.tableIncomingEvents,
      Key: {
        id: { S: eventId },
      },
    } as dynamo.GetItemCommandInput;

    const output = await this.client.getItem(input);
    if (!output.Item) {
      return false;
    }

    return true;
  }

  async loadStock(stockId: string): Promise<Stock> {
    const cnf = conf.get();

    const input: dynamo.GetItemCommandInput = {
      TableName: cnf.tableStocks,
      Key: {
        id: { S: stockId },
      },
    } as dynamo.GetItemCommandInput;

    const output = await this.client.getItem(input);
    if (!output.Item) {
      throw new StockNotFoundError();
    }

    return dynamotool.unmarshall(output.Item) as Stock;
  }

  async submit(changeSet: repomdl.ChangeSet): Promise<void> {
    const input: dynamo.TransactWriteItemsInput =
      createSubmitTxInput(changeSet);

    const output = await this.client.transactWriteItems(input);
    logger.info(output, "tx result");
  }
}
