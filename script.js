document.addEventListener('DOMContentLoaded', () => {
  // 1. Знаходимо всі кнопки вкладок та всі блоки таблиць
  const buttons = document.querySelectorAll('.tab-button');
  const tabs = document.querySelectorAll('.tab-content');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      // 2. Отримуємо ідентифікатор цільової вкладки з data-атрибута кнопки
      const targetId = button.getAttribute('data-tab');

      // 3. Знімаємо підсвічування активності з усіх кнопок
      buttons.forEach((btn) => btn.classList.remove('active'));

      // 4. Приховуємо всі таблиці
      tabs.forEach((tab) => tab.classList.remove('active'));

      // 5. Робимо активною натиснуту кнопку
      button.classList.add('active');

      // 6. Показуємо потрібну секцію за її id
      const activeTab = document.getElementById(targetId);
      if (activeTab) {
        activeTab.classList.add('active');
      }
    });
  });
});
