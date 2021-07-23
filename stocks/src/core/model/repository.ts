import { Stock } from "./stock";
import { PriceUpdated, StockUpdated } from "./events";

export interface ChangeSet {
  readonly incoming: PriceUpdated;
  readonly updatedStock: Stock;
  readonly outgoing: StockUpdated;
  readonly oldStockRev: string;
}

export interface Repository {
  priceUpdatedEventExists(eventId: string): Promise<boolean>;
  loadStock(stockId: string): Promise<Stock>;
  submit(changeSet: ChangeSet): Promise<void>;
}
