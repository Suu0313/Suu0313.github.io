var canvas = document.getElementById('canvas');
var remain = document.getElementById('remain');
var H = 15, W = 15;
var bombsNum = 50;
var delta = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
var firstClick = true;
var gameOvered = false;
function range(s, t) {
    return s < t ? Array.from(Array(t - s), function (val, idx) { return s + idx; }) : [];
}
function rand(n) { return Math.floor(Math.random() * n); }
function id2pos(id) {
    return [Math.floor(id / W), id % W];
}
var State = /** @class */ (function () {
    function State() {
        this.isBomb = false;
        this.isFlag = false;
        this.covered = true;
        this.adjBomb = 0;
    }
    return State;
}());
var field = [];
function adjList(x, y) {
    var adj = [];
    for (var _i = 0, delta_1 = delta; _i < delta_1.length; _i++) {
        var _a = delta_1[_i], dx = _a[0], dy = _a[1];
        var nx = x + dx, ny = y + dy;
        if (nx < 0 || H <= nx || ny < 0 || W <= ny)
            continue;
        adj.push([nx, ny]);
    }
    return adj;
}
function init() {
    field = Array.from(range(0, H), function () { return Array.from(range(0, W), function () { return new State(); }); });
    firstClick = true;
    gameOvered = false;
    document.getElementById("gameOver").textContent = "";
    createCanvas();
    var _loop_1 = function (i) {
        var _loop_2 = function (j) {
            var node = document.getElementById("".concat(i * W + j));
            node.addEventListener('click', function () {
                if (gameOvered)
                    return;
                if (firstClick) {
                    initField(i, j);
                    firstClick = false;
                }
                else {
                    var state = field[i][j];
                    if (state.isFlag)
                        return;
                    if (state.isBomb)
                        gameOver();
                    else
                        recoverDfs(i, j);
                }
                updateCanvas();
            });
            node.addEventListener('contextmenu', function (e) {
                if (gameOvered || firstClick)
                    return;
                e.preventDefault();
                var state = field[i][j];
                if (state.covered) {
                    state.isFlag = !state.isFlag;
                    updateCanvas();
                }
            });
        };
        for (var j = 0; j < W; ++j) {
            _loop_2(j);
        }
    };
    for (var i = 0; i < H; ++i) {
        _loop_1(i);
    }
}
function gameOver() {
    for (var i = 0; i < H; ++i) {
        for (var j = 0; j < W; ++j) {
            var node = document.getElementById("".concat(i * W + j));
            if (field[i][j].isBomb)
                node.classList.add('bomb');
        }
    }
    document.getElementById("gameOver").textContent = "Game Over";
    gameOvered = true;
}
function initField(x, y) {
    field[x][y].covered = false;
    var _loop_3 = function (t) {
        var i = rand(H), j = rand(W);
        while (field[i][j].isBomb || !field[i][j].covered || adjList(x, y).some(function (_a) {
            var ni = _a[0], nj = _a[1];
            return (ni == i && nj == j);
        })) {
            console.log("failed", i, j, field[i][j].isBomb, field[i][j].covered);
            i = rand(H), j = rand(W);
        }
        field[i][j].isBomb = true;
    };
    for (var t = 0; t < bombsNum; ++t) {
        _loop_3(t);
    }
    console.log("set done");
    for (var i = 0; i < H; ++i) {
        for (var j = 0; j < W; ++j) {
            for (var _i = 0, _a = adjList(i, j); _i < _a.length; _i++) {
                var _b = _a[_i], ni = _b[0], nj = _b[1];
                if (field[ni][nj].isBomb)
                    ++field[i][j].adjBomb;
            }
        }
    }
    recoverDfs(x, y);
}
function cntFlag(x, y) {
    var cnt = 0;
    for (var _i = 0, _a = adjList(x, y); _i < _a.length; _i++) {
        var _b = _a[_i], ni = _b[0], nj = _b[1];
        var state = field[ni][nj];
        if (state.covered && state.isFlag)
            ++cnt;
    }
    return cnt;
}
function recoverDfs(x, y) {
    field[x][y].covered = false;
    var stack = [[x, y]];
    while (stack.length) {
        var _a = stack.pop(), i = _a[0], j = _a[1];
        if (cntFlag(i, j) !== field[i][j].adjBomb)
            continue;
        for (var _i = 0, _b = adjList(i, j); _i < _b.length; _i++) {
            var _c = _b[_i], ni = _c[0], nj = _c[1];
            var state = field[ni][nj];
            if (!state.covered)
                continue;
            if (state.isFlag)
                continue;
            if (state.isBomb) {
                gameOver();
                return;
            }
            state.covered = false;
            if (state.adjBomb == 0)
                stack.push([ni, nj]);
        }
    }
}
function createCanvas() {
    var text = "<table>";
    for (var i = 0; i < H; ++i) {
        text += "<tr>";
        for (var j = 0; j < W; ++j) {
            var state = field[i][j];
            text += "<td id=".concat(i * W + j, ">");
            text += "</td>";
        }
        text += "</tr>";
    }
    text += "</table>";
    canvas.innerHTML = text;
    remain.textContent = bombsNum.toString();
}
function updateCanvas() {
    var flagCnt = 0, noneCnt = 0;
    for (var i = 0; i < H; ++i) {
        for (var j = 0; j < W; ++j) {
            var node = document.getElementById("".concat(i * W + j));
            var state = field[i][j];
            if (state.covered) {
                if (state.isFlag)
                    node.textContent = "F", ++flagCnt;
                else
                    node.textContent = "", ++noneCnt;
            }
            if (!state.covered) {
                node.textContent = state.adjBomb.toString();
                node.classList.add("uncover");
            }
        }
    }
    remain.textContent = (bombsNum - flagCnt).toString();
    if (flagCnt + noneCnt == bombsNum) {
        document.getElementById("gameOver").textContent = "Clear!";
        gameOvered = true;
    }
}
init();
document.getElementById("reset").addEventListener("click", function () { init(); });
