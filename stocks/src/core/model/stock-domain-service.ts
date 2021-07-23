import { PriceUpdated } from "./events";
import { Repository, ChangeSet } from "./repository";
import { SeqGen } from "./seq-gen";
import { TimeSource } from "./time-source";
import { EventAlreadyHandledError, StockNotFoundError } from "./errors";
import { Stock } from "./stock";

export class StockDomainService {
  private readonly repo: Repository;
  private readonly idGen: SeqGen;
  private readonly timeSource: TimeSource;

  constructor(repo: Repository, idGen: SeqGen, timeSource: TimeSource) {
    this.repo = repo;
    this.idGen = idGen;
    this.timeSource = timeSource;
  }

  async updateStock(incoming: PriceUpdated): Promise<void> {
    if (await this.repo.priceUpdatedEventExists(incoming.id)) {
      throw new EventAlreadyHandledError();
    }

    let stock: Stock;
    try {
      stock = await this.repo.loadStock(incoming.updatedStock.stockId);
      stock = {
        ...stock,
        price: incoming.updatedStock.price,
      };
    } catch (error) {
      if (error instanceof StockNotFoundError) {
        stock = {
          id: incoming.updatedStock.stockId,
          rev: this.idGen.next(),
          price: incoming.updatedStock.price,
          date: this.timeSource.utcNow(),
        };
      } else {
        throw {
          error: error,
          message: "loadStock",
        };
      }
    }

    const changeSet = {
      incoming: incoming,
      updatedStock: stock,
      outgoing: {
        id: this.idGen.next(),
        timestamp: this.idGen.next(),
        stock: stock,
      },
    };

    await this.repo.submit(changeSet as ChangeSet);

    return;
  }
}
