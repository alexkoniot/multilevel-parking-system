document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. ПЕРЕМИКАННЯ ТАБІВ
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
  // 2. ДОПОМІЖНА ФУНКЦІЯ СТВОРЕННЯ РЯДКА
  // ==========================================
  function createRow(values) {
    const tr = document.createElement('tr');

    // Додаємо 7 комірок із даними
    values.forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });

    // Додаємо 8-му комірку з кнопкою видалення
    const actionTd = document.createElement('td');
    actionTd.className = 'action-cell';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.title = 'Видалити';
    deleteBtn.textContent = '✕';
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    return tr;
  }

  // ==========================================
  // 3. ДОДАВАННЯ ДАНИХ З ФОРМ
  // ==========================================
  document.getElementById('form-spots').addEventListener('submit', (e) => {
    e.preventDefault();
    const values = [
      document.getElementById('spot-number').value.trim(),
      document.getElementById('spot-floor').value,
      document.getElementById('spot-type').value,
      document.getElementById('spot-status').value,
      document.getElementById('spot-rate').value,
      document.getElementById('spot-charger').value,
      document.getElementById('spot-sector').value.trim()
    ];
    document.querySelector('#table-spots tbody').appendChild(createRow(values));
    e.target.reset();
  });

  document.getElementById('form-vehicles').addEventListener('submit', (e) => {
    e.preventDefault();
    const values = [
      document.getElementById('veh-plate').value.trim(),
      document.getElementById('veh-brand').value.trim(),
      document.getElementById('veh-model').value.trim(),
      document.getElementById('veh-color').value.trim(),
      document.getElementById('veh-owner').value.trim(),
      document.getElementById('veh-phone').value.trim(),
      document.getElementById('veh-time').value
    ];
    document.querySelector('#table-vehicles tbody').appendChild(createRow(values));
    e.target.reset();
  });

  document.getElementById('form-sessions').addEventListener('submit', (e) => {
    e.preventDefault();
    const values = [
      document.getElementById('ses-id').value.trim(),
      document.getElementById('ses-spot').value.trim(),
      document.getElementById('ses-plate').value.trim(),
      document.getElementById('ses-start').value,
      document.getElementById('ses-end').value,
      document.getElementById('ses-cost').value,
      document.getElementById('ses-status').value
    ];
    document.querySelector('#table-sessions tbody').appendChild(createRow(values));
    e.target.reset();
  });

  // ==========================================
  // 4. ПЕРЕВІРКА ЗВ'ЯЗКІВ ТА ВИДАЛЕННЯ РЯДКА
  // ==========================================
  function handleDelete(row, tableId) {
    // Таблиця "Сесії": колонка 1 — Номер місця, колонка 2 — Держномер авто
    const sessionRows = document.querySelectorAll('#table-sessions tbody tr');

    if (tableId === 'table-spots') {
      const spotNumber = row.cells[0].textContent.trim();
      let isUsed = false;

      sessionRows.forEach(sessionRow => {
        const usedSpot = sessionRow.cells[1]?.textContent.trim();
        if (usedSpot === spotNumber) {
          isUsed = true;
        }
      });

      if (isUsed) {
        alert(`Помилка видалення!\n\nПаркомісце «${spotNumber}» наразі використовується в таблиці «Паркувальні сесії».\nСпочатку видаліть або змініть відповідну сесію.`);
        return;
      }
    }

    if (tableId === 'table-vehicles') {
      const licensePlate = row.cells[0].textContent.trim();
      let isUsed = false;

      sessionRows.forEach(sessionRow => {
        const usedPlate = sessionRow.cells[2]?.textContent.trim();
        if (usedPlate === licensePlate) {
          isUsed = true;
        }
      });

      if (isUsed) {
        alert(`Помилка видалення!\n\nАвтомобіль з держномером «${licensePlate}» зафіксований в таблиці «Паркувальні сесії».\nВидалити цей запис наразі неможливо.`);
        return;
      }
    }

    // Якщо це таблиця сесій або обмежень немає — підтверджуємо видалення
    if (confirm('Ви дійсно бажаєте видалити цей рядок?')) {
      row.remove();
    }
  }

  // ==========================================
  // 5. ІНЛАЙН-РЕДАГУВАННЯ КОМІРОК
  // ==========================================
  function handleInlineEdit(cell) {
    // Якщо в комірці вже відкритий input — нічого не робимо
    if (cell.querySelector('input')) return;

    const originalText = cell.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cell-input';
    input.value = originalText;

    cell.textContent = '';
    cell.appendChild(input);
    input.focus();

    // Функція збереження оновленого значення
    let isSaved = false;
    const saveValue = () => {
      if (isSaved) return;
      isSaved = true;

      const newValue = input.value.trim();
      cell.textContent = newValue !== '' ? newValue : originalText;
    };

    // Збереження по кліку в іншій частині екрана (втрата фокусу)
    input.addEventListener('blur', saveValue);

    // Збереження по натисканню клавіші Enter або скасування по Escape
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
  // 6. ДЕЛЕГУВАННЯ ПОДІЙ ДЛЯ ВСІХ ТАБЛИЦЬ
  // ==========================================
  const tables = document.querySelectorAll('table');

  tables.forEach(table => {
    table.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        const row = deleteBtn.closest('tr');
        handleDelete(row, table.id);
        return;
      }

      const cell = e.target.closest('td');
      if (cell && !cell.classList.contains('action-cell')) {
        handleInlineEdit(cell);
      }
    });
  });
});