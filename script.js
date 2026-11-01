document.addEventListener('DOMContentLoaded', () => {
  const DB_KEY = 'parking_db';

  // Базові дані для ініціалізації порожнього сховища
  const SEED_DATA = {
    spots: [
      { code: 'A-101', floor: '1', category: 'Електро', status: 'Зайняте', rate: '60', hasCharging: 'Так', sector: 'A' },
      { code: 'B-205', floor: '2', category: 'Легковий', status: 'Вільне', rate: '40', hasCharging: 'Ні', sector: 'B' }
    ],
    vehicles: [
      { plate: 'AA 1234 BB', brand: 'Tesla', model: 'Model 3', color: 'Білий', driver: 'Коваль О. В.', phone: '+380671112233', time: '08:30' }
    ],
    sessions: [
      { id: 'T-901', spotCode: 'A-101', vehiclePlate: 'AA 1234 BB', start: '08:30', end: '11:30', cost: '180', status: 'Оплачено' }
    ]
  };

  // API для роботи зі сховищем
  const Storage = {
    get: () => JSON.parse(localStorage.getItem(DB_KEY)) || { spots: [], vehicles: [], sessions: [] },
    save: (data) => {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      updateStorageBadge();
    },
    init: function() { if (!localStorage.getItem(DB_KEY)) this.save(SEED_DATA); },
    clear: function() { localStorage.removeItem(DB_KEY); updateStorageBadge(); }
  };

  // Оновлення статусу LocalStorage в UI
  function updateStorageBadge() {
    const badge = document.getElementById('storage-status');
    const data = JSON.parse(localStorage.getItem(DB_KEY));
    
    if (data) {
      const count = data.spots.length + data.vehicles.length + data.sessions.length;
      badge.textContent = `Підключено (${count} записів)`;
      badge.className = 'badge active';
    } else {
      badge.textContent = 'Порожньо';
      badge.className = 'badge empty';
    }
  }

  // Оновлення випадаючих списків (Реляційність)
  function updateDropdowns(db) {
    const spotSelect = document.getElementById('ses-spot');
    const plateSelect = document.getElementById('ses-plate');
    
    const currSpot = spotSelect.value;
    const currPlate = plateSelect.value;

    spotSelect.innerHTML = '<option value="" disabled selected>Оберіть паркомісце...</option>';
    plateSelect.innerHTML = '<option value="" disabled selected>Оберіть держномер...</option>';

    db.spots.forEach(s => {
      const opt = new Option(`${s.code} (Поверх ${s.floor}, ${s.category})`, s.code);
      if (s.code === currSpot) opt.selected = true;
      spotSelect.add(opt);
    });

    db.vehicles.forEach(v => {
      const opt = new Option(`${v.plate} (${v.brand} - ${v.driver})`, v.plate);
      if (v.plate === currPlate) opt.selected = true;
      plateSelect.add(opt);
    });
  }

  // Універсальний рендеринг усіх таблиць
  function renderApp() {
    const db = Storage.get();
    
    const tableConfigs = [
      { id: 'spots', msg: 'Додайте місце через форму.' },
      { id: 'vehicles', msg: 'Додайте авто через форму.' },
      { id: 'sessions', msg: 'Оформіть сесію через форму.' }
    ];

    tableConfigs.forEach(({ id, msg }) => {
      const tbody = document.querySelector(`#table-${id} tbody`);
      tbody.innerHTML = '';
      
      if (db[id].length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="10">${msg}</td></tr>`;
      } else {
        db[id].forEach((item, index) => {
          const tr = document.createElement('tr');
          tr.dataset.index = index;
          tr.dataset.entity = id;
          
          // Динамічно створюємо комірки на основі ключів об'єкта
          Object.entries(item).forEach(([key, val]) => {
            const td = document.createElement('td');
            td.dataset.field = key;
            td.textContent = val;
            tr.appendChild(td);
          });
          
          // Комірка дії (Видалення)
          const actionTd = document.createElement('td');
          actionTd.className = 'action-cell';
          actionTd.innerHTML = `<button class="btn-delete" title="Видалити">✕</button>`;
          tr.appendChild(actionTd);
          
          tbody.appendChild(tr);
        });
      }
    });

    updateDropdowns(db);
    updateStorageBadge();
  }

  // Міжвкладочна синхронізація
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY) renderApp();
  });

  // Універсальний обробник відправки форм
  function handleFormSubmit(formId, entityName, getDataFn) {
    document.getElementById(formId).addEventListener('submit', (e) => {
      e.preventDefault();
      const db = Storage.get();
      db[entityName].push(getDataFn());
      Storage.save(db);
      renderApp();
      e.target.reset();
    });
  }

  // Прив'язка форм
  handleFormSubmit('form-spots', 'spots', () => ({
    code: document.getElementById('spot-code').value.trim(),
    floor: document.getElementById('spot-floor').value,
    category: document.getElementById('spot-category').value,
    status: document.getElementById('spot-status').value,
    rate: document.getElementById('spot-rate').value,
    hasCharging: document.getElementById('spot-hasCharging').value,
    sector: document.getElementById('spot-sector').value.trim()
  }));

  handleFormSubmit('form-vehicles', 'vehicles', () => ({
    plate: document.getElementById('veh-plate').value.trim(),
    brand: document.getElementById('veh-brand').value.trim(),
    model: document.getElementById('veh-model').value.trim(),
    color: document.getElementById('veh-color').value.trim(),
    driver: document.getElementById('veh-driver').value.trim(),
    phone: document.getElementById('veh-phone').value.trim(),
    time: document.getElementById('veh-time').value
  }));

  handleFormSubmit('form-sessions', 'sessions', () => ({
    id: document.getElementById('ses-id').value.trim(),
    spotCode: document.getElementById('ses-spot').value,
    vehiclePlate: document.getElementById('ses-plate').value,
    start: document.getElementById('ses-start').value,
    end: document.getElementById('ses-end').value,
    cost: document.getElementById('ses-cost').value,
    status: document.getElementById('ses-status').value
  }));

  // Видалення з перевіркою зв'язків
  function deleteRow(entity, index) {
    const db = Storage.get();

    if (entity === 'spots') {
      const code = db.spots[index].code;
      if (db.sessions.some(s => s.spotCode === code)) {
        return alert(`Помилка: Паркомісце «${code}» використовується в сесії.`);
      }
    } else if (entity === 'vehicles') {
      const plate = db.vehicles[index].plate;
      if (db.sessions.some(s => s.vehiclePlate === plate)) {
        return alert(`Помилка: Автомобіль «${plate}» зафіксований в сесії.`);
      }
    }

    db[entity].splice(index, 1);
    Storage.save(db);
    renderApp();
  }

  // Інлайн-редагування
  function editCell(cell) {
    if (cell.querySelector('input')) return;

    const tr = cell.closest('tr');
    const { index, entity } = tr.dataset;
    const field = cell.dataset.field;
    const oldVal = cell.textContent.trim();

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cell-input';
    input.value = oldVal;
    
    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    let isSaved = false;
    const commit = () => {
      if (isSaved) return;
      isSaved = true;
      const db = Storage.get();
      db[entity][index][field] = input.value.trim() || oldVal;
      Storage.save(db);
      renderApp();
    };

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commit();
      if (e.key === 'Escape') {
        isSaved = true;
        cell.textContent = oldVal;
      }
    });
  }

  // Делегування подій для таблиць
  document.querySelectorAll('table').forEach(table => {
    table.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete')) {
        const tr = e.target.closest('tr');
        deleteRow(tr.dataset.entity, parseInt(tr.dataset.index, 10));
      } else {
        const cell = e.target.closest('td');
        if (cell && !cell.classList.contains('action-cell') && !cell.closest('.empty-row')) {
          editCell(cell);
        }
      }
    });
  });

  // Перемикання табів
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Кнопки діагностики сховища
  document.getElementById('btn-seed').addEventListener('click', () => {
    Storage.save(SEED_DATA);
    renderApp();
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Очистити всі збережені дані з LocalStorage?')) {
      Storage.clear();
      renderApp();
    }
  });

  // Точка входу
  Storage.init();
  renderApp();
});
