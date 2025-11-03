// Simple localStorage layer
const STORAGE = {
  AKEY: 'em_activities', // [{id,name,delta}]
  DKEY: 'em_days',       // {'YYYY-MM-DD': {date, baseline, entries:[{id,name,delta,note,time,activityId?}]}}
  _read(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } },
  _write(key, value){ localStorage.setItem(key, JSON.stringify(value)) },

  getActivities(){ return this._read(this.AKEY, []) },
  saveActivities(list){ this._write(this.AKEY, list) },

  getDays(){ return this._read(this.DKEY, {}) },
  saveDays(map){ this._write(this.DKEY, map) },

  upsertDay(dayObj){ const map = this.getDays(); map[dayObj.date] = dayObj; this.saveDays(map); },
  getDay(date){ const map = this.getDays(); return map[date] ?? { date, baseline: 100, entries: [] }; }
};

// Helpers
const uid = () => Math.random().toString(36).slice(2,9);
const todayISO = () => new Date().toISOString().slice(0,10);
const fmt = n => (n>0?`+${n}`:`${n}`);
const sum = arr => arr.reduce((a,b)=>a+(+b||0),0);

// Compute remaining energy for a day
function computeRemaining(day){
  return (Number(day.baseline)||0) + sum(day.entries.map(e=>e.delta));
}

// ---- Index page ----
function initIndex(){
  const dateEl = document.querySelector('#today');
  const remainingEl = document.querySelector('#remaining');
  const listEl = document.querySelector('#recent');

  const d = STORAGE.getDay(todayISO());
  dateEl.textContent = d.date;
  remainingEl.textContent = computeRemaining(d);

  // Latest 5 days
  const days = Object.values(STORAGE.getDays())
    .sort((a,b)=> b.date.localeCompare(a.date))
    .slice(0,5);

  listEl.innerHTML = days.length ? days.map(dd=>{
    const r = computeRemaining(dd);
    const cls = r>=0?'positive':'negative';
    return `<li><span class="mono">${dd.date}</span> — Remaining <span class="badge ${cls}">${r}</span></li>`;
  }).join('') : '<li class="small">No records yet. Go to “Log” to add one.</li>';
}

// ---- Activities page ----
function initActivities(){
  const form = document.querySelector('#act-form');
  const nameEl = document.querySelector('#act-name');
  const deltaEl = document.querySelector('#act-delta');
  const table = document.querySelector('#act-table tbody');

  function render(){
    const list = STORAGE.getActivities();
    table.innerHTML = list.length ? list.map(a=>`
      <tr>
        <td>${a.name}</td>
        <td class="mono">${fmt(a.delta)}</td>
        <td><button data-del="${a.id}">Delete</button></td>
      </tr>`).join('') : `<tr><td colspan="3" class="small">No activities yet. Add some like: Sleep +40, Study -15, Workout -30, Social -20.</td></tr>`;
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = nameEl.value.trim();
    const delta = Number(deltaEl.value);
    if(!name || !Number.isFinite(delta)) return;
    const list = STORAGE.getActivities();
    list.push({id: uid(), name, delta});
    STORAGE.saveActivities(list);
    form.reset();
    render();
  });

  table.addEventListener('click', (e)=>{
    const id = e.target?.dataset?.del;
    if(!id) return;
    const list = STORAGE.getActivities().filter(x=>x.id!==id);
    STORAGE.saveActivities(list);
    render();
  });

  render();
}

// ---- Log page ----
function initLog(){
  const dateEl = document.querySelector('#date');
  const baselineEl = document.querySelector('#baseline');
  const remainingEl = document.querySelector('#remain');
  const selectEl = document.querySelector('#act-select');
  const deltaEl = document.querySelector('#delta');
  const noteEl = document.querySelector('#note');
  const addBtn = document.querySelector('#add-entry');
  const table = document.querySelector('#log-table tbody');

  // Default date: today
  dateEl.value = todayISO();

  function loadActivitiesSelect(){
    const acts = STORAGE.getActivities();
    selectEl.innerHTML = `<option value="">Choose activity (or type a custom value)</option>` +
      acts.map(a=>`<option value="${a.id}" data-delta="${a.delta}">${a.name} (${fmt(a.delta)})</option>`).join('');
  }

  function loadDay(){
    const d = STORAGE.getDay(dateEl.value);
    baselineEl.value = d.baseline;
    renderDay(d);
  }

  function renderDay(day){
    remainingEl.textContent = computeRemaining(day);
    table.innerHTML = day.entries.length ? day.entries.map(e=>`
      <tr>
        <td>${new Date(e.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
        <td>${e.name}</td>
        <td class="mono">${fmt(e.delta)}</td>
        <td class="small">${e.note||''}</td>
        <td><button data-del="${e.id}">Delete</button></td>
      </tr>`).join('') : `<tr><td colspan="5" class="small">No entries for this day. Add one below.</td></tr>`;
  }

  function saveBaseline(){
    const d = STORAGE.getDay(dateEl.value);
    d.baseline = Number(baselineEl.value)||0;
    STORAGE.upsertDay(d);
    renderDay(d);
  }

  // Events
  dateEl.addEventListener('change', loadDay);
  baselineEl.addEventListener('change', saveBaseline);

  selectEl.addEventListener('change', ()=>{
    const dv = Number(selectEl.selectedOptions[0]?.dataset?.delta);
    if(Number.isFinite(dv)) deltaEl.value = dv;
  });

  addBtn.addEventListener('click', ()=>{
    const day = STORAGE.getDay(dateEl.value);
    const actId = selectEl.value || null;
    const acts = STORAGE.getActivities();
    let name = 'Custom';
    let dlt = Number(deltaEl.value);
    if (actId){
      const a = acts.find(x=>x.id===actId);
      if(a){ name = a.name; if(!deltaEl.value) dlt = a.delta; }
    }
    if(!Number.isFinite(dlt) || dlt===0) return;
    day.entries.push({
      id: uid(),
      activityId: actId,
      name, delta: dlt,
      note: noteEl.value.trim(),
      time: new Date().toISOString()
    });
    STORAGE.upsertDay(day);
    noteEl.value = '';
    renderDay(day);
  });

  table.addEventListener('click', (e)=>{
    const id = e.target?.dataset?.del;
    if(!id) return;
    const d = STORAGE.getDay(dateEl.value);
    d.entries = d.entries.filter(x=>x.id!==id);
    STORAGE.upsertDay(d);
    renderDay(d);
  });

  // Initial
  loadActivitiesSelect();
  loadDay();
}

// Entry point
document.addEventListener('DOMContentLoaded', ()=>{
  const page = document.body.dataset.page;
  if(page==='index') initIndex();
  if(page==='activities') initActivities();
  if(page==='log') initLog();
});
