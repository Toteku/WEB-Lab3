// Таблица лидеров
function Leaderboard() {
    this.key = "2048_leaderboard";
    this.maxEntries = 10;
    this.entries = this.load();
}

// Загрузка из localStorage
Leaderboard.prototype.load = function () {
    var data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
};

// Сохранение в localStorage
Leaderboard.prototype.save = function () {
    localStorage.setItem(this.key, JSON.stringify(this.entries));
};

// Добавление новой записи
Leaderboard.prototype.addEntry = function (name, score) {
    var entry = {
        name: name || "Аноним",
        score: score,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    this.entries.push(entry);
    

    this.entries.sort(function(a, b) {
        return b.score - a.score;
    });
    

    if (this.entries.length > this.maxEntries) {
        this.entries = this.entries.slice(0, this.maxEntries);
    }
    
    this.save();
    this.updateUI();
    
    return this.entries.indexOf(entry) + 1; // Возвращаем позицию
};

Leaderboard.prototype.isHighScore = function (score) {
    if (this.entries.length < this.maxEntries) {
        return true;
    }
    
    var lowestScore = this.entries[this.entries.length - 1].score;
    return score > lowestScore;
};

// Очистка таблицы
Leaderboard.prototype.clear = function () {
    this.entries = [];
    this.save();
    this.updateUI();
};

// Получение статистики
Leaderboard.prototype.getStats = function () {
    if (this.entries.length === 0) {
        return {
            totalGames: 0,
            averageScore: 0,
            bestScore: 0
        };
    }
    
    var totalScore = this.entries.reduce(function(sum, entry) {
        return sum + entry.score;
    }, 0);
    
    return {
        totalGames: this.entries.length,
        averageScore: Math.round(totalScore / this.entries.length),
        bestScore: this.entries[0] ? this.entries[0].score : 0
    };
};

// Форматирование даты
Leaderboard.prototype.formatDate = function (dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diff = now - date;
    

    if (diff < 24 * 60 * 60 * 1000) {
        return 'Сегодня';
    }
    

    if (diff < 2 * 24 * 60 * 60 * 1000) {
        return 'Вчера';
    }
    

    if (diff < 7 * 24 * 60 * 60 * 1000) {
        var days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        return days[date.getDay()];
    }
    
    // Форматирование даты
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

Leaderboard.prototype.updateUI = function () {
    var list = document.getElementById('leaderboard-list');
    var empty = document.getElementById('leaderboard-empty');
    var stats = this.getStats();
    

    document.getElementById('total-games').textContent = stats.totalGames;
    document.getElementById('average-score').textContent = stats.averageScore;
    document.getElementById('modal-best-score').textContent = stats.bestScore;
    

    while (list.firstChild && list.firstChild !== empty) {
        list.removeChild(list.firstChild);
    }
    

    if (this.entries.length === 0) {
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    // Добавление записей
    this.entries.forEach(function(entry, index) {
        var entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        
        // Проверка, является ли это текущим игроком (последняя добавленная запись)
        if (index === 0 && entry.timestamp > Date.now() - 5000) {
            entryElement.classList.add('current-player');
        }
        

        var rankCell = document.createElement('div');
        rankCell.className = 'rank';
        rankCell.textContent = (index + 1).toString();
        
        var nameCell = document.createElement('div');
        nameCell.className = 'name';
        nameCell.textContent = entry.name;
        
        var scoreCell = document.createElement('div');
        scoreCell.className = 'score';
        scoreCell.textContent = entry.score.toLocaleString();
        
        var dateCell = document.createElement('div');
        dateCell.className = 'date';
        dateCell.textContent = this.formatDate(entry.date);
        
        entryElement.appendChild(rankCell);
        entryElement.appendChild(nameCell);
        entryElement.appendChild(scoreCell);
        entryElement.appendChild(dateCell);
        
        list.insertBefore(entryElement, empty);
    }.bind(this));
};

Leaderboard.prototype.showModal = function () {
    this.updateUI();
    var modal = document.getElementById('leaderboard-modal');
    var overlay = document.getElementById('overlay');
    
    overlay.classList.add('active');
    modal.showModal();
    
    overlay.addEventListener('click', function() {
        modal.close();
        overlay.classList.remove('active');
    });
    
    modal.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            modal.close();
            overlay.classList.remove('active');
        }
    });
};

// Закрытие модального окна
Leaderboard.prototype.hideModal = function () {
    var modal = document.getElementById('leaderboard-modal');
    var overlay = document.getElementById('overlay');
    
    modal.close();
    overlay.classList.remove('active');
};


Leaderboard.prototype.showNameInput = function (score) {
    var modal = document.getElementById('name-input-modal');
    var overlay = document.getElementById('overlay');
    var finalScoreElement = document.getElementById('final-score');
    
    // Обновляем счет
    while (finalScoreElement.firstChild) {
        finalScoreElement.removeChild(finalScoreElement.firstChild);
    }
    finalScoreElement.appendChild(document.createTextNode(score.toLocaleString()));
    
    overlay.classList.add('active');
    modal.showModal();
    
    
    setTimeout(function() {
        document.getElementById('player-name').focus();
    }, 100);
    
    return new Promise(function(resolve) {
        var form = document.getElementById('name-form');
        var cancelBtn = document.getElementById('cancel-name');
        
        var cleanup = function() {
            form.removeEventListener('submit', onSubmit);
            cancelBtn.removeEventListener('click', onCancel);
            modal.close();
            overlay.classList.remove('active');
        };
        
        var onSubmit = function(event) {
            event.preventDefault();
            var nameInput = document.getElementById('player-name');
            var name = nameInput.value.trim();
            cleanup();
            resolve(name || null);
        };
        
        var onCancel = function() {
            cleanup();
            resolve(null);
        };
        
        form.addEventListener('submit', onSubmit);
        cancelBtn.addEventListener('click', onCancel);
        

        modal.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                onCancel();
            }
        });
    });
};