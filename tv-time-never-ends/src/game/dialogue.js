export function createDialogue(ctx, canvas) {
    const base = import.meta.env.BASE_URL;

    const textbox = new Image();
    textbox.src = `${base}assets/textbox.png`;

    const textSound = new Audio(`${base}assets/sfx/snd_text.wav`);

    const tvSounds = [];
    for (let i = 2; i <= 11; i++) {
        const sound = new Audio(`${base}assets/sfx/snd_tv_voice_short_${i}.wav`);
        tvSounds.push(sound);
    }


    let active = false;
    let lines = [];
    let lineIndex = 0;
    let textIndex = 0;
    let textTimer = 0;
    let text = "";
    let voice = "default";

    function start(newLines, newVoice = "default") {
        if (active) return;

        active = true;
        lines = newLines;
        lineIndex = 0;
        textIndex = 0;
        textTimer = 0;
        text = "";
        voice = newVoice;
    }

    function update(frameScale) {
        if (!active) return;

        const line = lines[lineIndex];
        if (!line) return;

        textTimer += frameScale;

        if (textTimer < 2) return;

        textTimer = 0;

        if (textIndex < line.length) {
            textIndex++;
            text = line.slice(0, textIndex);

            if (text[text.length - 1] !== " ") {
                const sound = voice === "tv"
                    ? tvSounds[Math.floor(Math.random() * tvSounds.length)]
                    : textSound;

                sound.volume = 0.5;
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        }
    }

function draw() {
    if (!active || !textbox.complete || !textbox.naturalWidth) {
        return;
    }

    const boxWidth = 900;
    const boxHeight = boxWidth * textbox.height / textbox.width;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = canvas.height - boxHeight - 20;

    ctx.drawImage(textbox, boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = "white";
    ctx.font = '36px "Determination", monospace';

    const visibleLines = text.split("\n");

    visibleLines.forEach((line, index) => {
        ctx.fillText(
            line,
            boxX + 55,
            boxY + 75 + index * 45
        );
    });
}

function next() {
    if (!active) return;
    const line = lines[lineIndex];
    if (textIndex < line.length) {
        return;
    }
    if (lineIndex < lines.length - 1) {
        lineIndex++;
        textIndex = 0;
        textTimer = 0;
        text = "";
    } else {
        active = false;
    }
}

function skip() {
    if (!active) return;
    const line = lines[lineIndex];
    textIndex = line.length;
    text = line;
}

    return {
        start,
        update,
        draw,
        next,
        skip,
        isActive: () => active,
    };
}
