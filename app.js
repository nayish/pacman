const debug = isDebug();

const NUMBER_OF_COLUMNS = 15;
const NUMBER_OF_ROWS = 10;

const PACMAN_START = [2,2];
const CELL_SIZE = 60;
const PACMAN_HEIGHT = 60;

let control;
let pacman;
let postion = PACMAN_START;

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
    positionPacman(postion);

    board.appendChild(pacman);

    control = document.createElement("div");
    control.className = 'control';

    control.addEventListener('touchstart', handleTouchStart, false);

    document.body.appendChild(control);


    // setTimeout(() => {
    //     postion = [4,4];
    //     positionPacman(postion);
    // },400)
});

function positionPacman([x,y]) {
    pacman.style = `left: ${x * CELL_SIZE + (CELL_SIZE-PACMAN_HEIGHT)/2}; top: ${y * CELL_SIZE  + (CELL_SIZE-PACMAN_HEIGHT)/2};`
}

function isDebug() {
    const res = window.location.href.split('?')[1]?.split('&').map(a => a.split('=')).filter(a => a[0] === 'debug');
    return res?.length > 0 && res[0][1] !== 'false';
}
setInterval(() => {
    if (pacman) {
        toggleClass(pacman, 'open');
    }
}, 300);

function toggleClass(el, cls) {
    const clss = el.className.split(' ');
    const index = clss.indexOf(cls);
    if (index !== -1) {
        el.className = [...clss.filter(c => c !== cls)]
    } else {
        el.className = [...clss, cls].join(' ')
    }
}

function handleTouchStart(e) {
    const x = e.touches[0].clientX - control.getBoundingClientRect().x;
    const y = e.touches[0].clientY - control.getBoundingClientRect().y;
    console.log(x, y);

    if (x < 300/2 && x < y) {
        console.log('left');
    } else if (y < 300/2) {
        console.log('right')
    } else if ( x > 300/2 && x > y) {
        console.log('up')
    } else {
        console.log('down');
    }
}