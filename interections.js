function interact() {
    const hitboxX = player.x + (scaleWidth - player.hitboxWidth) / 2;
    const hitboxY = player.y + scaleHeight - player.hitboxHeight;

    const left = Math.floor(hitboxX / tilenumb);
    const right = Math.floor((hitboxX + player.hitboxWidth - 1) / tilenumb);
    const top = Math.floor(hitboxY / tilenumb);
    const bottom = Math.floor((hitboxY + player.hitboxHeight - 1) / tilenumb);

    for (let y = top - 1; y <= bottom + 1; y++) {
        for (let x = left - 1; x <= right + 1; x++) {

            if (
                y < 0 ||
                y >= gameMap.length ||
                x < 0 ||
                x >= gameMap[y].length
            ) {
                continue;
            }

            if (gameMap[y][x] === interaction) {
                console.log("INTERACTION!");
                return;
            }
        }
    }
}