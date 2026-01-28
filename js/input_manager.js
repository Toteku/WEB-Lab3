function InputManager() {
    this.events = {};
    
    this.listen();
}

InputManager.prototype.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
};

InputManager.prototype.emit = function (event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback(data);
        });
    }
};

InputManager.prototype.listen = function () {
    var self = this;
    
    var map = {
        38: 0, // Вверх
        39: 1, // Направо
        40: 2, // Вниз
        37: 3, // Влево
        87: 0, // W
        68: 1, // D
        83: 2, // S
        65: 3  // A
    };
    
    // Клавиатура
    document.addEventListener("keydown", function (event) {
        var modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
        var mapped = map[event.which];
        
        if (!modifiers) {
            if (mapped !== undefined) {
                event.preventDefault();
                self.emit("move", mapped);
            }
            
            // R - новая игра
            if (event.which === 82) {
                event.preventDefault();
                self.emit("restart");
            }
        }
        
        // Ctrl+Z
        if ((event.ctrlKey || event.metaKey) && event.which === 90) {
            event.preventDefault();
            self.emit("undo");
        }
    });
    
    // Кнопки управления
    this.bindButton("#new-game", this.restart.bind(this));
    this.bindButton("#try-again-btn", this.restart.bind(this));
    this.bindButton("#continue-btn", this.keepPlaying.bind(this));
    this.bindButton("#undo-btn", this.undo.bind(this));
    this.bindButton("#leaderboard-btn", this.showLeaderboard.bind(this));
    this.bindButton("#close-leaderboard", this.hideLeaderboard.bind(this));
    this.bindButton("#clear-leaderboard", this.clearLeaderboard.bind(this));
    
    // Мобильные кнопки управления
    this.bindButton("#up-btn", function() { self.emit("move", 0); });
    this.bindButton("#right-btn", function() { self.emit("move", 1); });
    this.bindButton("#down-btn", function() { self.emit("move", 2); });
    this.bindButton("#left-btn", function() { self.emit("move", 3); });
    
    this.setupTouchControls();
};

InputManager.prototype.setupTouchControls = function () {
    var self = this;
    var gameContainer = document.querySelector(".game-container");
    var touchStartX, touchStartY;
    
    gameContainer.addEventListener("touchstart", function (event) {
        if (event.touches.length > 1) return;
        
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        event.preventDefault();
    }, { passive: false });
    
    gameContainer.addEventListener("touchend", function (event) {
        if (event.touches.length > 0) return;
        
        var touchEndX = event.changedTouches[0].clientX;
        var touchEndY = event.changedTouches[0].clientY;
        
        var dx = touchEndX - touchStartX;
        var dy = touchEndY - touchStartY;
        var absDx = Math.abs(dx);
        var absDy = Math.abs(dy);
        
        if (Math.max(absDx, absDy) > 10) {
            self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
        }
    });
};

InputManager.prototype.bindButton = function (selector, fn) {
    var button = document.querySelector(selector);
    if (button) {
        button.addEventListener("click", fn);
        button.addEventListener("touchend", function(event) {
            event.preventDefault();
            fn(event);
        });
    }
};


InputManager.prototype.restart = function (event) {
    event.preventDefault();
    this.emit("restart");
};

InputManager.prototype.keepPlaying = function (event) {
    event.preventDefault();
    this.emit("keepPlaying");
};

InputManager.prototype.undo = function (event) {
    event.preventDefault();
    this.emit("undo");
};

InputManager.prototype.showLeaderboard = function (event) {
    event.preventDefault();
    this.emit("showLeaderboard");
};

InputManager.prototype.hideLeaderboard = function (event) {
    event.preventDefault();
    this.emit("hideLeaderboard");
};

InputManager.prototype.clearLeaderboard = function (event) {
    event.preventDefault();
    this.emit("clearLeaderboard");
};