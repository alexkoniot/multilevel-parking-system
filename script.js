document.addEventListener('DOMContentLoaded', () => {
  const DB_KEY = 'parking_db';

  const Storage = {
    get: () => JSON.parse(localStorage.getItem(DB_KEY)) || { spots: [], vehicles: [], sessions: [] },
    save: (data) => {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  };

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

  function renderApp() {
    const db = Storage.get();
    
    const tableConfigs = [
      { id: 'spots', msg: 'Дані відсутні. Додайте перше місце через форму.' },
      { id: 'vehicles', msg: 'Дані відсутні. Додайте перше авто через форму.' },
      { id: 'sessions', msg: 'Дані відсутні. Оформіть першу сесію через форму.' }
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
          
          Object.entries(item).forEach(([key, val]) => {
            const td = document.createElement('td');
            td.dataset.field = key;
            td.textContent = val;
            tr.appendChild(td);
          });
          
          const actionTd = document.createElement('td');
          actionTd.className = 'action-cell';
          actionTd.innerHTML = `<button class="btn-delete" title="Видалити">✕</button>`;
          tr.appendChild(actionTd);
          
          tbody.appendChild(tr);
        });
      }
    });

    updateDropdowns(db);
  }

  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY) renderApp();
  });

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

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  renderApp();
});