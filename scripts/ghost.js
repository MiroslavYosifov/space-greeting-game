import { drawSpeechBubble } from "./speech_bubble.js";

export class Ghost {
    constructor(x, y, canvas) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;

        const colors = [
            "rgba(255, 120, 220, 0.9)",
            "rgba(120, 255, 180, 0.9)",
            "rgba(120, 180, 255, 0.9)"
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.speedY = 1.4 + Math.random() * 1.2;
        this.speedX = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 1.5);
        this.phase = Math.random() * Math.PI * 2;

        this.bubbleText = null;
        this.bubbleTimer = 0;
    }

    maybeSpeak() {
        if (this.bubbleTimer > 0) {
            this.bubbleTimer--;
            if (this.bubbleTimer <= 0) this.bubbleText = null;
            return;
        }
        if (Math.random() < 0.003) { 
            const lines = ["ㅋㅋㅋ",  "👻", "부우!", "👀"];
            this.bubbleText = lines[Math.floor(Math.random() * lines.length)];
            this.bubbleTimer = 120; // ~2 секунди
        }
    }

    update(deltaTime) {
        this.x += this.speedX;
        this.y += this.speedY + Math.sin((Date.now() / 300) + this.phase) * 0.5;

        const maxX = this.canvas.width / window.devicePixelRatio - this.width;
        if (this.x < 0) { this.x = 0; this.speedX *= -1; }
        if (this.x > maxX) { this.x = maxX; this.speedX *= -1; }

        this.maybeSpeak();
    }

    draw(ctx) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, cy, 16, Math.PI, 0);
        ctx.lineTo(cx + 16, cy + 16);
        ctx.lineTo(cx + 8, cy + 14);
        ctx.lineTo(cx, cy + 16);
        ctx.lineTo(cx - 8, cy + 14);
        ctx.lineTo(cx - 16, cy + 16);
        ctx.closePath();
        ctx.fill();

        // eyes
        ctx.fillStyle = "#fff";
        ctx.fillRect(cx - 10, cy - 4, 8, 8);
        ctx.fillRect(cx + 2, cy - 4, 8, 8);

        ctx.fillStyle = "#000";
        ctx.fillRect(cx - 7, cy - 2, 3, 3);
        ctx.fillRect(cx + 5, cy - 2, 3, 3);

        // bubble
        if (this.bubbleText) {
          drawSpeechBubble(ctx, this.x - 4, this.y - 40, this.bubbleText);
        }
    }
}