  export class Asteroid {
    constructor(x, y, radius, speed, segments, wobble, canvas) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.segments = segments;
        this.wobble = wobble;   
    }

    update(deltaTime) {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.radius, this.y + this.radius);

        const segments = this.segments;
        ctx.beginPath();
        for (let i = 0; i < segments; i++) {
          const angle = (Math.PI * 2 * i) / segments;
          const r = this.radius * this.wobble[i];
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
        grad.addColorStop(0, "rgb(255,120,120)");
        grad.addColorStop(0.6, "rgb(210,50,50)");
        grad.addColorStop(1, "rgb(120,20,20)");
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i < segments; i++) {
          const angle = (Math.PI * 2 * i) / segments;
          const r = this.radius * this.wobble[i] / 4;
          const px = Math.cos(angle) * r - 5;
          const py = Math.sin(angle) * r - 5;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 235, 235, 0.6)";
        ctx.fill();

        ctx.restore();
    }
}