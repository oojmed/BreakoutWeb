export class Vector {
  constructor(_x = 0, _y = 0) {
    this.x = _x;
    this.y = _y;
  }

  add(vec) {
    this.x += vec.x;
    this.y += vec.y;

    return this;
  }

  sub(vec) {
    this.x -= vec.x;
    this.y -= vec.y;

    return this;
  }

  scale(factor) {
    this.x *= factor;
    this.y *= factor;

    return this;
  }

  scaleTo(factor) {
    return this.scale(factor / this.length());
  }

  normalize() {
    let len = this.length();

    this.x /= len;
    this.y /= len;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  truncate(max) {
    let len = this.length();

    if (len > max) {
      this.scale(max / len);
    }

    return this;
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  rotate(rad) {
    let cs = Math.cos(rad);
    let sn = Math.sin(rad);

    let px = this.x * cs - this.y * sn;
    let py = this.x * sn + this.y * cs;

    this.x = px;
    this.y = py;

    return this;
  }

  isZero() {
    return this.x === 0 && this.y === 0;
  }

  directionFromOrigin() {
    return Math.atan2(this.y, this.x);
  }

  clone() {
    return new Vector(this.x, this.y);
  }
}