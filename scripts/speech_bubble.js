export function drawSpeechBubble(ctx, x, y, text) {
    ctx.save();
    ctx.font = "14px system-ui";
    const padding = 6;
    const width = ctx.measureText(text).width + padding * 2;
    const height = 24;

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.strokeStyle = "rgba(15,23,42,0.35)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    const r = 10;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + width * 0.45 + 6, y + height);
    ctx.lineTo(x + width * 0.45, y + height + 8);
    ctx.lineTo(x + width * 0.45 - 6, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#020617";
    ctx.fillText(text, x + padding, y + height * 0.7);
    ctx.restore();
}