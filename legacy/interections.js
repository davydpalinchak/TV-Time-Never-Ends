function interact() {
    const hitboxX = player.x + (scaleWidth - player.hitboxWidth) / 2;
    const hitboxY = player.y + scaleHeight - player.hitboxHeight;

    const left = Math.floor(hitboxX / tilenumb);
    const right = Math.floor((hitboxX + player.hitboxWidth - 1) / tilenumb);
    const top = Math.floor(hitboxY / tilenumb);
    const bottom = Math.floor((hitboxY + player.hitboxHeight - 1) / tilenumb);

    for (let y = top - 1; y <= bottom + 1; y++) {
        for (let x = left - 1; x <= right + 1; x++) {

            if (gameMap[y]?.[x] !== interaction) {
                continue;
            }

            switch (`${x},${y}`) {

                case "12,4":
                case "12,5":
                case "12,6":        
                    startDialogue([
                        "* Кріс! Чорничка ти моя ненаглядна!",
                        "* Готовий до цілодобового телевізійного \n  марафону?",
                        "* Стільки ігор! Стільки Забав! \n  Голова крутиться кадетом по \n  антенам.."
                    ], "tv");
                    break;

                case "1,8":
                case "1,9":
                    startDialogue([
                        "* (На диво, цей кактус пахне як....\n  яблуко?)",
                        "* (Вам здалось дивним \n  нюхати кактуси..)"
                    ]);
                    break;

                case "13,8":
                case "13,9":
                    startDialogue([
                        "* (На диво...)",
                        "* (Цей кактус взагалі не пахне.)",
                        "* (А він мав взагалі пахнути?)"
                    ]);
                    break;
            }

            return;
        }
    }
}