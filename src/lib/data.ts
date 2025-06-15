
import type { Tanker, Bmc, Driver, Tester, MilkEntry } from './types';

export const tankers: Tanker[] = [
  { id: 'T001', name: 'Tanker 001' },
  { id: 'T002', name: 'Tanker 002' },
  { id: 'T003', name: 'Tanker 003' },
];

export const bmcs: Bmc[] = [
  { id: 'BMC01', name: 'Collection Center A' },
  { id: 'BMC02', name: 'Collection Center B' },
  { id: 'BMC03', name: 'Collection Center C' },
];

export const drivers: Driver[] = [
  { id: 'D01', name: 'John Doe' },
  { id: 'D02', name: 'Peter Jones' },
  { id: 'D03', name: 'Sam Williams' },
];

export const testers: Tester[] = [
  { id: 'TS01', name: 'Alice Smith' },
  { id: 'TS02', name: 'Bob Johnson' },
  { id: 'TS03', name: 'Charlie Brown' },
];

export const milkEntries: MilkEntry[] = [
  {
    id: 'E001',
    date: new Date('2025-06-15'),
    tanker: 'Tanker 001',
    bmc: 'Collection Center A',
    quantity: 5000,
    quality: 'Good',
    fat: 3.5,
    snf: 8.5,
    chamber: 1,
    driverName: 'John Doe',
    testerName: 'Alice Smith',
  },
  {
    id: 'E002',
    date: new Date('2025-06-15'),
    tanker: 'Tanker 002',
    bmc: 'Collection Center B',
    quantity: 4800,
    quality: 'Good',
    fat: 3.7,
    snf: 8.6,
    chamber: 1,
    driverName: 'Peter Jones',
    testerName: 'Bob Johnson',
  },
];
