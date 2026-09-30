import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { resources, structures, type Category, type ResourceKey, type Structure } from './data';

type PlanItem = { id: string; quantity: number };
type RecipeMap = Record<string, Partial<Record<ResourceKey, number>>>;
type Inventory = Record<ResourceKey, number>;
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const categoryOptions: ('All structures' | Category)[] = ['All structures', 'Network', 'Shelter', 'Traversal'];
const blankInventory: Inventory = { chiral: 0, metals: 0, ceramics: 0, chemicals: 0, alloys: 0 };

function App() {
  const [activeCategory, setActiveCategory] = useState<(typeof categoryOptions)[number]>('All structures');
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [inventory, setInventory] = useState<Inventory>(blankInventory);
  const [recipes, setRecipes] = useState<RecipeMap>(() => Object.fromEntries(structures.map((item) => [item.id, item.recipe])));
  const [editing, setEditing] = useState<Structure | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const clearInstallPrompt = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', clearInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', clearInstallPrompt);
    };
  }, []);

  const visibleStructures = structures.filter((structure) => {
    const matchesCategory = activeCategory === 'All structures' || structure.category === activeCategory;
    const matchesSearch = structure.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totals = useMemo(() => {
    const result = { ...blankInventory };
    plan.forEach(({ id, quantity }) => {
      const recipe = recipes[id] ?? {};
      resources.forEach(({ key }) => {
        result[key] += (recipe[key] ?? 0) * quantity;
      });
    });
    return result;
  }, [plan, recipes]);

  const totalStructures = plan.reduce((sum, item) => sum + item.quantity, 0);
  const addToPlan = (id: string) => setPlan((current) => {
    const existing = current.find((item) => item.id === id);
    return existing
      ? current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...current, { id, quantity: 1 }];
  });
  const adjustQuantity = (id: string, delta: number) => setPlan((current) => current
    .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0));
  const updateRecipe = (key: ResourceKey, amount: number) => {
    if (!editing) return;
    setRecipes((current) => ({
      ...current,
      [editing.id]: { ...current[editing.id], [key]: Math.max(0, amount) },
    }));
  };
  const resetPlan = () => setPlan([]);
  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Bridge Planner home">
          <div className="brand-mark"><span /></div>
          <span className="brand-copy"><strong>BRIDGE</strong><small>NETWORK OPERATIONS</small></span>
        </a>
        <div className="topbar-center"><span className="signal-dot" /> UCA NETWORK <span className="topbar-divider">/</span> FIELD PLANNER</div>
        <div className="topbar-right">
          {installPrompt && <button className="install-button" type="button" onClick={installApp}><Download size={14} /><span>Install</span></button>}
          <span className="offline-label"><span className="offline-dot" /> OFFLINE READY</span>
          <button className="help-button" type="button" aria-label="About recipe values" title="Recipes are editable estimates for base construction"><CircleHelp size={17} /></button>
          <div className="profile-mark">S</div>
        </div>
      </header>

      <main id="top" className="main-layout">
        <section className="planner-column">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> DELIVERY PLANNING <span className="heading-code">// 01</span></div>
              <h1>Structure planner</h1>
              <p>Build your route. Know what to carry.</p>
            </div>
            <div className="heading-stats">
              <div><span>PLANNED</span><strong>{String(totalStructures).padStart(2, '0')} <small>units</small></strong></div>
              <div className="stats-separator" />
              <div><span>STRUCTURE TYPES</span><strong>{String(plan.length).padStart(2, '0')} <small>types</small></strong></div>
            </div>
          </div>

          <div className="catalog-toolbar">
            <div className="tabs" role="tablist" aria-label="Structure categories">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  className={`tab ${activeCategory === category ? 'active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'All structures' ? 'All structures' : category}
                  <span className="tab-count">{category === 'All structures' ? structures.length : structures.filter((item) => item.category === category).length}</span>
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a structure" aria-label="Find a structure" />
              <span className="search-key">/</span>
            </label>
          </div>

          <div className="catalog-grid">
            {visibleStructures.map((structure, index) => {
              const Icon = structure.icon;
              const recipe = recipes[structure.id] ?? structure.recipe;
              return (
                <article className="structure-card" key={structure.id} style={{ animationDelay: `${index * 45}ms` }}>
                  <div className="structure-card-top">
                    <div className={`structure-icon icon-${structure.category.toLowerCase()}`}><Icon size={21} strokeWidth={1.7} /></div>
                    <span className="pcc-tag">{structure.pcc}</span>
                    <button className="icon-button recipe-edit" type="button" aria-label={`Edit ${structure.name} recipe`} title="Edit material recipe" onClick={() => setEditing(structure)}><Settings2 size={16} /></button>
                  </div>
                  <div className="structure-title-row">
                    <div><span className="structure-category">{structure.category}</span><h2>{structure.name}</h2></div>
                    <span className="structure-index">{String(structures.findIndex((item) => item.id === structure.id) + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="structure-note">{structure.note}</p>
                  <div className="recipe-preview">
                    {resources.filter(({ key }) => (recipe[key] ?? 0) > 0).map(({ key, short, tone }) => (
                      <div className="recipe-chip" key={key}><span className={`resource-dot ${tone}`} /> <span>{short}</span><b>{recipe[key]?.toLocaleString()}</b></div>
                    ))}
                  </div>
                  <button className="add-button" type="button" onClick={() => addToPlan(structure.id)}>
                    <Plus size={16} /> Add to plan <span className="button-pcc">{structure.pcc}</span>
                  </button>
                </article>
              );
            })}
            {visibleStructures.length === 0 && <div className="empty-search"><Search size={20} /><span>No structures match that search.</span></div>}
          </div>

          <div className="catalog-footnote"><CircleHelp size={14} /><span>Base construction recipes shown. Upgrade costs vary by structure level; adjust any recipe with the settings control.</span></div>
        </section>

        <aside className="manifest-panel">
          <div className="manifest-heading">
            <div className="manifest-title"><div className="manifest-icon"><Boxes size={19} /></div><div><span className="eyebrow-small">CARGO MANIFEST</span><h2>Required materials</h2></div></div>
            <button className="icon-button reset-button" type="button" aria-label="Clear plan" title="Clear plan" onClick={resetPlan} disabled={plan.length === 0}><RotateCcw size={16} /></button>
          </div>
          <div className="manifest-summary"><span>DELIVERY LOAD</span><strong>{String(totalStructures).padStart(2, '0')} <small>structures</small></strong><span className="summary-mark"><Truck size={18} /></span></div>

          <div className="plan-list">
            {plan.length === 0 ? (
              <div className="empty-plan"><div className="empty-plan-art"><Package size={25} /></div><strong>Your route is clear.</strong><span>Add structures to calculate the cargo needed for your build.</span></div>
            ) : plan.map((item) => {
              const structure = structures.find((entry) => entry.id === item.id)!;
              const Icon = structure.icon;
              return (
                <div className="plan-row" key={item.id}>
                  <div className="plan-item-icon"><Icon size={16} /></div>
                  <div className="plan-item-info"><strong>{structure.name}</strong><span>{structure.pcc}</span></div>
                  <div className="quantity-control">
                    <button type="button" aria-label={`Remove one ${structure.name}`} onClick={() => adjustQuantity(item.id, -1)}><Minus size={13} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Add one ${structure.name}`} onClick={() => adjustQuantity(item.id, 1)}><Plus size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="manifest-divider"><span>MATERIAL BREAKDOWN</span><span>{resources.filter(({ key }) => totals[key] > 0).length} TYPES</span></div>
          <div className="material-list">
            {resources.filter(({ key }) => totals[key] > 0 || (plan.length > 0 && key === 'ceramics')).map(({ key, name, tone }) => {
              const missing = Math.max(0, totals[key] - inventory[key]);
              const covered = totals[key] > 0 && inventory[key] >= totals[key];
              return (
                <div className={`material-row ${totals[key] === 0 ? 'unused-resource' : ''}`} key={key}>
                  <span className={`resource-dot ${tone}`} />
                  <span className="material-name">{name}</span>
                  <strong className="material-total">{totals[key].toLocaleString()}</strong>
                  {totals[key] > 0 && <span className={`material-status ${covered ? 'covered' : ''}`}>{covered ? <Check size={12} /> : `${missing.toLocaleString()} needed`}</span>}
                  {totals[key] === 0 && <span className="material-status">Not required</span>}
                </div>
              );
            })}
            {plan.length === 0 && <div className="no-materials">Material totals appear when you add a structure.</div>}
          </div>

          <button className={`inventory-toggle ${showInventory ? 'is-open' : ''}`} type="button" onClick={() => setShowInventory(!showInventory)} aria-expanded={showInventory}>
            <span><ArrowDownToLine size={15} /> Compare with carried inventory</span><ChevronDown size={16} />
          </button>
          {showInventory && (
            <div className="inventory-editor">
              <p>Enter what you already have. Missing amounts update automatically.</p>
              {resources.map(({ key, name, tone }) => (
                <label className="inventory-field" key={key}>
                  <span><i className={`resource-dot ${tone}`} />{name}</span>
                  <input type="number" min="0" inputMode="numeric" value={inventory[key] || ''} placeholder="0" onChange={(event) => setInventory((current) => ({ ...current, [key]: Math.max(0, Number(event.target.value)) }))} aria-label={`${name} in inventory`} />
                </label>
              ))}
            </div>
          )}

          <div className="manifest-bottom"><ShieldCheck size={15} /><span>PLAN SAVED LOCALLY FOR THIS SESSION</span><ArrowUpRight size={14} /></div>
        </aside>
      </main>

      <footer className="bottom-status"><div><span className="status-indicator" /> CONNECTION STATUS <b>OFFLINE</b></div><div>BRIDGES ESTABLISHED <b>01 / 05</b></div><div className="footer-game">DEATH STRANDING <span>•</span> FIELD TOOLS</div></footer>

      {editing && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="recipe-modal-title">
            <div className="modal-heading"><div><span className="eyebrow-small">CUSTOM RECIPE / {editing.pcc}</span><h2 id="recipe-modal-title">{editing.name} materials</h2></div><button className="icon-button" type="button" aria-label="Close recipe editor" onClick={() => setEditing(null)}><X size={18} /></button></div>
            <p className="modal-copy">Set the quantities required for one structure. Your manifest recalculates as you edit.</p>
            <div className="recipe-editor-fields">
              {resources.map(({ key, name, tone }) => (
                <label className="recipe-field" key={key}>
                  <span><i className={`resource-dot ${tone}`} />{name}</span>
                  <input type="number" min="0" inputMode="numeric" value={recipes[editing.id]?.[key] ?? 0} onChange={(event) => updateRecipe(key, Number(event.target.value))} />
                </label>
              ))}
            </div>
            <div className="modal-actions"><button className="text-button" type="button" onClick={() => { setRecipes((current) => ({ ...current, [editing.id]: editing.recipe })); }}>Reset to base recipe</button><button className="confirm-button" type="button" onClick={() => setEditing(null)}><Check size={15} /> Done</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
