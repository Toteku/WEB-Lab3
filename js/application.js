// Главный файл приложения
window.addEventListener('DOMContentLoaded', function () {
    // Ждем полной загрузки шрифтов для корректного расчета размеров
    setTimeout(function() {
        // Проверяем, есть ли сохраненная игра
        var storage = new StorageManager();
        var savedState = storage.getGameState();
        
        // Если есть сохраненная игра, показываем затемнение
        if (savedState && !savedState.over) {
            showContinueModal(savedState.score);
        } else {
            // Нет сохраненной игры - сразу начинаем новую
            new GameManager(4, InputManager, Actuator, StorageManager, UndoManager, Leaderboard);
        }
    }, 100);
});

// Функция показа модального окна продолжения
function showContinueModal(savedScore) {
    var overlay = document.getElementById('overlay');
    overlay.classList.add('active');
    
    // Создаем модальное окно
    var continueModal = document.createElement('div');
    continueModal.className = 'continue-modal';
    
    // Создаем содержимое модального окна
    var modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Заголовок
    var title = document.createElement('h2');
    var icon = document.createElement('i');
    icon.className = 'fas fa-gamepad';
    title.appendChild(icon);
    title.appendChild(document.createTextNode(' Продолжить игру?'));
    
    // Текст 1
    var text1 = document.createElement('p');
    text1.appendChild(document.createTextNode('Обнаружена сохраненная игра со счетом '));
    
    var strong = document.createElement('strong');
    strong.textContent = savedScore;
    text1.appendChild(strong);
    text1.appendChild(document.createTextNode('.'));
    
    // Текст 2
    var text2 = document.createElement('p');
    text2.textContent = 'Хотите продолжить или начать новую игру?';
    
    // Кнопки
    var buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'modal-buttons';
    
    // Кнопка "Продолжить"
    var continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-continue';
    continueBtn.id = 'load-game';
    
    var continueIcon = document.createElement('i');
    continueIcon.className = 'fas fa-play-circle';
    continueBtn.appendChild(continueIcon);
    continueBtn.appendChild(document.createTextNode(' Продолжить'));
    
    // Кнопка "Новая игра"
    var newBtn = document.createElement('button');
    newBtn.className = 'btn btn-new';
    newBtn.id = 'start-new';
    
    var newIcon = document.createElement('i');
    newIcon.className = 'fas fa-plus-circle';
    newBtn.appendChild(newIcon);
    newBtn.appendChild(document.createTextNode(' Новая игра'));
    
    // Собираем структуру
    buttonsContainer.appendChild(continueBtn);
    buttonsContainer.appendChild(newBtn);
    
    modalContent.appendChild(title);
    modalContent.appendChild(text1);
    modalContent.appendChild(text2);
    modalContent.appendChild(buttonsContainer);
    
    continueModal.appendChild(modalContent);
    document.body.appendChild(continueModal);
    
    // Показываем модальное окно
    setTimeout(function() {
        continueModal.classList.add('active');
    }, 100);
    
    // Обработчики кнопок
    continueBtn.addEventListener('click', function() {
        // Загружаем сохраненную игру
        continueModal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(function() {
            continueModal.remove();
            // Создаем игру с сохраненным состоянием
            new GameManager(4, InputManager, Actuator, StorageManager, UndoManager, Leaderboard);
        }, 300);
    });
    
    newBtn.addEventListener('click', function() {
        // Очищаем сохранение и начинаем новую игру
        storage.clearGameState();
        continueModal.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(function() {
            continueModal.remove();
            // Создаем новую игру
            new GameManager(4, InputManager, Actuator, StorageManager, UndoManager, Leaderboard);
        }, 300);
    });
}