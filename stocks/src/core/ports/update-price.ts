import { StockDomainService } from "./../model/stock-domain-service";
import { PriceUpdated } from "./../model/events";

export class UpdatePrice {
  protected svc: StockDomainService;

  constructor(svc: StockDomainService) {
    this.svc = svc;
  }

  async execute(event: PriceUpdated): Promise<void> {
    await this.svc.updateStock(event);
  }
}
