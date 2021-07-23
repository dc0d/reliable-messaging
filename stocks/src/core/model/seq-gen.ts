import { v4 as uuidv4 } from "uuid";

export interface SeqGen {
  next(): string;
}

export class IDGen implements SeqGen {
  constructor() {}

  next(): string {
    return uuidv4();
  }
}
