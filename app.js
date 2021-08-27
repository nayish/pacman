const debug = isDebug();

const NUMBER_OF_COLUMNS = 15;
const NUMBER_OF_ROWS = 10;

const CELL_SIZE = 60;
const ELEMENT_HEIGHT = 60;
const STEP_TIME = 200;
let CONTROL_HEIGHT = 300;
const DIRECTIONS = ['left', 'right', 'up', 'down'];

let control;
let score = 0;
let board;
let scoreElement;

let types = {
    pacman: {name: 'pacman'},
    cherry: {name: 'cherry', animationSteps: 1, points: 100},
    apple: {name: 'apple', points: 200},
    banana: {name: 'banana', points: 400},
    ghost: {name: 'ghost'},
}

const nextMovePoints = [];

let intervalId;
let mouseDown;

class Element {
    constructor(name, type, position) {
        this.name = name;
        this.type = type;
        this.position = position;
        this.currentDirection = 'left';
        this.element = undefined;
    }
}

let elements = {
    player1: new Element('player1', types.pacman, [2,2]),
    player2: new Element('player2', types.ghost, [3,4]),
    cherry: new Element('cherry', types.cherry, [1,2]),
    apple: new Element('cherry', types.apple, [1,1]),
    banana: new Element('cherry', types.banana, [0,2]),
}

const temp = console.log;
console.log = (function () {
    if (!debug) {
        return temp
    }

    const console = document.createElement("div");
    console.className = 'console';
    document.addEventListener('DOMContentLoaded', async () => {
        document.body.appendChild(console);
    });

    return (...args) => {
        console.innerText = `${args.join(' ')}`;
        temp(...args);
    }
}());

document.addEventListener('DOMContentLoaded', async () => {
    scoreElement = document.createElement("div");
    scoreElement.className = 'score';
    scoreElement.style = `width: ${CELL_SIZE * NUMBER_OF_COLUMNS}px`;
    document.body.appendChild(scoreElement);

    printScore();

    board = document.createElement("div");
    board.className = 'board';
    board.style = `width: ${CELL_SIZE * NUMBER_OF_COLUMNS}px`;
    document.body.appendChild(board);

    for (let i=0; i < NUMBER_OF_COLUMNS; i++) {
        for (let j=0; j < NUMBER_OF_ROWS; j++) {
            const cell = document.createElement("span");
            cell.className = 'cell';
            board.appendChild(cell);
        }
    }

    Object.values(elements).forEach(el => {
        const element = document.createElement("div");
        element.className = `${el.type.name} element`;

        board.appendChild(element);

        el.element = element;
    });

    positionElements();

    control = document.createElement("div");
    control.className = 'control';

    control.addEventListener('mousedown', handleMouseDown, false);
    window.addEventListener('mousemove', handleMouseMove, false);
    window.addEventListener('mouseup', handleTouchEnd, false);
    control.addEventListener('touchstart', handleTouchStart, false);
    control.addEventListener('touchmove', handleTouchStart, false);
    control.addEventListener('touchend', handleTouchEnd, false);

    document.body.appendChild(control);
    setTimeout(() => {
        CONTROL_HEIGHT = control.offsetHeight;
        console.log(CONTROL_HEIGHT)
    })
});

function positionElements() {
    Object.values(elements).forEach(({element, position, currentDirection}) => {
        if (element) {
            element.style = `left: ${position[0] * CELL_SIZE + (CELL_SIZE-ELEMENT_HEIGHT)/2}; top: ${position[1] * CELL_SIZE  + (CELL_SIZE-ELEMENT_HEIGHT)/2};`;
        }
    });
}

function isDebug() {
    const res = window.location.href.split('?')[1]?.split('&').map(a => a.split('=')).filter(a => a[0] === 'debug');
    return res?.length > 0 && res[0][1] !== 'false';
}

function toggleClass(el, cls) {
    const clss = el.className.split(' ');
    const index = clss.indexOf(cls);
    if (index !== -1) {
        el.className = [...clss.filter(c => c !== cls)].join(' ');
    } else {
        el.className = [...clss, cls].join(' ')
    }
}

function removeClasses(el, clss) {
    const currentClss = el.className.split(' ');
    el.className = currentClss.filter(a => clss.indexOf(a) === -1).join(' ');
}

function addClass(el, cls) {
    const clss = new Set([...el.className.split(' '), cls]);
    el.className = [...clss].join(' ');
}

const debounce = (callback, wait) => {
    let ignore = false;
    return (...args) => {
        if (ignore) {return;}
        callback.apply(null, args);
        ignore = true;
        window.setTimeout(() => {
            ignore = false;
        }, wait);
    };
}


const moveAction = {
    left: (element) => element.position[0] = Math.max(0, element.position[0] -1),
    right: (element) => element.position[0] = Math.min(NUMBER_OF_COLUMNS - 1, element.position[0] + 1),
    up: (element) => element.position[1] = Math.max(0, element.position[1] -1),
    down: (element) => element.position[1] = Math.min(NUMBER_OF_ROWS - 1, element.position[1] +1),
}

const move = debounce((dir) => {
    moveElement(elements.player1, dir, checkClashes);
}, STEP_TIME);

const moveElement = (el, dir, fn) => {
    showPoints();
    performDir(el, dir)
    fn && fn();
    positionElements();
}

function performDir(el, dir) {
    moveAction[dir](el);
    el.currentDirection = dir;
    removeClasses(el.element, DIRECTIONS);
    addClass(el.element, el.currentDirection);
}

function showPoints() {
    while (nextMovePoints.length) {
        const {value, position} = nextMovePoints.pop();
        const element = document.createElement("div");
        element.className = `points-${value} points element`;
        element.style = `left: ${position[0] * CELL_SIZE + (CELL_SIZE - ELEMENT_HEIGHT) / 2}; top: ${position[1] * CELL_SIZE + (CELL_SIZE - ELEMENT_HEIGHT) / 2};`;
        board.appendChild(element);
        setTimeout(() => element.remove(), 2000)
    }
}

function checkClashes() {
    const {player1, player2, ...els} = elements;
    Object.values(els).forEach(el => {
        if (el.position[0] === player1.position[0] && el.position[1] === player1.position[1]) {
            const column = Math.floor(Math.random() * NUMBER_OF_COLUMNS);
            const row = Math.floor(Math.random() * NUMBER_OF_ROWS);
            const position = el.position;
            el.position = [column, row];
            score+= el.type.points;
            printScore();
            nextMovePoints.push({value: el.type.points, position})
        }
    });
}

setInterval(() => {
    const dir = DIRECTIONS[Math.floor(Math.random()* DIRECTIONS.length)];
    moveElement(elements.player2, dir);
}, STEP_TIME*2);

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            move('left');
            break;
        case 38:
            move('up');
            break;
        case 39:
            move('right');
            break;
        case 40:
            move('down');
            break;
    }
};

function printScore() {
    scoreElement.innerText = `${score}`
}
function handleTouchStart(e) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        const x = e.touches[0].clientX - control.getBoundingClientRect().x;
        const y = e.touches[0].clientY - control.getBoundingClientRect().y;
        console.log(x, y);

        if (Math.abs(y - CONTROL_HEIGHT/2) > Math.abs(x - CONTROL_HEIGHT/2)) {
            if (y < CONTROL_HEIGHT/2) {
                move('up');
            } else {
                move('down');
            }
        } else {
            if (x < CONTROL_HEIGHT/2) {
                move('left');
            } else {
                move('right');
            }
        }
    }, 10);
}

function handleMouseDown(e) {
    mouseDown = true;
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        const x = e.clientX - control.getBoundingClientRect().x;
        const y = e.clientY - control.getBoundingClientRect().y;
        console.log(x, y);

        if (Math.abs(y - 150) > Math.abs(x - 150)) {
            if (y < 150) {
                move('up');
            } else {
                move('down');
            }
        } else {
            if (x < 150) {
                move('left');
            } else {
                move('right');
            }
        }
    }, 10);
}


function handleMouseMove(e) {
    if (!mouseDown) {
        return;
    }
    handleMouseDown(e);
}

function handleTouchEnd(e) {
    mouseDown = false;
    clearInterval(intervalId)
}