import { drawSpeechBubble } from "./speech_bubble.js";

export class Cake {
    constructor(canvas) {
        this.canvas = canvas;
        const w = this.canvas.width / window.devicePixelRatio;
        this.width = 90;
        this.height = 70;
        this.x = w / 2 - this.width / 2;
        this.y = 40;
        this.speedX = 2.0;
        this.hp = 16;
        this.maxHp = 16;

        this.bubble = null; 
        this.bubbleTimer = 0;
    }

    update(delta) {
        const w = this.canvas.width / window.devicePixelRatio;
        this.x += this.speedX;
        if (this.x < 10) {
            this.x = 10;
            this.speedX *= -1;
        }
        if (this.x + this.width > w - 10) {
            this.x = w - 10 - this.width;
            this.speedX *= -1;
        }

        if (this.bubbleTimer > 0) {
            this.bubbleTimer--;
            if (this.bubbleTimer <= 0) this.bubble = null;
        }
    }

      draw(ctx) {
        const x = this.x;
        const y = this.y;
        const w = this.width;
        const h = this.height;

        // долен слой торта
        ctx.fillStyle = "#f97316";
        ctx.fillRect(x, y + 24, w, h - 24);

        // глазура
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(x + 4, y + 18, w - 8, 14);

        // капки глазура
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 32);
        for (let i = 0; i < 5; i++) {
          const dropX = x + 10 + (i * (w - 20)) / 4;
          ctx.quadraticCurveTo(dropX, y + 40, dropX + 6, y + 32);
        }
        ctx.lineTo(x + w - 4, y + 32);
        ctx.closePath();
        ctx.fill();

        // 🔥 анимирани свещички
        const candleCount = 4;
        const step = w / (candleCount + 1);
        const hpRatio = Math.max(this.hp, 0) / this.maxHp;
        const t = Date.now() / 180; // време за анимация

        for (let i = 1; i <= candleCount; i++) {
          const cx = x + step * i;
          const cy = y + 16;

          // свещ
          ctx.fillStyle = "#e5e7eb";
          ctx.fillRect(cx - 3, cy - 14, 6, 14);

          // flicker
          const flickerY = Math.sin(t + i * 0.9) * 2;
          const flickerX = Math.cos(t * 1.3 + i * 0.7) * 1.5;

          const baseFlame = 10 * hpRatio + 3;
          const flameHeight = baseFlame + flickerY;

          // ядро на пламъка
          ctx.fillStyle = "rgba(248, 250, 252," + (0.4 + 0.6 * hpRatio) + ")";
          ctx.beginPath();
          ctx.moveTo(cx + flickerX, cy - 14 - flameHeight);
          ctx.quadraticCurveTo(
            cx + 4 + flickerX,
            cy - 10 - flameHeight,
            cx + flickerX,
            cy - 6 - flameHeight / 2
          );
          ctx.quadraticCurveTo(
            cx - 4 + flickerX,
            cy - 10 - flameHeight,
            cx + flickerX,
            cy - 14 - flameHeight
          );
          ctx.fill();

          // ореол
          ctx.fillStyle = "rgba(252, 211, 77," + (0.2 + 0.4 * hpRatio) + ")";
          ctx.beginPath();
          ctx.ellipse(
            cx + flickerX,
            cy - 10 - flameHeight / 1.8,
            6,
            8,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // сянка под тортата
        ctx.fillStyle = "rgba(15,23,42,0.7)";
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + 6, w / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // текст над тортата + HP бар
        const barWidth = 140;
        const barHeight = 8;
        const barX = x + w / 2 - barWidth / 2;
        const barY = y - 14;

        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(248,250,252,0.9)";
        ctx.fillText("Extinguish the cake! 💧🎂", x + w / 2, barY - 10);

        ctx.fillStyle = "rgba(15,23,42,0.9)";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const hpRatio2 = Math.max(this.hp, 0) / this.maxHp;
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(barX, barY, barWidth * hpRatio2, barHeight);

        ctx.strokeStyle = "rgba(148,163,184,0.9)";
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // bubble
        if (this.bubble && this.bubbleTimer > 0) {
          drawSpeechBubble(ctx, this.x + this.width / 2 - 30, this.y - 70, this.bubble);
        }
      }
}