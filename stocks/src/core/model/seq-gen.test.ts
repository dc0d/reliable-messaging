import { SeqGen, IDGen } from "./seq-gen";

test("IDGen next generates different ids", () => {
  const sut: SeqGen = new IDGen();

  const id1 = sut.next();
  const id2 = sut.next();

  expect(id1 === id2).toBeFalsy();
});
