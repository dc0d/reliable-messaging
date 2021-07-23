import * as dynamo from "@aws-sdk/client-dynamodb";
import { Repository } from "./repository";
import { StockNotFoundError } from "./../model/errors";
import { Stock } from "./../model/stock";
import { ChangeSet } from "./../model/repository";

describe("Repository", () => {
  describe("priceUpdatedEventExists", () => {
    it("should return false if Item is falsy (not existing)", async () => {
      const client = new dynamo.DynamoDB({});
      client.getItem = jest.fn(
        async (
          _input: dynamo.GetItemCommandInput
        ): Promise<dynamo.GetItemCommandOutput> => {
          return {} as dynamo.GetItemCommandOutput;
        }
      );

      const repo = new Repository(client);

      expect(repo.priceUpdatedEventExists("id")).resolves.toBeFalsy();
    });

    it("should return true if Item is truthy (existing)", async () => {
      const client = new dynamo.DynamoDB({});
      client.getItem = jest.fn(
        async (
          _input: dynamo.GetItemCommandInput
        ): Promise<dynamo.GetItemCommandOutput> => {
          return { Item: {} } as dynamo.GetItemCommandOutput;
        }
      );

      const repo = new Repository(client);

      expect(repo.priceUpdatedEventExists("id")).resolves.toBeTruthy();
    });
  });

  describe("loadStock", () => {
    it("should throw StockNotFoundError when stock not found", async () => {
      const client = new dynamo.DynamoDB({});
      client.getItem = jest.fn(
        async (
          _input: dynamo.GetItemCommandInput
        ): Promise<dynamo.GetItemCommandOutput> => {
          return {} as dynamo.GetItemCommandOutput;
        }
      );

      const repo = new Repository(client);

      expect(async () => {
        await repo.loadStock("id");
      }).rejects.toThrow(StockNotFoundError);
    });

    it("should return stock when found found", async () => {
      const client = new dynamo.DynamoDB({});
      client.getItem = jest.fn(
        async (
          _input: dynamo.GetItemCommandInput
        ): Promise<dynamo.GetItemCommandOutput> => {
          const result = {} as dynamo.GetItemCommandOutput;
          result.Item = {};
          result.Item["id"] = { S: "stock-id" };
          return result;
        }
      );

      const repo = new Repository(client);

      const expectedStock: Stock = { id: "stock-id" } as Stock;
      expect(repo.loadStock("id")).resolves.toEqual(expectedStock);
    });
  });

  describe("submit", () => {
    it("should update the incoming/outgoing events and the stock in a transaction", async () => {
      const client = new dynamo.DynamoDB({});
      client.transactWriteItems = jest.fn(
        async (
          _input: dynamo.TransactWriteItemsCommandInput
        ): Promise<dynamo.TransactWriteItemsCommandOutput> => {
          const result: dynamo.TransactWriteItemsCommandOutput =
            {} as dynamo.TransactWriteItemsCommandOutput;
          return result;
        }
      );

      const stockId = "stock-id";
      const price = 1000;
      const date = new Date(Date.UTC(2021, 7));
      const aStock = {
        id: stockId,
        price,
        date,
        rev: "some-unique-rev",
      };

      const input: ChangeSet = {
        incoming: {
          id: "incoming-event-id",
          updatedStock: {
            stockId,
            price,
          },
        },
        updatedStock: aStock,
        outgoing: {
          id: "outgoing-event-id",
          timestamp: "some-timestamp",
          stock: aStock,
        },
      } as ChangeSet;

      const repo = new Repository(client);

      await repo.submit(input);

      expect(client.transactWriteItems).toBeCalled();
    });
  });
});
