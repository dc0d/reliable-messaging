import { Stock } from "./stock";

export interface UpdatedStock {
  readonly stockId: string;
  readonly price: number;
}

// PriceUpdated is incoming event

export interface PriceUpdated {
  readonly id: string;
  readonly updatedStock: UpdatedStock;
}

// StockUpdated is outgoing event

export interface StockUpdated {
  readonly id: string;
  readonly timestamp: string;
  readonly stock: Stock;
}

// {"id":"EVENT_ID_1","updatedStock":{"stockId":"STOCK_ID_1","price":1100}}
