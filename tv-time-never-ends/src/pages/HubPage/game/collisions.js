import { TILE_SIZE, TILE, gameMap } from "./map.js";
import { player, SPRITE } from "./player.js";

export function isWall(x, y) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    if (
        tileX < 0 || tileY < 0 || tileY >= gameMap.length || tileX >= gameMap[tileY].length
    ) {
        return true;
    }

    const tile = gameMap[tileY][tileX];

    return tile === TILE.WALL || tile === TILE.INTERACTION;
}

export function canMoveTo(x, y) {
    const hitboxX =
        x + (SPRITE.drawWidth - player.hitboxWidth) / 2;

    const hitboxY =
        y + SPRITE.drawHeight - player.hitboxHeight;

    const left = hitboxX;
    const right = hitboxX + player.hitboxWidth - 1;
    const top = hitboxY;
    const bottom = hitboxY + player.hitboxHeight - 1;

    return (
        !isWall(left, top) &&
        !isWall(right, top) &&
        !isWall(left, bottom) &&
        !isWall(right, bottom)
    );
}
