function UndoManager() {
    this.previousState = null;
    this.canUndo = false;
    this.lastUndoTime = 0;
    // this.undoCooldown = 1000; 
}

UndoManager.prototype.saveState = function (gameState) {

    this.previousState = JSON.parse(JSON.stringify(gameState));
    this.canUndo = true;
    this.updateUI();
};

UndoManager.prototype.getPreviousState = function () {
    if (!this.canUndo || this.isOnCooldown()) {
        return null;
    }
    
    var state = this.previousState;
    this.previousState = null;
    this.canUndo = false;
    this.lastUndoTime = Date.now();
    this.updateUI();
    
    return state;
};

UndoManager.prototype.clearState = function () {
    this.previousState = null;
    this.canUndo = false;
    this.updateUI();
};

UndoManager.prototype.isOnCooldown = function () {
    return Date.now() - this.lastUndoTime < this.undoCooldown;
};

UndoManager.prototype.updateUI = function () {
    var undoBtn = document.getElementById('undo-btn');
    var undoHint = document.getElementById('undo-hint');
    var undoCount = document.getElementById('undo-count');
    
    if (undoBtn) {
        undoBtn.disabled = !this.canUndo || this.isOnCooldown();
    }
    
    if (undoHint && undoCount) {
        if (this.canUndo && !this.isOnCooldown()) {
        undoHint.style.display = 'block';
        undoCount.textContent = '1';
        undoHint.innerHTML = 'Можно отменить: <span id="undo-count">1</span> ход';
        } else if (this.isOnCooldown()) {
        undoHint.style.display = 'block';
        var secondsLeft = Math.ceil((this.undoCooldown - (Date.now() - this.lastUndoTime)) / 1000);
        undoHint.innerHTML = 'Отмена через: <span id="undo-count">' + secondsLeft + '</span> сек';
        } else {
        undoHint.style.display = 'none';
        }
    }
};


UndoManager.prototype.startUILoop = function () {
    var self = this;
    setInterval(function() {
        self.updateUI();
    }, 1000);
};