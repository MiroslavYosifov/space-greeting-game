   export class Confetti {
    constructor(x, y) {
        this.colors = ["#f97316", "#38bdf8", "#a855f7", "#22c55e", "#eab308", "#f9a8d4"];
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 80 + Math.random() * 140;
        this.x = x,
        this.y = y,
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed - 40;
        this.size = 4 + Math.random() * 4;
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.life = 1.2 + Math.random() * 1;
        this.maxLife = 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.vr = (Math.random() - 0.5) * 6;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += 180 * deltaTime; // gravity
        this.rotation += this.vr * deltaTime;
        this.life -= deltaTime;
    }

    draw(ctx) {
        const alpha = Math.max(this.life / this.maxLife, 0);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}