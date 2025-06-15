
export type Tanker = { id: string; name: string };
export type Bmc = { id: string; name: string };
export type Driver = { id: string; name: string };
export type Tester = { id: string; name: string };

export type MilkEntry = {
  id: string;
  date: Date;
  tanker: string;
  bmc: string;
  quantity: number;
  quality: 'Good' | 'Sour' | 'Curd';
  fat: number;
  snf: number;
  chamber: 1 | 2;
  driverName: string;
  testerName: string;
};
