export interface TimeSource {
  utcNow(): Date;
}

export class UTCNow implements TimeSource {
  constructor() {}

  utcNow(): Date {
    return new Date(); // TODO: is this correct (in TS/JS)?
  }
}
