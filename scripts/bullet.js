  export class Bullet {
    constructor(x, y, width, height, speed, canvas) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update(deltaTime) {
        this.y -= this.speed;
    }

    draw(ctx, waterMode) {
        if (!waterMode) {
            ctx.fillStyle = "#f97316";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else {
            const wave = Math.sin((Date.now() + this.y * 5) / 80) * 2;
            const cx = this.x + this.width / 2 + wave;
            const topY = this.y;
            const dropSpacing = 7;

            for (let i = 0; i < 3; i++) {
                const dy = topY + i * dropSpacing;

                ctx.beginPath();
                ctx.fillStyle = "rgba(96,165,250,0.95)";
                ctx.ellipse(cx, dy, 3.8, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.beginPath();
                ctx.ellipse(cx - 1, dy - 1.5, 1.3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}