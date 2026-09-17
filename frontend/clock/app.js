const TIMEZONES = [
  { city: '北京', country: '中国', zone: 'Asia/Shanghai', flag: '🇨🇳' },
  { city: '东京', country: '日本', zone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: '新加坡', country: '新加坡', zone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: '迪拜', country: '阿联酋', zone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: '伦敦', country: '英国', zone: 'Europe/London', flag: '🇬🇧' },
  { city: '巴黎', country: '法国', zone: 'Europe/Paris', flag: '🇫🇷' },
  { city: '纽约', country: '美国', zone: 'America/New_York', flag: '🇺🇸' },
  { city: '旧金山', country: '美国', zone: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: '圣保罗', country: '巴西', zone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { city: '悉尼', country: '澳大利亚', zone: 'Australia/Sydney', flag: '🇦🇺' },
];

const DEFAULT_ZONES = ['Asia/Shanghai', 'Europe/London', 'America/New_York', 'Asia/Tokyo'];
const grid = document.querySelector('#clockGrid');
const search = document.querySelector('#timezoneSearch');
const dialog = document.querySelector('#clockDialog');
const form = document.querySelector('#clockForm');
const select = document.querySelector('#timezoneSelect');
const themeToggle = document.querySelector('#themeToggle');
let selectedZones = JSON.parse(localStorage.getItem('world-clock-zones') || 'null') || DEFAULT_ZONES;

const getTimeParts = (zone) => {
  const now = new Date();
  const time = new Intl.DateTimeFormat('zh-CN', {
    timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat('zh-CN', {
    timeZone: zone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(now);
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, timeZoneName: 'shortOffset', hour: '2-digit', minute: '2-digit',
  }).formatToParts(now).find((part) => part.type === 'timeZoneName')?.value || 'UTC';
  return { time, date, offset };
};

function cityFor(zone) {
  return TIMEZONES.find((item) => item.zone === zone) || {
    city: zone.split('/').pop().replaceAll('_', ' '), country: '', zone, flag: '🌐',
  };
}

function render(filter = '') {
  const query = filter.trim().toLowerCase();
  const visible = selectedZones.filter((zone) => {
    const item = cityFor(zone);
    return !query || `${item.city} ${item.country} ${item.zone}`.toLowerCase().includes(query);
  });
  grid.innerHTML = visible.length ? visible.map((zone) => {
    const item = cityFor(zone);
    const parts = getTimeParts(zone);
    return `<article class="clock-card" data-zone="${zone}">
      <div class="card-top"><span class="flag">${item.flag}</span><button class="remove-button" data-remove="${zone}" aria-label="移除${item.city}">×</button></div>
      <div class="location">${item.city}<span>${item.country}</span></div>
      <div class="digital-time">${parts.time}</div>
      <div class="date">${parts.date}</div>
      <div class="card-bottom"><span>${parts.offset}</span><span>${zone}</span></div>
    </article>`;
  }).join('') : '<div class="empty-state">没有匹配的时区</div>';
}

function save() {
  localStorage.setItem('world-clock-zones', JSON.stringify(selectedZones));
}

TIMEZONES.forEach((item) => {
  const option = document.createElement('option');
  option.value = item.zone;
  option.textContent = `${item.flag} ${item.city} · ${item.zone}`;
  select.append(option);
});

document.querySelector('#addClock').addEventListener('click', () => {
  const available = TIMEZONES.filter((item) => !selectedZones.includes(item.zone));
  select.innerHTML = available.map((item) => `<option value="${item.zone}">${item.flag} ${item.city} · ${item.zone}</option>`).join('');
  if (available.length) dialog.showModal();
  else alert('所有预置时区均已添加');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (select.value && !selectedZones.includes(select.value)) selectedZones.push(select.value);
  save(); render(search.value); dialog.close();
});

grid.addEventListener('click', (event) => {
  const zone = event.target.dataset.remove;
  if (!zone) return;
  selectedZones = selectedZones.filter((item) => item !== zone);
  save(); render(search.value);
});

search.addEventListener('input', () => render(search.value));
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀' : '☾';
});

render();
setInterval(() => render(search.value), 1000);
