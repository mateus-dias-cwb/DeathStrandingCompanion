import { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  Gem,
  Layers,
  Package,
  RotateCcw,
  Route,
} from 'lucide-react';
import {
  containerSizes,
  emptyRoadAmounts,
  planContainers,
  roadMaterials,
  roadRoutes,
  type ContainerCounts,
  type PackingGoal,
  type RoadMaterialAmounts,
  type RoadMaterialKey,
} from './roadData';
import { roadPaverPresets, roadPresetSource } from './roadPresets';

type RouteId = (typeof roadRoutes)[number]['id'];
type RoadEntry = {
  id: string;
  route: RouteId;
  paver: number;
  included: boolean;
  targetKnown: boolean;
  required: RoadMaterialAmounts;
  deposited: RoadMaterialAmounts;
};
type PlannedRoad = RoadEntry & {
  remaining: RoadMaterialAmounts;
  containers: Record<RoadMaterialKey, ContainerCounts>;
};

type RouteFilter = 'all' | RouteId;
const STORAGE_KEY = 'bridge-planner-road-pavers-v1';
const PACKING_GOAL_KEY = 'bridge-planner-packing-goal-v1';
const PRESET_VERSION_KEY = 'bridge-planner-road-presets-v1';
const PRESET_VERSION = 'ds1-fixed-catalog-v1';
const emptyContainerCounts = (): ContainerCounts => ({ S: 0, M: 0, L: 0, XL1: 0, XL2: 0, XL3: 0, XL4: 0 });
const materialIcons = { chiral: Gem, metals: Layers, ceramics: Package };

function createPresetRoads(): RoadEntry[] {
  return roadPaverPresets.map((preset) => ({
    id: `preset-${preset.route}-${preset.paver}`,
    route: preset.route,
    paver: preset.paver,
    included: Boolean(preset.required),
    targetKnown: Boolean(preset.required),
    required: preset.required ?? emptyRoadAmounts(),
    deposited: emptyRoadAmounts(),
  }));
}

function mergeRoadPresets(savedRoads: RoadEntry[]): RoadEntry[] {
  const savedByKey = new Map(savedRoads.map((road) => [`${road.route}-${road.paver}`, road]));
  return createPresetRoads().map((preset) => {
    const saved = savedByKey.get(`${preset.route}-${preset.paver}`);
    return saved ? { ...preset, deposited: saved.deposited ?? emptyRoadAmounts(), included: saved.included ?? preset.included } : preset;
  });
}

function readPackingGoal(): PackingGoal {
  try {
    return localStorage.getItem(PACKING_GOAL_KEY) === 'least-overage' ? 'least-overage' : 'fewest';
  } catch {
    return 'fewest';
  }
}

function readSavedRoads(): RoadEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return createPresetRoads();
    const savedRoads = JSON.parse(saved) as RoadEntry[];
    if (!Array.isArray(savedRoads)) return createPresetRoads();
    return localStorage.getItem(PRESET_VERSION_KEY) === PRESET_VERSION ? savedRoads : mergeRoadPresets(savedRoads);
  } catch {
    return createPresetRoads();
  }
}

function RoadPlanner() {
  const [roads, setRoads] = useState<RoadEntry[]>(readSavedRoads);
  const [packingGoal, setPackingGoal] = useState<PackingGoal>(readPackingGoal);
  const [routeFilter, setRouteFilter] = useState<RouteFilter>('all');
  const [expandedRoad, setExpandedRoad] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roads));
      localStorage.setItem(PRESET_VERSION_KEY, PRESET_VERSION);
    } catch {
      // Storage can be unavailable in private browsing modes.
    }
  }, [roads]);

  useEffect(() => {
    try {
      localStorage.setItem(PACKING_GOAL_KEY, packingGoal);
    } catch {
      // Storage can be unavailable in private browsing modes.
    }
  }, [packingGoal]);

  const plannedRoads = useMemo<PlannedRoad[]>(() => roads.map((road) => {
    const remaining = emptyRoadAmounts();
    const containers = {} as PlannedRoad['containers'];
    roadMaterials.forEach(({ key, capacity }) => {
      remaining[key] = Math.max(0, Math.ceil(road.required[key]) - Math.floor(road.deposited[key]));
      containers[key] = planContainers(remaining[key], capacity, packingGoal);
    });
    return { ...road, remaining, containers };
  }), [roads, packingGoal]);

  const includedSummary = useMemo(() => {
    const remaining = emptyRoadAmounts();
    const containers: Record<'metals' | 'ceramics', ContainerCounts> = {
      metals: emptyContainerCounts(),
      ceramics: emptyContainerCounts(),
    };
    plannedRoads.filter((road) => road.included).forEach((road) => {
      roadMaterials.forEach(({ key }) => { remaining[key] += road.remaining[key]; });
      (['metals', 'ceramics'] as const).forEach((key) => {
        containerSizes.forEach((size) => { containers[key][size] += road.containers[key][size]; });
      });
    });
    const packageCount = (['metals', 'ceramics'] as const).reduce((sum, key) => (
      sum + containerSizes.reduce((materialTotal, size) => materialTotal + containers[key][size], 0)
    ), 0);
    return { remaining, containers, packageCount, roadCount: plannedRoads.filter((road) => road.included).length };
  }, [plannedRoads]);

  const visibleRoads = plannedRoads.filter((road) => {
    const matchesRoute = routeFilter === 'all' || road.route === routeFilter;
    const label = `${road.route} ${road.paver}`;
    return matchesRoute && label.includes(search.trim());
  });

  const updateRoad = (id: string, update: (road: RoadEntry) => RoadEntry) => {
    setRoads((current) => current.map((road) => road.id === id ? update(road) : road));
  };

  const updateDeposited = (id: string, key: RoadMaterialKey, amount: number) => {
    updateRoad(id, (road) => ({
      ...road,
      deposited: { ...road.deposited, [key]: Math.max(0, Math.floor(amount)) },
    }));
  };

  const clearRoads = () => {
    setRoads([]);
    setExpandedRoad(null);
  };

  return (
    <section className="road-planner">
      <div className="road-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> ROUTE RECONSTRUCTION <span className="heading-code">// 02</span></div>
          <h1>Road planner</h1>
          <p>Track each auto-paver, record its progress, and plan the cargo for your next run.</p>
        </div>
        <div className="road-heading-mark"><Route size={25} strokeWidth={1.5} /><span>DS1 / UCA</span></div>
      </div>

      <section className="road-cargo-board" aria-labelledby="road-cargo-title">
        <div className="road-cargo-heading">
          <div className="road-cargo-title">
            <div className="road-cargo-icon"><Boxes size={18} /></div>
            <div><span className="eyebrow-small">SELECTED PAVERS / {String(includedSummary.roadCount).padStart(2, '0')}</span><h2 id="road-cargo-title">Cargo to complete</h2></div>
          </div>
          <div className="road-cargo-tools">
            <div className="packing-goal-switch" role="group" aria-label="Container packing priority">
              <button className={packingGoal === 'fewest' ? 'active' : ''} type="button" aria-pressed={packingGoal === 'fewest'} onClick={() => setPackingGoal('fewest')}>Fewest containers</button>
              <button className={packingGoal === 'least-overage' ? 'active' : ''} type="button" aria-pressed={packingGoal === 'least-overage'} onClick={() => setPackingGoal('least-overage')}>Least overage</button>
            </div>
            <div className="container-total"><strong>{includedSummary.packageCount}</strong><span>CONTAINERS<br />TO CARRY</span></div>
          </div>
        </div>

        <div className="road-total-grid">
          {roadMaterials.map(({ key, name, tone }) => {
            const Icon = materialIcons[key];
            const counts = key === 'chiral' ? null : includedSummary.containers[key];
            return (
              <article className={`road-total-card ${key === 'chiral' ? 'loose-total' : ''}`} key={key}>
                <div className="road-total-card-title">
                  <span className={`material-icon material-${tone}`}><Icon size={16} /></span>
                  <span>{name}</span>
                  <strong>{includedSummary.remaining[key].toLocaleString()}</strong>
                </div>
                {counts ? (
                  <div className="container-count-grid" aria-label={`${name} container breakdown`}>
                    {containerSizes.map((size, index) => (
                      <div className={`container-count count-${size.toLowerCase()}`} key={size} title={`${size}: ${roadMaterials.find((item) => item.key === key)?.capacity?.[index]} units each`}>
                        <span className="container-glyph"><Package size={13 + Math.min(index, 3)} /></span>
                        <span className="container-size">{size}</span>
                        <b>{counts[size]}</b>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="loose-cargo-note"><Gem size={13} /><span>Loose cargo, not containerized</span><b>{includedSummary.remaining.chiral.toLocaleString()} CXl</b></div>
                )}
              </article>
            );
          })}
        </div>
        <div className="road-cargo-foot"><CircleHelp size={14} /><span>{packingGoal === 'fewest' ? 'Fewest containers first; ties use the least overage.' : 'Least overage first; ties use the fewest containers.'} Totals include checked pavers only. Road requirements vary by paver.</span></div>
      </section>

      <div className="road-list-toolbar">
        <div className="road-route-tabs" role="tablist" aria-label="Filter roads by route">
          {(['all', '23', '41'] as const).map((route) => {
            const label = route === 'all' ? 'All routes' : `UC Route ${route}`;
            const count = route === 'all' ? roads.length : roads.filter((road) => road.route === route).length;
            return <button className={`road-route-tab ${routeFilter === route ? 'active' : ''}`} key={route} type="button" role="tab" aria-selected={routeFilter === route} onClick={() => setRouteFilter(route)}>{label}<span>{count}</span></button>;
          })}
        </div>
        <div className="road-actions">
          <label className="road-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a paver" aria-label="Find a paver" /></label>
          <button className="icon-button road-clear-button" type="button" aria-label="Clear all pavers" title="Clear all pavers" onClick={clearRoads} disabled={roads.length === 0}><RotateCcw size={15} /></button>
        </div>
      </div>

      <div className="road-paver-list">
        {visibleRoads.length === 0 ? (
          <div className="empty-road-list"><div className="empty-road-art"><Route size={24} /></div><strong>{roads.length === 0 ? 'No pavers tracked yet.' : 'No pavers match this view.'}</strong><span>{roads.length === 0 ? 'Add a paver, then copy its total and deposited amounts from the in-game paver readout.' : 'Try another route or search.'}</span></div>
        ) : visibleRoads.map((road) => {
          const expanded = expandedRoad === road.id;
          const totalRequired = roadMaterials.reduce((sum, material) => sum + road.required[material.key], 0);
          const totalRemaining = roadMaterials.reduce((sum, material) => sum + road.remaining[material.key], 0);
          const complete = totalRequired > 0 && totalRemaining === 0;
          const packageLabels = roadMaterials.flatMap(({ key, short }) => {
            if (!road.targetKnown) return ['Target unknown'];
            if (key === 'chiral') return road.remaining[key] > 0 ? [`${road.remaining[key].toLocaleString()} CXl`] : [];
            return containerSizes.flatMap((size) => road.containers[key][size] > 0 ? [`${short} ${size} ×${road.containers[key][size]}`] : []);
          });
          return (
            <article className={`road-paver-card ${road.included ? '' : 'not-counted'}`} key={road.id}>
              <div className="road-paver-row">
                <label className="road-inclusion" title={road.targetKnown ? 'Include this paver in the cargo total' : 'Target data is unavailable for this paver'}>
                  <input type="checkbox" checked={road.included} disabled={!road.targetKnown} onChange={(event) => updateRoad(road.id, (current) => ({ ...current, included: event.target.checked }))} aria-label={`Include UC Route ${road.route} paver ${road.paver} in cargo total`} />
                </label>
                <span className="road-paver-icon"><Route size={17} /></span>
                <button className="road-paver-summary" type="button" aria-expanded={expanded} onClick={() => setExpandedRoad(expanded ? null : road.id)}>
                  <span className="road-paver-name">UC ROUTE {road.route} <i>/</i> PAVER <b>{String(road.paver).padStart(2, '0')}</b></span>
                  <span className={`road-paver-status ${complete ? 'is-complete' : !road.targetKnown ? 'is-unknown' : ''}`}>{!road.targetKnown ? 'TARGET UNKNOWN' : complete ? <><Check size={12} /> COMPLETE</> : `${totalRemaining.toLocaleString()} REMAINING`}</span>
                </button>
                <div className="road-paver-cargo">{packageLabels.length > 0 ? packageLabels.map((label) => <span key={label}>{label}</span>) : <span className="no-cargo">Set paver totals</span>}</div>
                <button className="icon-button road-expand" type="button" aria-label={`${expanded ? 'Collapse' : 'Show'} Route ${road.route} paver ${road.paver}`} onClick={() => setExpandedRoad(expanded ? null : road.id)}><ChevronDown size={17} /></button>
              </div>
              {expanded && (
                <div className="road-paver-editor">
                  {!road.targetKnown && <div className="paver-target-warning">This road is buildable, but its material target is missing from the available data. It can’t be included in cargo totals yet.</div>}
                  <div className="paver-resource-grid">
                    {roadMaterials.map(({ key, name, tone, capacity }) => {
                      const Icon = materialIcons[key];
                      const remaining = road.remaining[key];
                      const suggestedAmount = capacity
                        ? containerSizes.reduce((sum, size, index) => sum + road.containers[key][size] * capacity[index], 0)
                        : remaining;
                      const overage = Math.max(0, suggestedAmount - remaining);
                      return (
                        <section className="paver-resource-card" key={key}>
                          <div className="paver-resource-title"><span className={`material-icon material-${tone}`}><Icon size={16} /></span><strong>{name}</strong>{key !== 'chiral' && <span className="capacity-hint">S {capacity?.[0]} / XL4 {capacity?.[6]}</span>}</div>
                          <div className="paver-input-row">
                            <div className="paver-required-value"><span>REQUIRED</span><strong>{road.required[key].toLocaleString()}</strong></div>
                            <label>IN STOCK<input type="number" min="0" step="1" inputMode="numeric" value={road.deposited[key] || ''} placeholder="0" onChange={(event) => updateDeposited(road.id, key, Number(event.target.value))} aria-label={`${name} currently in stock`} /></label>
                          </div>
                          <div className="paver-remaining"><span>STILL NEEDED</span><strong>{remaining.toLocaleString()}</strong></div>
                          {key !== 'chiral' && remaining > 0 && (
                            <div className="paver-cargo-details">
                              <div className="paver-container-plan"><span><Package size={13} /> CARRY</span><div>{containerSizes.map((size) => road.containers[key][size] > 0 && <b className={`carry-size carry-${size.toLowerCase()}`} key={size}>{size} <i>×{road.containers[key][size]}</i></b>)}</div></div>
                              <div className="paver-sent-total"><span>WILL SEND</span><b>{suggestedAmount.toLocaleString()} {key === 'metals' ? 'MTL' : 'CRM'}</b>{overage > 0 && <i>+{overage.toLocaleString()} extra</i>}</div>
                            </div>
                          )}
                          {key === 'chiral' && remaining > 0 && <div className="paver-cargo-details"><div className="paver-sent-total loose-plan"><span><Gem size={13} /> WILL SEND LOOSE</span><b>{suggestedAmount.toLocaleString()} CXl</b></div></div>}
                        </section>
                      );
                    })}
                  </div>
                  <div className="paver-editor-foot"><CircleHelp size={13} /><span>Preset targets come from community-captured DS1 pavers; check in-game values if they differ. Deposited amounts vary by save and online contributions.</span></div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="road-source-note"><span>DS1 COMMUNITY PAVER TARGETS</span><a href={roadPresetSource} target="_blank" rel="noreferrer">Paver data source</a><span className="source-divider">/</span><span>Four Route 23 targets are unverified and excluded from totals. Deposits start at 0. Chiral Crystals are carried loose.</span></div>
    </section>
  );
}

export default RoadPlanner;
