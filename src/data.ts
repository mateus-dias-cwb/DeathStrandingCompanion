import type { LucideIcon } from 'lucide-react';
import { Cable, Eye, House, Mail, Route, Zap } from 'lucide-react';

export type ResourceKey = 'chiral' | 'metals' | 'ceramics' | 'chemicals' | 'alloys';
export type Category = 'Network' | 'Shelter' | 'Traversal';

export type Structure = {
  id: string;
  name: string;
  category: Category;
  pcc: string;
  icon: LucideIcon;
  note: string;
  recipe: Partial<Record<ResourceKey, number>>;
};

export const resources: { key: ResourceKey; name: string; short: string; tone: string }[] = [
  { key: 'chiral', name: 'Chiral Crystals', short: 'Chiral', tone: 'gold' },
  { key: 'metals', name: 'Metals', short: 'Metals', tone: 'blue' },
  { key: 'ceramics', name: 'Ceramics', short: 'Ceramics', tone: 'clay' },
  { key: 'chemicals', name: 'Chemicals', short: 'Chemicals', tone: 'mint' },
  { key: 'alloys', name: 'Special Alloys', short: 'Alloys', tone: 'violet' },
];

export const structures: Structure[] = [
  {
    id: 'generator', name: 'Generator', category: 'Network', pcc: 'PCC Lv.1', icon: Zap,
    note: 'Restore power to nearby equipment.', recipe: { chiral: 400, metals: 32 },
  },
  {
    id: 'watchtower', name: 'Watchtower', category: 'Network', pcc: 'PCC Lv.1', icon: Eye,
    note: 'Survey the surrounding terrain.', recipe: { chiral: 32, metals: 400 },
  },
  {
    id: 'postbox', name: 'Postbox', category: 'Network', pcc: 'PCC Lv.1', icon: Mail,
    note: 'Share cargo and access private storage.', recipe: { chiral: 200, metals: 200 },
  },
  {
    id: 'bridge', name: 'Bridge', category: 'Network', pcc: 'PCC Lv.1', icon: Route,
    note: 'Cross rivers and difficult terrain.', recipe: { chiral: 800, metals: 200 },
  },
  {
    id: 'timefall-shelter', name: 'Timefall Shelter', category: 'Shelter', pcc: 'PCC Lv.2', icon: House,
    note: 'Take cover and repair cargo in timefall.', recipe: { chiral: 300, chemicals: 120, alloys: 80 },
  },
  {
    id: 'safehouse', name: 'Safehouse', category: 'Shelter', pcc: 'PCC Lv.2', icon: House,
    note: 'Rest, fabricate gear, and fast travel.', recipe: { chiral: 300, metals: 2400, alloys: 480 },
  },
  {
    id: 'zip-line', name: 'Zip-line', category: 'Traversal', pcc: 'PCC Lv.2', icon: Cable,
    note: 'Connect routes across steep terrain.', recipe: { chiral: 500, alloys: 100 },
  },
];
