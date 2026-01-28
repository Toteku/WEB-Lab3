function GameManager(size, InputManager, Actuator, StorageManager, UndoManager, Leaderboard) {
    this.size = size;
    this.inputManager = new InputManager();
    this.storageManager = new StorageManager();
    this.undoManager = new UndoManager();
    this.leaderboard = new Leaderboard();
    this.actuator = new Actuator();
    
    this.startTiles = 2;
    this.moves = 0;
    this.gameEnded = false;
    
    
    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
    this.inputManager.on("undo", this.undo.bind(this));
    this.inputManager.on("showLeaderboard", this.showLeaderboard.bind(this));
    this.inputManager.on("hideLeaderboard", this.hideLeaderboard.bind(this));
    this.inputManager.on("clearLeaderboard", this.clearLeaderboard.bind(this));
    
    this.undoManager.startUILoop();
    this.setup();
}


GameManager.prototype.restart = function () {
    this.storageManager.clearGameState();
    this.undoManager.clearState();
    this.actuator.continueGame();
    this.setup();
    this.gameEnded = false;
};


GameManager.prototype.keepPlaying = function () {
    this.keepPlayingFlag = true;
    this.actuator.continueGame();
};


GameManager.prototype.undo = function () {
    var previousState = this.undoManager.getPreviousState();
    
    if (previousState) {
        this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
        this.score = previousState.score;
        this.moves = previousState.moves;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlayingFlag = previousState.keepPlaying;
        
        this.actuate();
    }
};


GameManager.prototype.showLeaderboard = function () {
    this.leaderboard.showModal();
};


GameManager.prototype.hideLeaderboard = function () {
    this.leaderboard.hideModal();
};


GameManager.prototype.clearLeaderboard = function () {
    if (confirm("Вы уверены, что хотите очистить таблицу лидеров?")) {
        this.leaderboard.clear();
    }
};


GameManager.prototype.isGameTerminated = function () {
    return this.over || (this.won && !this.keepPlayingFlag);
};


GameManager.prototype.setup = function () {
    var previousState = this.storageManager.getGameState();
    
    
    if (previousState) {
        this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
        this.score = previousState.score;
        this.moves = previousState.moves || 0;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlayingFlag = previousState.keepPlaying;
    } else {
        this.grid = new Grid(this.size);
        this.score = 0;
        this.moves = 0;
        this.over = false;
        this.won = false;
        this.keepPlayingFlag = false;
        
        
        this.addStartTiles();
    }
    
    
    this.actuate();
};


GameManager.prototype.addStartTiles = function () {
    for (var i = 0; i < this.startTiles; i++) {
        this.addRandomTile();
    }
};


GameManager.prototype.addRandomTile = function () {
    if (this.grid.cellsAvailable()) {
        var value = Math.random() < 0.9 ? 2 : 4;
        var tile = new Tile(this.grid.randomAvailableCell(), value);
        this.grid.insertTile(tile);
    }
};


GameManager.prototype.handleGameEnd = function () {
    var self = this;
    
    if (this.gameEnded) return;
    this.gameEnded = true;
    

    if (this.leaderboard.isHighScore(this.score)) {

        setTimeout(function() {
            self.leaderboard.showNameInput(self.score)
                .then(function(name) {
                    if (name !== null) {
                        var position = self.leaderboard.addEntry(name, self.score);
                        alert("Поздравляем! Вы заняли " + position + " место в таблице лидеров!");
                    }
                    self.gameEnded = false;
                });
        }, 1000);
    } else {
        this.gameEnded = false;
    }
};


GameManager.prototype.actuate = function () {
    if (this.storageManager.getBestScore() < this.score) {
        this.storageManager.setBestScore(this.score);
    }
    
    
    if (this.over) {
        this.storageManager.clearGameState();
        this.undoManager.clearState();
        this.handleGameEnd();
    } else {
        this.storageManager.setGameState(this.serialize());
    }
    
    this.actuator.actuate(this.grid, {
        score: this.score,
        over: this.over,
        won: this.won,
        bestScore: this.storageManager.getBestScore(),
        moves: this.moves,
        terminated: this.isGameTerminated()
    });
};


GameManager.prototype.serialize = function () {
    return {
        grid: this.grid.serialize(),
        score: this.score,
        moves: this.moves,
        over: this.over,
        won: this.won,
        keepPlaying: this.keepPlayingFlag
    };
};


GameManager.prototype.prepareTiles = function () {
    this.grid.eachCell(function (x, y, tile) {
        if (tile) {
            tile.mergedFrom = null;
            tile.savePosition();
        }
    });
};


GameManager.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};


GameManager.prototype.move = function (direction) {
    
    var self = this;
    
    if (this.isGameTerminated()) return;
    
    var cell, tile;
    
    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;
    
    
    this.prepareTiles();
    
    
    var previousState = this.serialize();
    this.undoManager.saveState(previousState);
    
    
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = { x: x, y: y };
            tile = self.grid.cellContent(cell);
            
            if (tile) {
                var positions = self.findFarthestPosition(cell, vector);
                var next = self.grid.cellContent(positions.next);
                
                
                if (next && next.value === tile.value && !next.mergedFrom) {
                    var merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];
                    
                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);
                    
                    
                    tile.updatePosition(positions.next);
                    
                    
                    self.score += merged.value;
                    
                    if (merged.value === 2048) self.won = true;
                } else {
                    self.moveTile(tile, positions.farthest);
                }
                
                if (!self.positionsEqual(cell, tile)) {
                    moved = true;
                }
            }
        });
    });
    
    if (moved) {
        this.moves++;
        this.addRandomTile();
        
        if (!this.movesAvailable()) {
            this.over = true;
        }
        
        this.actuate();
    } else {
        
        this.undoManager.clearState();
    }
};


GameManager.prototype.getVector = function (direction) {
    
    var map = {
        0: { x: 0, y: -1 }, 
        1: { x: 1, y: 0 },  
        2: { x: 0, y: 1 },  
        3: { x: -1, y: 0 }   
    };
    
    return map[direction];
};


GameManager.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };
    
    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }
    
    
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    
    return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
    var previous;
    
    
    do {
        previous = cell;
        cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
            this.grid.cellAvailable(cell));
    
    return {
        farthest: previous,
        next: cell 
    };
};

GameManager.prototype.movesAvailable = function () {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};


GameManager.prototype.tileMatchesAvailable = function () {
    var self = this;
    
    var tile;
    
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            tile = this.grid.cellContent({ x: x, y: y });
            
            if (tile) {
                for (var direction = 0; direction < 4; direction++) {
                    var vector = self.getVector(direction);
                    var cell = { x: x + vector.x, y: y + vector.y };
                    
                    var other = self.grid.cellContent(cell);
                    
                    if (other && other.value === tile.value) {
                        return true; 
                    }
                }
            }
        }
    }
    
    return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};