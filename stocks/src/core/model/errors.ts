export const eventAlreadyHandled = "event already handled";
export const eventNotFound = "event not found";
export const stockNotFound = "stock not found";

export class EventAlreadyHandledError extends Error {
  constructor() {
    super(eventAlreadyHandled);
  }
}

export class StockNotFoundError extends Error {
  constructor() {
    super(stockNotFound);
  }
}
