let dialogueActive = false;
let dialogueArray = [];
let dialogueIndex = 0;
let textIndex = 0;
let text = "";
let textTimer = 0;
let textSpeed = 2;
let dialogueVoice = "default";
const textbox = new Image();
textbox.src = "assets/textbox.png"
const textSound = new Audio("assets/sfx/snd_text.wav");
const tvSounds = [];

for (let i = 2; i <= 11; i++) {
    const sound = new Audio(`assets/sfx/snd_tv_voice_short_${i}.wav`);
    tvSounds.push(sound);
}

function startDialogue(lines, voice = "default") {
    dialogueActive = true;
    dialogueArray = lines;
    dialogueIndex = 0;
    text = "";
    textIndex = 0;
    textTimer = 0;
    dialogueVoice = voice;
}

function Dialogue(frameScale) {
    if (!dialogueActive) return;

    const currentLine = dialogueArray[dialogueIndex];
    textTimer += frameScale;

    if (textTimer >= textSpeed) {
        textTimer = 0;

        if (textIndex < currentLine.length) {
            textIndex++;
            text = currentLine.slice(0, textIndex);

            if (text[text.length - 1] !== " ") {
                if (dialogueVoice === "tv") {
                    const sound = tvSounds[
                        Math.floor(Math.random() * tvSounds.length)
                    ];

                    sound.currentTime = 0;
                    sound.play();
                } else {
                    textSound.currentTime = 0;
                    textSound.play();
                }
            }
        }
    }
}

function textboxUpdate() {
    if (!dialogueActive) return;

    const boxWidth = 900;
    const boxHeight = boxWidth * (textbox.height / textbox.width);

    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = canvas.height - boxHeight - 20;

    ctx.drawImage(
        textbox,
        boxX,
        boxY,
        boxWidth,
        boxHeight
    );

    ctx.fillStyle = "white";
    ctx.font = "36px Determination";

    const lines = text.split("\n");
    const lineHeight = 57;

    lines.forEach((line, index) => {
        ctx.fillText(
            line,
            boxX + 55,
            boxY + 75 + index * lineHeight
        );
    });

}

function nextDialogue() {
    if (!dialogueActive) return;

    const currentLine = dialogueArray[dialogueIndex];

    if (textIndex < currentLine.length) {
        return;
    }

    if (dialogueIndex < dialogueArray.length - 1) {
        dialogueIndex++;
        textIndex = 0;
        text = "";
        textTimer = 0;
    } else {
        dialogueActive = false;
    }
}

function skipDialogue() {
    if (!dialogueActive) return;

    const currentLine = dialogueArray[dialogueIndex];

    if (textIndex < currentLine.length) {
        textIndex = currentLine.length;
        text = currentLine;
        textTimer = 0;
    }
}