import { UpdatePrice } from "./update-price";
import { StockDomainService } from "./../model/stock-domain-service";
import { PriceUpdated } from "./../model/events";

describe("UpdatePrice", () => {
  describe("execute", () => {
    it("should update the price via the domain service", async () => {
      const svc: StockDomainService = {} as StockDomainService;
      svc.updateStock = jest.fn(
        async (_incoming: PriceUpdated): Promise<void> => {}
      );

      const event: PriceUpdated = {
        id: "an-event-id",
        updatedStock: {
          stockId: "a-stock-id",
          price: 1000,
        },
      } as PriceUpdated;

      const port = new UpdatePrice(svc);
      await port.execute(event);

      expect(svc.updateStock).toBeCalledWith(event);
    });
  });
});
