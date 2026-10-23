document.addEventListener('DOMContentLoaded', () => {
  // 1. Логіка перемикання табів
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));

      button.classList.add('active');
      const targetId = button.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Універсальна допоміжна функція для додавання рядка до tbody
  function addRowToTable(tableId, valuesArray) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    const row = document.createElement('tr');

    valuesArray.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  }

  // 2. Додавання даних: Паркомісця
  const formSpots = document.getElementById('form-spots');
  formSpots.addEventListener('submit', (e) => {
    e.preventDefault(); // Запобігаємо перезавантаженню сторінки

    const values = [
      document.getElementById('spot-number').value,
      document.getElementById('spot-floor').value,
      document.getElementById('spot-type').value,
      document.getElementById('spot-status').value,
      document.getElementById('spot-rate').value,
      document.getElementById('spot-charger').value,
      document.getElementById('spot-sector').value
    ];

    addRowToTable('table-spots', values);
    formSpots.reset(); // Очищаємо поля після успішного додавання
  });

  // 3. Додавання даних: Транспортні засоби
  const formVehicles = document.getElementById('form-vehicles');
  formVehicles.addEventListener('submit', (e) => {
    e.preventDefault();

    const values = [
      document.getElementById('veh-plate').value,
      document.getElementById('veh-brand').value,
      document.getElementById('veh-model').value,
      document.getElementById('veh-color').value,
      document.getElementById('veh-owner').value,
      document.getElementById('veh-phone').value,
      document.getElementById('veh-time').value
    ];

    addRowToTable('table-vehicles', values);
    formVehicles.reset();
  });

  // 4. Додавання даних: Паркувальні сесії
  const formSessions = document.getElementById('form-sessions');
  formSessions.addEventListener('submit', (e) => {
    e.preventDefault();

    const values = [
      document.getElementById('ses-id').value,
      document.getElementById('ses-spot').value,
      document.getElementById('ses-plate').value,
      document.getElementById('ses-start').value,
      document.getElementById('ses-end').value,
      document.getElementById('ses-cost').value,
      document.getElementById('ses-status').value
    ];

    addRowToTable('table-sessions', values);
    formSessions.reset();
  });
});