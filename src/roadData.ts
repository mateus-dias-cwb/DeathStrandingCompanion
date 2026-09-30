export type RoadMaterialKey = 'chiral' | 'metals' | 'ceramics';
export type ContainerSize = 'S' | 'M' | 'L' | 'XL1' | 'XL2' | 'XL3' | 'XL4';
export type RoadMaterialAmounts = Record<RoadMaterialKey, number>;
export type ContainerCounts = Record<ContainerSize, number>;

export const containerSizes: ContainerSize[] = ['S', 'M', 'L', 'XL1', 'XL2', 'XL3', 'XL4'];

export const roadMaterials: { key: RoadMaterialKey; name: string; short: string; tone: string; capacity: number[] | null }[] = [
  { key: 'chiral', name: 'Chiral Crystals', short: 'CXl', tone: 'gold', capacity: null },
  { key: 'metals', name: 'Metals', short: 'MTL', tone: 'blue', capacity: [50, 100, 200, 400, 600, 800, 1000] },
  { key: 'ceramics', name: 'Ceramics', short: 'CRM', tone: 'clay', capacity: [40, 80, 160, 320, 480, 640, 800] },
];

export const roadRoutes = [
  { id: '23', label: 'UC Route 23' },
  { id: '41', label: 'UC Route 41' },
] as const;

export const emptyRoadAmounts = (): RoadMaterialAmounts => ({ chiral: 0, metals: 0, ceramics: 0 });

export function planContainers(amount: number, capacities: number[] | null): ContainerCounts {
  const plan: ContainerCounts = { S: 0, M: 0, L: 0, XL1: 0, XL2: 0, XL3: 0, XL4: 0 };
  if (amount <= 0 || !capacities?.length) return plan;

  const unit = capacities.reduce((current, capacity) => gcd(current, capacity));
  const demand = Math.ceil(amount / unit);
  const packageUnits = capacities.map((capacity) => capacity / unit);
  const containerCount = Math.ceil(demand / Math.max(...packageUnits));
  const maximumTotal = containerCount * Math.max(...packageUnits);
  const minimumContainers = new Uint16Array(maximumTotal + 1);
  const previousSize = new Int8Array(maximumTotal + 1);
  minimumContainers.fill(0xffff);
  minimumContainers[0] = 0;

  for (let total = 1; total <= maximumTotal; total += 1) {
    packageUnits.forEach((size, index) => {
      if (total >= size && minimumContainers[total - size] + 1 < minimumContainers[total]) {
        minimumContainers[total] = minimumContainers[total - size] + 1;
        previousSize[total] = index;
      }
    });
  }

  let packedTotal = demand;
  while (packedTotal <= maximumTotal && minimumContainers[packedTotal] !== containerCount) packedTotal += 1;
  while (packedTotal > 0) {
    const index = previousSize[packedTotal];
    if (index < 0 || index >= containerSizes.length) break;
    plan[containerSizes[index]] += 1;
    packedTotal -= packageUnits[index];
  }
  return plan;
}

function gcd(first: number, second: number): number {
  return second === 0 ? first : gcd(second, first % second);
}
