export type FormatCodeParams = {
  prefix: string;
  sequence: number;
  pad?: number;
};

export type AllocateCodeParams = {
  prefix: string;
  pad?: number;
  nextSequence: () => Promise<number>;
};
