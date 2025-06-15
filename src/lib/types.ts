
export type Tanker = { id: string; name: string };
export type Bmc = { id: string; name: string };
export type Driver = { id: string; name: string };
export type Tester = { id: string; name: string };

export type MilkEntry = {
  id: string;
  date: string;
  tanker: string;
  bmc: string;
  quantity: number;
  quality: 'Good' | 'Sour' | 'Curd';
  fat: number;
  snf: number;
  chamber: 1 | 2;
  driver_name: string;
  tester_name: string;
  created_at: string;
};
