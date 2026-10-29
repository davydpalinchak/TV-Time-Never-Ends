let tilenumb = 64;

const topRow = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
const midle1 = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
const midle2 = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
const midle3 = [1,1,3,3,1,3,3,1,1,3,3,3,1,1,1];
const midle4 = [1,0,0,0,0,0,0,0,0,0,0,0,2,0,1];
const midle5 = [1,0,0,0,0,0,0,0,0,0,0,0,2,0,1];
const midle6 = [1,0,0,0,0,0,0,0,0,0,0,0,2,0,1];
const midle7 = [1,0,1,1,1,1,1,0,0,0,0,0,0,0,1];
const midle8 = [1,2,1,1,1,1,1,0,0,0,0,0,0,2,1];
const midle9 = [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1];
const botRow = [1,1,1,1,1,1,1,1,1,3,3,1,1,1,1];

const gameMap = [topRow, midle1, midle2, midle3, midle4, midle5, midle6, midle7, midle8, midle9, botRow]
const mapwidth = gameMap[0].length * tilenumb;
const mapheight = gameMap.length * tilenumb;
/*const mapOffsetX = 64;
const mapOffsetY = 64;*/

const wall = 1;
const interaction = 2;
const door = 3;


function drawMap() { // тимчасово
    for (let y = 0; y < gameMap.length; y++) {
        for (let x = 0; x < gameMap[y].length; x++) {

            const tile = gameMap[y][x];

            if (tile === wall) {
                ctx.fillStyle = "black";
            } else if (tile === interaction) {
                ctx.fillStyle = "yellow";
            } else if (tile === door) {
                ctx.fillStyle = "blue";
            } else {
                ctx.fillStyle = "white";
            }

            ctx.fillRect(
                x * tilenumb,
                y * tilenumb,
                tilenumb,
                tilenumb
            );
        }
    }
}