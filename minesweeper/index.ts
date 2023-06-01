const canvas: HTMLElement = document.getElementById('canvas')!;
const remain: HTMLElement = document.getElementById('remain')!;
const H = 15, W = 15;
const bombsNum = 50;
const delta: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];

let firstClick = true;
let gameOvered = false;

function range(s: number, t: number): number[] {
  return s < t ? Array.from(Array(t - s), (val, idx) => s + idx) : [];
}

function rand(n:number): number { return Math.floor(Math.random() * n); }

function id2pos(id: number): [number, number] {
  return [Math.floor(id / W), id % W]; 
}

class State {
  isBomb: boolean = false;
  isFlag: boolean = false;
  covered: boolean = true;
  adjBomb: number = 0;
  constructor() {}
}

let field: State[][] = [];

function adjList(x:number, y:number): [number, number][] {
  const adj: [number, number][] = [];
  for(const [dx, dy] of delta) {
    const nx = x + dx, ny = y + dy;
    if(nx < 0 || H <= nx || ny < 0 || W <= ny) continue;
    adj.push([nx, ny]);
  }
  return adj;
}


function init(): void {

  field = Array.from(range(0, H), () => Array.from(range(0, W), () => new State()));
  firstClick = true;
  gameOvered = false;
  document.getElementById("gameOver")!.textContent = "";
  createCanvas();
  
  for(let i = 0; i < H; ++i){
    for(let j = 0; j < W; ++j){
      const node: HTMLElement = document.getElementById(`${i * W + j}`)!;
      node.addEventListener('click', () => {
        if(gameOvered) return;
        
        if(firstClick){
          initField(i, j);
          firstClick = false;
        }else{
          const state = field[i][j];
          if(state.isFlag) return;
          if(state.isBomb) gameOver();
          else recoverDfs(i, j);
        }
        updateCanvas();
      });

      node.addEventListener('contextmenu', e => {
        if(gameOvered || firstClick) return;
        e.preventDefault();
        const state = field[i][j];
        if(state.covered){
          state.isFlag = !state.isFlag;
          updateCanvas();
        }
      });
    }
  }

}

function gameOver(): void {
  for(let i = 0; i < H; ++i){
    for(let j = 0; j < W; ++j){
      const node: HTMLElement = document.getElementById(`${i * W + j}`)!;
      if(field[i][j].isBomb) node.classList.add('bomb');
    }
  }
  document.getElementById("gameOver")!.textContent = "Game Over";
  gameOvered = true;
}

function initField(x:number, y:number): void {
  field[x][y].covered = false;

  for(let t = 0; t < bombsNum; ++t){
    let i = rand(H), j = rand(W);
    while(field[i][j].isBomb || !field[i][j].covered || adjList(x, y).some(([ni, nj]) => (ni==i && nj==j))) {
      console.log("failed", i, j, field[i][j].isBomb, field[i][j].covered);
      
      i = rand(H), j = rand(W);
      
    }
    field[i][j].isBomb = true;
  }

  console.log("set done");
  

  for(let i = 0; i < H; ++i){
    for(let j = 0; j < W; ++j){
      for(const [ni, nj] of adjList(i, j)){
        if(field[ni][nj].isBomb) ++field[i][j].adjBomb;
      }
      
    }
  }

  recoverDfs(x, y);
}

function cntFlag(x:number, y:number): number {
  let cnt = 0;
  for(const [ni, nj] of adjList(x, y)){
    const state = field[ni][nj];
    if(state.covered && state.isFlag) ++cnt;
  }
  return cnt;
}

function recoverDfs(x:number, y:number): void {
  field[x][y].covered = false;
  const stack: [number, number][] = [[x, y]];
  
  while(stack.length){
    const [i, j] = stack.pop()!;
    if(cntFlag(i, j) !== field[i][j].adjBomb) continue;
    for(const [ni, nj] of adjList(i, j)){
      const state = field[ni][nj];
      if(!state.covered) continue;
      if(state.isFlag) continue;
      if(state.isBomb){
        gameOver();
        return;
      }
      state.covered = false;
      if(state.adjBomb == 0) stack.push([ni, nj]);
    }
  }
}

function createCanvas(): void {
  let text = "<table>"
  for(let i = 0; i < H; ++i){
    text += "<tr>"
    for(let j = 0; j < W; ++j){
      const state = field[i][j];
      text += `<td id=${i * W + j}>`;
      text += "</td>";
    }
    text += "</tr>"
  }
  text += "</table>";
  canvas.innerHTML = text;
  remain.textContent = bombsNum.toString();
}

function updateCanvas(): void {
  let flagCnt = 0, noneCnt = 0;
  for(let i = 0; i < H; ++i){
    for(let j = 0; j < W; ++j){
      const node: HTMLElement = document.getElementById(`${i * W + j}`)!;
      const state = field[i][j];
      if(state.covered){
        if(state.isFlag) node.textContent = "F", ++flagCnt;
        else node.textContent = "", ++noneCnt;
      }
      if(!state.covered){
        node.textContent! = state.adjBomb.toString();
        node.classList.add("uncover");
      }
    }
  }
  remain.textContent = (bombsNum - flagCnt).toString();

  if(flagCnt + noneCnt == bombsNum){
    document.getElementById("gameOver")!.textContent = "Clear!";
    gameOvered = true;
  }
}

init();

document.getElementById("reset")!.addEventListener("click", () => { init(); });