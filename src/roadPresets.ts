import type { RoadMaterialAmounts } from './roadData';

export type RoadPaverPreset = {
  route: '23' | '41';
  paver: number;
  required?: RoadMaterialAmounts;
};

export const roadPresetSource = 'https://docs.google.com/spreadsheets/d/1-oxqsrRSiOKCnClhCw6jCwYicc79HhhwN4kxXy1yTL8/edit?usp=sharing';

export const roadPaverPresets: RoadPaverPreset[] = [
  { route: '23', paver: 1, required: { chiral: 150, metals: 800, ceramics: 600 } },
  { route: '23', paver: 2, required: { chiral: 330, metals: 1760, ceramics: 1320 } },
  { route: '23', paver: 3, required: { chiral: 390, metals: 1040, ceramics: 780 } },
  { route: '23', paver: 4 },
  { route: '23', paver: 5, required: { chiral: 540, metals: 1440, ceramics: 1080 } },
  { route: '23', paver: 6 },
  { route: '23', paver: 7 },
  { route: '23', paver: 8, required: { chiral: 450, metals: 3200, ceramics: 2400 } },
  { route: '23', paver: 9, required: { chiral: 660, metals: 1760, ceramics: 1320 } },
  { route: '23', paver: 10 },
  { route: '23', paver: 11, required: { chiral: 910, metals: 2080, ceramics: 3120 } },
  { route: '23', paver: 12, required: { chiral: 980, metals: 2240, ceramics: 3360 } },
  { route: '23', paver: 13, required: { chiral: 1575, metals: 2400, ceramics: 1800 } },
  { route: '23', paver: 14, required: { chiral: 864, metals: 2560, ceramics: 1920 } },
  { route: '23', paver: 15, required: { chiral: 1020, metals: 2720, ceramics: 2040 } },
  { route: '23', paver: 16, required: { chiral: 540, metals: 2880, ceramics: 2160 } },
  { route: '23', paver: 17, required: { chiral: 1330, metals: 3040, ceramics: 2280 } },
  { route: '23', paver: 18, required: { chiral: 1080, metals: 3200, ceramics: 2400 } },
  { route: '41', paver: 1, required: { chiral: 660, metals: 5760, ceramics: 4320 } },
  { route: '41', paver: 2, required: { chiral: 500, metals: 1600, ceramics: 1200 } },
  { route: '41', paver: 3, required: { chiral: 594, metals: 1760, ceramics: 1320 } },
  { route: '41', paver: 4, required: { chiral: 525, metals: 1680, ceramics: 1260 } },
  { route: '41', paver: 5, required: { chiral: 648, metals: 1920, ceramics: 1440 } },
  { route: '41', paver: 6, required: { chiral: 483, metals: 1840, ceramics: 1380 } },
  { route: '41', paver: 7, required: { chiral: 648, metals: 1920, ceramics: 1440 } },
  { route: '41', paver: 8, required: { chiral: 483, metals: 1840, ceramics: 1380 } },
  { route: '41', paver: 9, required: { chiral: 483, metals: 1920, ceramics: 1380 } },
  { route: '41', paver: 10, required: { chiral: 483, metals: 1840, ceramics: 1440 } },
  { route: '41', paver: 11, required: { chiral: 375, metals: 2000, ceramics: 1500 } },
  { route: '41', paver: 12, required: { chiral: 405, metals: 2160, ceramics: 1620 } },
  { route: '41', paver: 13, required: { chiral: 300, metals: 1600, ceramics: 1200 } },
  { route: '41', paver: 14, required: { chiral: 825, metals: 1920, ceramics: 3420 } },
  { route: '41', paver: 15, required: { chiral: 1575, metals: 2080, ceramics: 3300 } },
  { route: '41', paver: 16, required: { chiral: 2250, metals: 2160, ceramics: 4200 } },
  { route: '41', paver: 17, required: { chiral: 3525, metals: 2400, ceramics: 7650 } },
  { route: '41', paver: 18, required: { chiral: 5805, metals: 9600, ceramics: 9450 } },
  { route: '41', paver: 19, required: { chiral: 3700, metals: 6400, ceramics: 6750 } },
  { route: '41', paver: 20, required: { chiral: 1950, metals: 5200, ceramics: 5400 } },
  { route: '41', paver: 21, required: { chiral: 1050, metals: 4800, ceramics: 3000 } },
  { route: '41', paver: 22, required: { chiral: 600, metals: 3200, ceramics: 2400 } },
  { route: '41', paver: 23, required: { chiral: 705, metals: 3360, ceramics: 2520 } },
  { route: '41', paver: 24, required: { chiral: 1200, metals: 5520, ceramics: 3420 } },
  { route: '41', paver: 25, required: { chiral: 2800, metals: 6000, ceramics: 6750 } },
  { route: '41', paver: 26, required: { chiral: 3000, metals: 6200, ceramics: 6930 } },
  { route: '41', paver: 27, required: { chiral: 3000, metals: 5600, ceramics: 7200 } },
  { route: '41', paver: 28, required: { chiral: 4140, metals: 5600, ceramics: 6030 } },
  { route: '41', paver: 29, required: { chiral: 3968, metals: 3200, ceramics: 4800 } },
  { route: '41', paver: 30, required: { chiral: 3000, metals: 2320, ceramics: 3780 } },
  { route: '41', paver: 31, required: { chiral: 1449, metals: 2160, ceramics: 3870 } },
  { route: '41', paver: 32, required: { chiral: 675, metals: 1840, ceramics: 3120 } },
  { route: '41', paver: 33, required: { chiral: 480, metals: 2480, ceramics: 2580 } },
];
