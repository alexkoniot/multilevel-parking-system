document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'parking_system_data';

  // Початкові демонстраційні дані за замовчуванням
  const defaultState = {
    spots: [
      ['A-101', '1', 'Електро', 'Зайняте', '60', 'Так', 'A'],
      ['B-205', '2', 'Легковий', 'Вільне', '40', 'Ні', 'B'],
      ['C-301', '3', 'SUV', 'Вільне', '50', 'Ні', 'C']
    ],
    vehicles: [
      ['AA 1234 BB', 'Tesla', 'Model 3', 'Білий', 'Коваль О. В.', '+380671112233', '08:30'],
      ['BC 5544 AI', 'Toyota', 'RAV4', 'Сірий', 'Мельник Д. І.', '+380502223344', '09:15'],
      ['KA 9988 OO', 'BMW', 'X5', 'Чорний', 'Шевченко Т. Г.', '+380931234567', '10:00']
    ],
    sessions: [
      ['S-901', 'A-101', 'AA 1234 BB', '08:30', '11:30', '180', 'Оплачено']
    ]
  };

  // Поточний робочий стан у пам'яті
  let state = {
    spots: [],
    vehicles: [],
    sessions: []
  };

  // ==========================================
  // 1. РОБОТА З LOCALSTORAGE
  // ==========================================
  function loadState() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        state = JSON.parse(savedData);
      } else {
        // Якщо це перший запуск — записуємо базові дані
        state = JSON.parse(JSON.stringify(defaultState));
        saveState();
      }
    } catch (e) {
      console.error('Помилка читання з LocalStorage:', e);
      state = JSON.parse(JSON.stringify(defaultState));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Помилка запису в LocalStorage:', e);
    }
  }

  // ==========================================
  // 2. ДИНАМІЧНІ СПИСКИ (ВИМОГА №4)
  // ==========================================
  // Замість ручного введення — заповнюємо <select> значеннями з таблиць
  function updateSessionDropdowns() {
    const spotSelect = document.getElementById('ses-spot');
    const plateSelect = document.getElementById('ses-plate');

    const currentSelectedSpot = spotSelect.value;
    const currentSelectedPlate = plateSelect.value;

    // Очищаємо старі пункти
    spotSelect.innerHTML = '<option value="" disabled selected>Оберіть паркомісце...</option>';
    plateSelect.innerHTML = '<option value="" disabled selected>Оберіть держномер авто...</option>';

    // Наповнюємо паркомісцями (беремо значення колонки 0 — "Номер місця")
    state.spots.forEach(spot => {
      const spotNum = spot[0];
      const opt = document.createElement('option');
      opt.value = spotNum;
      opt.textContent = `${spotNum} (Поверх ${spot[1]}, ${spot[2]})`;
      if (spotNum === currentSelectedSpot) opt.selected = true;
      spotSelect.appendChild(opt);
    });

    // Наповнюємо автомобілями (беремо значення колонки 0 — "Держномер")
    state.vehicles.forEach(veh => {
      const plate = veh[0];
      const opt = document.createElement('option');
      opt.value = plate;
      opt.textContent = `${plate} (${veh[1]} ${veh[2]} - ${veh[4]})`;
      if (plate === currentSelectedPlate) opt.selected = true;
      plateSelect.appendChild(opt);
    });
  }

  // ==========================================
  // 3. ВІДОБРАЖЕННЯ ТАБЛИЦЬ (RENDER)
  // ==========================================
  function renderTable(tableId, dataList) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';

    dataList.forEach((rowValues, rowIndex) => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-row-index', rowIndex);

      // Комірки з даними
      rowValues.forEach((val, colIndex) => {
        const td = document.createElement('td');
        td.textContent = val;
        td.setAttribute('data-col-index', colIndex);
        tr.appendChild(td);
      });

      // Комірка з кнопкою видалення
      const actionTd = document.createElement('td');
      actionTd.className = 'action-cell';
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.title = 'Видалити';
      deleteBtn.textContent = '✕';
      actionTd.appendChild(deleteBtn);
      tr.appendChild(actionTd);

      tbody.appendChild(tr);
    });
  }

  function renderAll() {
    renderTable('table-spots', state.spots);
    renderTable('table-vehicles', state.vehicles);
    renderTable('table-sessions', state.sessions);
    updateSessionDropdowns();
  }

  // ==========================================
  // 4. МІЖВКЛАДОЧНА СИНХРОНІЗАЦІЯ (STORAGE EVENT)
  // ==========================================
  // Якщо в іншій вкладці або вікні змінилися дані — негайно оновлюємо поточну сторінку
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      loadState();
      renderAll();
    }
  });

  // ==========================================
  // 5. ПЕРЕМИКАННЯ ТАБІВ
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // ==========================================
  // 6. ДОДАВАННЯ ДАНИХ З ФОРМ
  // ==========================================
  document.getElementById('form-spots').addEventListener('submit', (e) => {
    e.preventDefault();
    const newSpot = [
      document.getElementById('spot-number').value.trim(),
      document.getElementById('spot-floor').value,
      document.getElementById('spot-type').value,
      document.getElementById('spot-status').value,
      document.getElementById('spot-rate').value,
      document.getElementById('spot-charger').value,
      document.getElementById('spot-sector').value.trim()
    ];

    state.spots.push(newSpot);
    saveState();
    renderAll();
    e.target.reset();
  });

  document.getElementById('form-vehicles').addEventListener('submit', (e) => {
    e.preventDefault();
    const newVeh = [
      document.getElementById('veh-plate').value.trim(),
      document.getElementById('veh-brand').value.trim(),
      document.getElementById('veh-model').value.trim(),
      document.getElementById('veh-color').value.trim(),
      document.getElementById('veh-owner').value.trim(),
      document.getElementById('veh-phone').value.trim(),
      document.getElementById('veh-time').value
    ];

    state.vehicles.push(newVeh);
    saveState();
    renderAll();
    e.target.reset();
  });

  document.getElementById('form-sessions').addEventListener('submit', (e) => {
    e.preventDefault();
    const newSession = [
      document.getElementById('ses-id').value.trim(),
      document.getElementById('ses-spot').value, // Обрано з <select>
      document.getElementById('ses-plate').value, // Обрано з <select>
      document.getElementById('ses-start').value,
      document.getElementById('ses-end').value,
      document.getElementById('ses-cost').value,
      document.getElementById('ses-status').value
    ];

    state.sessions.push(newSession);
    saveState();
    renderAll();
    e.target.reset();
  });

  // ==========================================
  // 7. РЕЛЯЦІЙНА ПЕРЕВІРКА ТА ВИДАЛЕННЯ
  // ==========================================
  function handleDelete(tableId, rowIndex) {
    if (tableId === 'table-spots') {
      const spotNumber = state.spots[rowIndex][0];
      const isUsed = state.sessions.some(ses => ses[1] === spotNumber);
      if (isUsed) {
        alert(`Помилка видалення!\n\nПаркомісце «${spotNumber}» зараз фігурує у списку сесій.\nСпочатку видаліть або змініть прив'язану сесію.`);
        return;
      }
      if (confirm(`Видалити паркомісце «${spotNumber}»?`)) {
        state.spots.splice(rowIndex, 1);
        saveState();
        renderAll();
      }
    } else if (tableId === 'table-vehicles') {
      const licensePlate = state.vehicles[rowIndex][0];
      const isUsed = state.sessions.some(ses => ses[2] === licensePlate);
      if (isUsed) {
        alert(`Помилка видалення!\n\nАвтомобіль «${licensePlate}» зафіксований у сесіях.\nВидалення неможливе.`);
        return;
      }
      if (confirm(`Видалити автомобіль «${licensePlate}»?`)) {
        state.vehicles.splice(rowIndex, 1);
        saveState();
        renderAll();
      }
    } else if (tableId === 'table-sessions') {
      const sessionId = state.sessions[rowIndex][0];
      if (confirm(`Видалити сесію «${sessionId}»?`)) {
        state.sessions.splice(rowIndex, 1);
        saveState();
        renderAll();
      }
    }
  }

  // ==========================================
  // 8. ІНЛАЙН-РЕДАГУВАННЯ КОМІРОК
  // ==========================================
  function handleInlineEdit(cell, tableId) {
    if (cell.querySelector('input')) return;

    const row = cell.closest('tr');
    const rowIndex = parseInt(row.getAttribute('data-row-index'), 10);
    const colIndex = parseInt(cell.getAttribute('data-col-index'), 10);

    const originalText = cell.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cell-input';
    input.value = originalText;

    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    let isSaved = false;
    const saveValue = () => {
      if (isSaved) return;
      isSaved = true;

      const newValue = input.value.trim();
      const finalValue = newValue !== '' ? newValue : originalText;

      // Оновлюємо стан залежно від таблиці
      if (tableId === 'table-spots') {
        state.spots[rowIndex][colIndex] = finalValue;
      } else if (tableId === 'table-vehicles') {
        state.vehicles[rowIndex][colIndex] = finalValue;
      } else if (tableId === 'table-sessions') {
        state.sessions[rowIndex][colIndex] = finalValue;
      }

      saveState();
      renderAll();
    };

    input.addEventListener('blur', saveValue);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveValue();
      } else if (e.key === 'Escape') {
        isSaved = true;
        cell.textContent = originalText;
      }
    });
  }

  // ==========================================
  // 9. ДЕЛЕГУВАННЯ ПОДІЙ ДЛЯ ВСІХ ТАБЛИЦЬ
  // ==========================================
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    table.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        const row = deleteBtn.closest('tr');
        const rowIndex = parseInt(row.getAttribute('data-row-index'), 10);
        handleDelete(table.id, rowIndex);
        return;
      }

      const cell = e.target.closest('td');
      if (cell && !cell.classList.contains('action-cell')) {
        handleInlineEdit(cell, table.id);
      }
    });
  });

  // Початкове завантаження та виведення даних
  loadState();
  renderAll();
});