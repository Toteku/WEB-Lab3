function Actuator() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector("#score");
    this.bestContainer = document.querySelector("#best");
    this.movesContainer = document.querySelector("#moves");
    this.messageContainer = document.querySelector("#game-message");
    this.messageText = document.querySelector("#message-text");
    
    this.score = 0;
    this.moves = 0;
}

Actuator.prototype.actuate = function (grid, metadata) {
    var self = this;
    
    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);
        
        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) {
                    self.addTile(cell);
                }
            });
        });
        
        self.updateScore(metadata.score);
        self.updateBestScore(metadata.bestScore);
        self.updateMoves(metadata.moves);
        
        if (metadata.terminated) {
            if (metadata.over) {
                self.message(false); // You lose
            } else if (metadata.won) {
                self.message(true); // You win!
            }
        }
    });
};

// Continues the game (both restart and keep playing)
Actuator.prototype.continueGame = function () {
    this.clearMessage();
};

Actuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

Actuator.prototype.addTile = function (tile) {
    var self = this;
    
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    var position = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);
    
    // Собираем классы
    var classes = ["tile", "tile-" + tile.value, positionClass];
    
    if (tile.value > 2048) classes.push("tile-super");
    
    // Устанавливаем классы
    wrapper.className = classes.join(" ");
    
    inner.className = "tile-inner";
    inner.textContent = tile.value;
    
    if (tile.previousPosition) {
        window.requestAnimationFrame(function () {
            classes[2] = self.positionClass({ x: tile.x, y: tile.y });
            wrapper.className = classes.join(" ");
        });
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        wrapper.className = classes.join(" ");
        
        tile.mergedFrom.forEach(function (merged) {
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        wrapper.className = classes.join(" ");
    }
    
    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
};

Actuator.prototype.positionClass = function (position) {
    return "tile-position-" + (position.x + 1) + "-" + (position.y + 1);
};

Actuator.prototype.updateScore = function (score) {
    var difference = score - this.score;
    this.score = score;
    
    this.scoreContainer.textContent = this.score;
    
    if (difference > 0) {
        var addition = document.createElement("div");
        addition.className = "score-addition";
        addition.textContent = "+" + difference;
        addition.style.position = "absolute";
        addition.style.right = "10px";
        addition.style.color = "#2ecc71";
        addition.style.fontWeight = "bold";
        addition.style.animation = "move-up 600ms ease-in both";
        
        this.scoreContainer.parentNode.style.position = "relative";
        this.scoreContainer.parentNode.appendChild(addition);
        
        setTimeout(function() {
            if (addition.parentNode) {
                addition.parentNode.removeChild(addition);
            }
        }, 600);
    }
};

Actuator.prototype.updateBestScore = function (bestScore) {
    this.bestContainer.textContent = bestScore;
};

Actuator.prototype.updateMoves = function (moves) {
    this.moves = moves;
    this.movesContainer.textContent = moves;
};

Actuator.prototype.message = function (won) {
    var type = won ? "game-won" : "game-over";
    var message = won ? "Вы выиграли! 🎉" : "Игра окончена! 😔";
    
    this.messageContainer.className = "game-message " + type;
    this.messageText.textContent = message;
    this.messageContainer.style.display = "flex";
};

Actuator.prototype.clearMessage = function () {
    this.messageContainer.className = "game-message";
    this.messageContainer.style.display = "none";
};