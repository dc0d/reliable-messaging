import { Repository, ChangeSet } from "./repository";
import { Stock } from "./stock";
import { SeqGen } from "./seq-gen";
import { TimeSource } from "./time-source";
import { StockDomainService } from "./stock-domain-service";
import { PriceUpdated, UpdatedStock } from "./events";
import { EventAlreadyHandledError, StockNotFoundError } from "./errors";

const notImplemented = (): any => {
  throw "n/a";
};

const emptyRepo = (): Repository => {
  return {
    priceUpdatedEventExists: async (_eventId: string): Promise<boolean> => {
      return notImplemented();
    },
    loadStock: async (_stockId: string): Promise<Stock> => {
      return notImplemented();
    },
    submit: async (_changeSet: ChangeSet): Promise<void> => {
      notImplemented();
    },
  };
};

const emptyIdGen = (): SeqGen => {
  return {
    next: (): string => {
      return notImplemented();
    },
  };
};

const emptyTimeSource = (): TimeSource => {
  return {
    utcNow: (): Date => {
      return notImplemented();
    },
  };
};

const emptyPriceUpdated = (): PriceUpdated => {
  const updatedStock: UpdatedStock = {
    stockId: "",
    price: 0,
  };

  return {
    id: "",
    updatedStock: updatedStock,
  };
};

describe("StockDomainService", () => {
  describe("updateStock", () => {
    describe("when received PriceUpdated event", () => {
      it("should fail if event is already processed", async () => {
        const repo = emptyRepo();
        const idGen = emptyIdGen();
        const timeSource = emptyTimeSource();
        let incomingEvent: any = emptyPriceUpdated();

        repo.priceUpdatedEventExists = jest.fn(
          async (_eventId: string): Promise<boolean> => {
            return true;
          }
        );

        const anEventId = "an_event_id";
        incomingEvent.id = anEventId;

        const sut = new StockDomainService(repo, idGen, timeSource);

        expect(async () => {
          await sut.updateStock(incomingEvent);
        }).rejects.toThrow(EventAlreadyHandledError);

        expect(repo.priceUpdatedEventExists).toBeCalledWith(anEventId);
      });

      it("should create the stock if it does not exist", async () => {
        const date = Date.UTC(2021, 7);

        const repo = emptyRepo();
        const idGen = emptyIdGen();
        const timeSource = emptyTimeSource();
        const incomingEvent: any = {
          id: "an_event_id",
          updatedStock: {
            stockId: "a_stock_id",
            price: 1000,
          },
        };

        const expectedChangeSet = {
          incoming: {
            id: "an_event_id",
            updatedStock: {
              stockId: "a_stock_id",
              price: 1000,
            },
          },
          updatedStock: {
            id: incomingEvent.updatedStock.stockId,
            rev: "GENERATED_UUID",
            price: 1000,
            date: new Date(date),
          },
          outgoing: {
            id: "GENERATED_UUID",
            timestamp: "GENERATED_UUID",
            stock: {
              id: incomingEvent.updatedStock.stockId,
              rev: "GENERATED_UUID",
              price: 1000,
              date: new Date(date),
            },
          },
        };

        repo.priceUpdatedEventExists = jest.fn(
          async (_eventId: string): Promise<boolean> => {
            return false;
          }
        );
        repo.loadStock = jest.fn(async (_stockId: string): Promise<Stock> => {
          throw new StockNotFoundError();
        });
        repo.submit = jest.fn(
          async (_changeSet: ChangeSet): Promise<void> => {}
        );

        idGen.next = jest.fn((): string => {
          return "GENERATED_UUID";
        });

        timeSource.utcNow = jest.fn((): Date => {
          return new Date(date);
        });

        const sut = new StockDomainService(repo, idGen, timeSource);

        await sut.updateStock(incomingEvent);

        expect(repo.priceUpdatedEventExists).toBeCalledWith(incomingEvent.id);
        expect(repo.loadStock).toBeCalledWith(
          incomingEvent.updatedStock.stockId
        );
        expect(repo.submit).toBeCalledWith(expectedChangeSet);
      });

      it("should update the stock if it exists", async () => {
        const date = Date.UTC(2021, 7);

        const repo = emptyRepo();
        const idGen = emptyIdGen();
        const timeSource = emptyTimeSource();
        const incomingEvent: any = {
          id: "an_event_id",
          updatedStock: {
            stockId: "a_stock_id",
            price: 1100,
          },
        };

        const expectedChangeSet = {
          incoming: {
            id: "an_event_id",
            updatedStock: {
              stockId: "a_stock_id",
              price: 1100,
            },
          },
          updatedStock: {
            id: incomingEvent.updatedStock.stockId,
            rev: "GENERATED_UUID",
            price: 1100,
            date: new Date(date),
          },
          outgoing: {
            id: "GENERATED_UUID",
            timestamp: "GENERATED_UUID",
            stock: {
              id: incomingEvent.updatedStock.stockId,
              rev: "GENERATED_UUID",
              price: 1100,
              date: new Date(date),
            },
          },
        };

        repo.priceUpdatedEventExists = jest.fn(
          async (_eventId: string): Promise<boolean> => {
            return false;
          }
        );
        repo.loadStock = jest.fn(async (_stockId: string): Promise<Stock> => {
          return {
            id: incomingEvent.updatedStock.stockId,
            rev: "GENERATED_UUID",
            price: 10,
            date: new Date(date),
          } as Stock;
        });
        repo.submit = jest.fn(
          async (_changeSet: ChangeSet): Promise<void> => {}
        );

        idGen.next = jest.fn((): string => {
          return "GENERATED_UUID";
        });

        timeSource.utcNow = jest.fn((): Date => {
          return new Date(date);
        });

        const sut = new StockDomainService(repo, idGen, timeSource);

        await sut.updateStock(incomingEvent);

        expect(repo.priceUpdatedEventExists).toBeCalledWith(incomingEvent.id);
        expect(repo.loadStock).toBeCalledWith(
          incomingEvent.updatedStock.stockId
        );
        expect(repo.submit).toBeCalledWith(expectedChangeSet);
      });
    });
  });
});
