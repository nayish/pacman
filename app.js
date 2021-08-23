const debug = isDebug();

const NUMBER_OF_COLUMNS = 15;
const NUMBER_OF_ROWS = 10;

const PACMAN_START = [2,2];
const CELL_SIZE = 60;
const PACMAN_HEIGHT = 60;
const STEP_TIME = 300;
const ANIMATION_SPEED = 200;

let control;
let pacman;
let position = PACMAN_START;
let currentDirection = 'right';
let intervalId;

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
    const board = document.createElement("div");
    board.className = 'board';
    document.body.appendChild(board);

    for (let i=0; i < NUMBER_OF_COLUMNS; i++) {
        for (let j=0; j < NUMBER_OF_ROWS; j++) {
            const cell = document.createElement("span");
            cell.className = 'cell';
            board.appendChild(cell);
        }
    }

    pacman = document.createElement("div");
    pacman.className = 'pacman';
    positionPacman(position);

    board.appendChild(pacman);

    control = document.createElement("div");
    control.className = 'control';

    control.addEventListener('touchstart', handleTouchStart, false);
    control.addEventListener('touchmove', handleTouchStart, false);
    control.addEventListener('touchend', handleTouchEnd, false);

    document.body.appendChild(control);


    // setTimeout(() => {
    //     position = [4,4];
    //     positionPacman(position);
    // },400)
});

function positionPacman([x,y]) {
    pacman.style = `left: ${x * CELL_SIZE + (CELL_SIZE-PACMAN_HEIGHT)/2}; top: ${y * CELL_SIZE  + (CELL_SIZE-PACMAN_HEIGHT)/2};`
    removeClasses(pacman, ['left', 'right', 'up', 'down']);
    addClass(pacman, currentDirection);
}

function isDebug() {
    const res = window.location.href.split('?')[1]?.split('&').map(a => a.split('=')).filter(a => a[0] === 'debug');
    return res?.length > 0 && res[0][1] !== 'false';
}
setInterval(() => {
    if (pacman) {
        toggleClass(pacman, 'open');
    }
}, ANIMATION_SPEED);

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
    left: () => position[0] = Math.max(0, position[0] -1),
    right: () => position[0] = Math.min(NUMBER_OF_COLUMNS - 1, position[0] + 1),
    up: () => position[1] = Math.max(0, position[1] -1),
    down: () => position[1] = Math.min(NUMBER_OF_ROWS - 1, position[1] +1),
}

const move = debounce((dir) => {
    moveAction[dir]();
    currentDirection = dir;
    positionPacman(position);
}, STEP_TIME);

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


function handleTouchStart(e) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
        const x = e.touches[0].clientX - control.getBoundingClientRect().x;
        const y = e.touches[0].clientY - control.getBoundingClientRect().y;
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

function handleTouchEnd(e) {
    clearInterval(intervalId)
}