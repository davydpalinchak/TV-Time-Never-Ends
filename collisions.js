function isWall(x, y) {
  const tileX = Math.floor(x / tilenumb);
  const tileY = Math.floor(y / tilenumb);

  if (
    tileX < 0 ||
    tileY < 0 ||
    tileY >= gameMap.length ||
    tileX >= gameMap[tileY].length
  ) {
    return true;
  }

  return (
    gameMap[tileY][tileX] === wall ||
    gameMap[tileY][tileX] === interaction
);
}

function canMoveTo(x, y) {
  const hitboxX = x + (scaleWidth - player.hitboxWidth) / 2;
  const hitboxY = y + scaleHeight - player.hitboxHeight;

  const left = hitboxX;
  const right = hitboxX + player.hitboxWidth;
  const top = hitboxY;
  const bottom = hitboxY + player.hitboxHeight;

  return (
    !isWall(left, top) &&
    !isWall(right, top) &&
    !isWall(left, bottom) &&
    !isWall(right, bottom)
  );
}