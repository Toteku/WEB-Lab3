function StorageManager() {
    this.bestScoreKey = "bestScore2048";
    this.gameStateKey = "gameState2048";
    this.storage = window.localStorage;
}

StorageManager.prototype.getBestScore = function () {
    return parseInt(this.storage.getItem(this.bestScoreKey)) || 0;
};

StorageManager.prototype.setBestScore = function (score) {
    this.storage.setItem(this.bestScoreKey, score);
};

StorageManager.prototype.getGameState = function () {
    var stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
};

StorageManager.prototype.setGameState = function (gameState) {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

StorageManager.prototype.clearGameState = function () {
    this.storage.removeItem(this.gameStateKey);
};