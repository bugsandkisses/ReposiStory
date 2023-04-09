Fairy {
    constructor(x, y, radius, strokeColor, fillColor) {
        this.x = x, this.y = y;
        this.radius = radius;
        this.angle = Math.PI/4;
        
        this.strokeColor = strokeColor, this.fillColor = fillColor;
        this.n = 1, this.d = 2;
    }
    #setCtx(ctx) {
        ctx.strokeColor = this.strokeColor;
        ctx.fillColor = this.fillColor;
    }
    draw(ctx) {
        this.setCtx(ctx);
    }
}