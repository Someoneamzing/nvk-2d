function toRadians(angle) {
  //console.log("To radians with angle: " + angle);
  return Math.PI / 180 * angle;
}

function lerp(a, b, t) {
  if (a instanceof vec2 || a instanceof vec3 || a instanceof vec4) {
    return a.add(b.sub(a).mult(t));
  } else if (!Number.isNaN(a)){
    return a + (b-a) * t;
  }
}

class vec2 {

  get length(){return 2;}

  constructor(a, b) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 2);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Float32Array(2);
      this.buffer = this.float32.buffer;
      if (typeof a == "number") {
        this.float32[0] = a;
        this.float32[1] = b;
      } else if (a instanceof vec2) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
      }
    }
  }

  static randomUnit(){
    return new vec2(1,0).rotate(Math.random() * 360);
  }

  get 0() {
    return this.float32[0];
  }

  get 1() {
    return this.float32[1];
  }

  set 0(val) {
    this.float32[0] = val;
  }

  set 1(val) {
    this.float32[1] = val;
  }

  get x(){
    return this.float32[0];
  }

  set x(x){
    this.float32[0] = x;
  }

  get y(){
    return this.float32[1];
  }

  set y(y){
    this.float32[1] = y;
  }

  add(o){
    if (o instanceof vec2) {
      return new vec2(this.x + o.x, this.y + o.y);
    } else if (typeof o == 'number') {
      return new vec2(this.x + o, this.y + o);
    }
  }

  sub(o){
    if (o instanceof vec2) {
      return new vec2(this.x - o.x, this.y - o.y);
    } else if (typeof o == 'number') {
      return new vec2(this.x - o, this.y - o);
    }
  }

  dot(o){
    return this.x * o.x + this.y * o.y;
  }

  cross(o){
    return this.x * o.y - this.y * o.x;
  }

  mag(){
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  mag2(){
    return this.x * this.x + this.y * this.y;
  }

  mult(val) {
    if (typeof val == 'number') {
      return new vec2(this.x * val, this.y * val);
    }
  }

  rotate(angle){
    return new vec2(
      Math.cos(angle) * this.x - Math.sin(angle)*this.y,
      Math.sin(angle) * this.x + Math.cos(angle)*this.y
    )
  }

  normalised(){
    let length = this.mag();
    return new vec2(this.x/length,this.y/length);
  }

  toString(){
    return "vec2(" + this.x + ", " + this.y + ")"
  }

  static get size(){
    return Float32Array.BYTES_PER_ELEMENT * 2;
  }

  swapMemory(buffer, offset) {
    this.float32 = new Float32Array(buffer, offset, 2);
    this.buffer = this.float32.buffer;
  }


}

class ivec2 {

  get length(){return 2;}

  constructor(a, b) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Int32Array(a, b, 2);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Int32Array(2);
      this.buffer = this.float32.buffer;
      if (typeof a == "number") {
        this.float32[0] = a;
        this.float32[1] = b;
      } else if (a instanceof vec2) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
      }
    }
  }

  get 0() {
    return this.float32[0];
  }

  get 1() {
    return this.float32[1];
  }

  set 0(val) {
    this.float32[0] = val;
  }

  set 1(val) {
    this.float32[1] = val;
  }

  get x(){
    return this.float32[0];
  }

  set x(x){
    this.float32[0] = x;
  }

  get y(){
    return this.float32[1];
  }

  set y(y){
    this.float32[1] = y;
  }

  static get size(){
    return Int32Array.BYTES_PER_ELEMENT * 2;
  }

  swapMemory(buffer, offset) {
    this.float32 = new Int32Array(buffer, offset, 2);
    this.buffer = this.float32.buffer;
  }


}

class uvec2 {

  get length(){return 2;}

  constructor(a, b) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Uint32Array(a, b, 2);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Uint32Array(2);
      this.buffer = this.float32.buffer;
      if (typeof a == "number") {
        this.float32[0] = a;
        this.float32[1] = b;
      } else if (a instanceof vec2) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
      }
    }
  }

  get 0() {
    return this.float32[0];
  }

  get 1() {
    return this.float32[1];
  }

  set 0(val) {
    this.float32[0] = val;
  }

  set 1(val) {
    this.float32[1] = val;
  }

  get x(){
    return this.float32[0];
  }

  set x(x){
    this.float32[0] = x;
  }

  get y(){
    return this.float32[1];
  }

  set y(y){
    this.float32[1] = y;
  }

  static get size(){
    return Uint32Array.BYTES_PER_ELEMENT * 2;
  }

  swapMemory(buffer, offset) {
    this.float32 = new Uint32Array(buffer, offset, 2);
    this.buffer = this.float32.buffer;
  }
}

class vec3 {

  get length(){return 3;}

  constructor(a, b, c) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 3);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Float32Array(3);
      this.buffer = this.float32.buffer;
      if (typeof a == "number") {
        if (typeof b == "number") {
          this.float32[0] = a;
          this.float32[1] = b;
          this.float32[2] = c;
        } else if (b instanceof vec2) {
          this.float32[0] = a;
          this.float32[1] = b.x;
          this.float32[2] = b.y;
        }
      } else if (a instanceof vec2) {
        if (typeof b == "number") {
          this.float32[0] = a.x;
          this.float32[1] = a.y;
          this.float32[2] = b;
        }
      } else if (a instanceof vec3) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
        this.float32[2] = a.z;
      }
    }
  }

  swapMemory(buffer, offset) {
    this.float32 = new Float32Array(buffer, offset, 3);
    this.buffer = this.float32.buffer;
  }

  get 0() {
    return this.float32[0];
  }

  get 1() {
    return this.float32[1];
  }

  get 2() {
    return this.float32[2];
  }

  set 0(val) {
    this.float32[0] = val;
  }

  set 1(val) {
    this.float32[1] = val;
  }

  set 2(val) {
    this.float32[2] = val;
  }

  get x(){
    return this.float32[0];
  }

  set x(x){
    this.float32[0] = x;
  }

  get y(){
    return this.float32[1];
  }

  set y(y){
    this.float32[1] = y;
  }

  get z(){
    return this.float32[2];
  }

  set z(z){
    this.float32[2] = z;
  }

  get r(){
    return this.x;
  }

  set r(r) {
    this.x = r;
  }

  get g(){
    return this.y;
  }

  set g(g) {
    this.y = g;
  }

  get b(){
    return this.z;
  }

  set b(b) {
    this.z = b;
  }

  rotate(o, angle){
    if (o instanceof quat) {
      let conjugate = o.conjugate;
      let w = o.mult(this).mult(conjugate);
      //console.log(w);
      return new vec3(w.x, w.y, w.z);
    } else if (o instanceof vec3) {
      return this.rotate(new quat().rotate(o, angle));
    }
  }

  add(o){
    if (o instanceof vec3) {
      return new vec3(this.x + o.x, this.y + o.y, this.z + o.z);
    } else if (typeof o == 'number') {
      return new vec3(this.x + o, this.y + o, this.z + o);
    }
  }

  sub(o){
    if (o instanceof vec3) {
      return new vec3(this.x - o.x, this.y - o.y, this.z - o.z);
    } else if (typeof o == 'number') {
      return new vec3(this.x - o, this.y - o, this.z - o);
    }
  }

  dot(o){
    return this.x * o.x + this.y * o.y + this.z * o.z;
  }

  cross(o){
    return new vec3( this.y * o.z - this.z * o.y,
                     this.z * o.x - this.x * o.z,
                     this.x * o.y - this.y * o.x);
  }

  mag(){
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  mag2(){
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalised(){
    let length = this.mag();
    return new vec3(this.x/length,this.y/length,this.z/length);
  }

  static get size(){
    return Float32Array.BYTES_PER_ELEMENT * 3;
  }


}

class vec4 {

  get length(){return 4;}

  constructor(a, b, c, d) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 4);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Float32Array(4);
      this.buffer = this.float32.buffer;
      if (typeof a == "number") {
        if (typeof b == "number") {
          if (typeof c == 'number') {
            this.float32[0] = a;
            this.float32[1] = b;
            this.float32[2] = c;
            this.float32[3] = d;
          }
        } else if (b instanceof vec2) {
          if (typeof c == 'number') {
            this.float32[0] = a;
            this.float32[1] = b.x;
            this.float32[2] = b.y;
            this.float32[3] = c;
          }
        } else if (b instanceof vec3) {
          this.float32[0] = a;
          this.float32[1] = b.x;
          this.float32[2] = b.y;
          this.float32[3] = b.z;
        }
      } else if (a instanceof vec2) {
        if (typeof b == "number") {
          this.float32[0] = a.x;
          this.float32[1] = a.y;
          this.float32[2] = b;
          this.float32[3] = c;
        } else if (b instanceof vec2) {
          this.float32[0] = a.x;
          this.float32[1] = a.y;
          this.float32[2] = b.x;
          this.float32[3] = b.y;
        }
      } else if (a instanceof vec3) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
        this.float32[2] = a.z;
        this.float32[3] = b;
      } else if (a instanceof vec4 || a instanceof quat) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
        this.float32[2] = a.z;
        this.float32[3] = a.w;
      }
    }
  }

  mag(){
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w + this.w);
  }

  mag2(){
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w + this.w;
  }

  swapMemory(buffer, offset) {
    this.float32 = new Float32Array(buffer, offset, 4);
    this.buffer = this.float32.buffer;
  }

  get 0() {
    return this.float32[0];
  }

  get 1() {
    return this.float32[1];
  }

  get 2() {
    return this.float32[2];
  }

  get 3() {
    return this.float32[3];
  }

  set 0(val) {
    this.float32[0] = val;
  }

  set 1(val) {
    this.float32[1] = val;
  }

  set 2(val) {
    this.float32[2] = val;
  }

  set 3(val) {
    this.float32[3] = val;
  }

  get x(){
    return this.float32[0];
  }

  set x(x){
    this.float32[0] = x;
  }

  get y(){
    return this.float32[1];
  }

  set y(y){
    this.float32[1] = y;
  }

  get z(){
    return this.float32[2];
  }

  set z(z){
    this.float32[2] = z;
  }

  get w(){
    return this.float32[3];
  }

  set w(w){
    this.float32[3] = w;
  }

  get r(){
    return this.x;
  }

  set r(r) {
    this.x = r;
  }

  get g(){
    return this.y;
  }

  set g(g) {
    this.y = g;
  }

  get b(){
    return this.z;
  }

  set b(b) {
    this.z = b;
  }

  get a(){
    return this.w;
  }

  set a(a) {
    this.w = a;
  }

  static get size(){
    return Float32Array.BYTES_PER_ELEMENT * 4;
  }
}

class quat {
  constructor(a, b, c, d) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 4);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Float32Array(4);
      this.buffer = this.float32.buffer;
      if (typeof a == "number") {
        if (typeof b == "number") {
          if (typeof c == 'number') {
            this.float32[0] = a;
            this.float32[1] = b;
            this.float32[2] = c;
            this.float32[3] = d;
          }
        } else if (b instanceof vec2) {
          if (typeof c == 'number') {
            this.float32[0] = a;
            this.float32[1] = b.x;
            this.float32[2] = b.y;
            this.float32[3] = c;
          }
        } else if (b instanceof vec3) {
          this.float32[0] = a;
          this.float32[1] = b.x;
          this.float32[2] = b.y;
          this.float32[3] = b.z;
        }
      } else if (a instanceof vec2) {
        if (typeof b == "number") {
          this.float32[0] = a.x;
          this.float32[1] = a.y;
          this.float32[2] = b;
          this.float32[3] = c;
        } else if (b instanceof vec2) {
          this.float32[0] = a.x;
          this.float32[1] = a.y;
          this.float32[2] = b.x;
          this.float32[3] = b.y;
        }
      } else if (a instanceof vec3) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
        this.float32[2] = a.z;
        this.float32[3] = b;
      } else if (a instanceof vec4 || a instanceof quat) {
        this.float32[0] = a.x;
        this.float32[1] = a.y;
        this.float32[2] = a.z;
        this.float32[3] = a.w;
      }
    }
  }

  swapMemory(buffer, offset) {
    this.float32 = new Float32Array(buffer, offset, 4);
    this.buffer = this.float32.buffer;
  }

  get 0() {
    return this.float32[0];
  }

  get 1() {
    return this.float32[1];
  }

  get 2() {
    return this.float32[2];
  }

  get 3() {
    return this.float32[3];
  }

  set 0(val) {
    this.float32[0] = val;
  }

  set 1(val) {
    this.float32[1] = val;
  }

  set 2(val) {
    this.float32[2] = val;
  }

  set 3(val) {
    this.float32[3] = val;
  }

  get x(){
    return this.float32[0];
  }

  set x(x){
    this.float32[0] = x;
  }

  get y(){
    return this.float32[1];
  }

  set y(y){
    this.float32[1] = y;
  }

  get z(){
    return this.float32[2];
  }

  set z(z){
    this.float32[2] = z;
  }

  get w(){
    return this.float32[3];
  }

  set w(w){
    this.float32[3] = w;
  }

  mult(r) {
    if (r instanceof quat) {
      let rw = this.w * r.w - this.x * r.x - this.y * r.y - this.z * r.z;
      let rx = this.x * r.w + this.w * r.x + this.y * r.z - this.z * r.y;
      let ry = this.y * r.w + this.w * r.y + this.z * r.x - this.x * r.z;
      let rz = this.z * r.w + this.w * r.z + this.x * r.y - this.y * r.x;
      //console.log("------------------");
      //console.log(this);
      //console.log(r);
      return new quat(rx,ry,rz,rw);
    } else if (r instanceof vec3) {
      //console.log("R is ", r);
      return this.mult(new quat(r, 0));
    } else if (r instanceof mat4) {
      return this.mult(r.toQuat());
    }
  }

  get conjugate(){
    return new quat(-this.x,-this.y,-this.z,this.w)
  }

  rotate(axis, angle) {

    //console.log(angle);

    let sinHalfAngle = Math.sin(toRadians(angle / 2))
    let cosHalfAngle = Math.cos(toRadians(angle / 2))

    //console.log("half angles: ", sinHalfAngle, cosHalfAngle);

    let rx = axis.x * sinHalfAngle;
    let ry = axis.y * sinHalfAngle;
    let rz = axis.z * sinHalfAngle;
    let rw = cosHalfAngle;

    return this.mult(new quat(rx,ry,rz,rw));
  }

  toMat(){
    return new mat4(new vec4(this.right, 0),
                    new vec4(this.up, 0),
                    new vec4(this.forward, 0),
                    new vec4(0,0,0,1));
  }

  get forward(){
    return new vec3(0,0,1).rotate(this);
  }

  get up(){
    return new vec3(0,1,0).rotate(this);
  }

  get right(){
    return new vec3(1,0,0).rotate(this);
  }

  static get size(){
    return Float32Array.BYTES_PER_ELEMENT * 4;
  }
}

class mat3 {
  constructor(a,b,c) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 9);
      this.buffer = this.float32.buffer;
    } else {
      // //console.trace("Allocating new memory");
      this.float32 = new Float32Array(9);
      this.buffer = this.float32.buffer;
    }
    this._0 = new vec3(this.buffer, this.float32.byteOffset);
    this._1 = new vec3(this.buffer, this.float32.byteOffset + vec3.size);
    this._2 = new vec3(this.buffer, this.float32.byteOffset + vec3.size * 2);
    if (typeof a == 'number') {
      this._0.x = a;
      this._1.y = a;
      this._2.z = a;
    } else if (a instanceof vec3) {
      this[0] = a;
      this[1] = b;
      this[2] = c;
    }
  }

  get 0() {
    return this._0;
  }

  get 1() {
    return this._1;
  }

  get 2() {
    return this._2;
  }

  set 0(val) {
    this._0.x = val.x;
    this._0.y = val.y;
    this._0.z = val.z;
  }

  set 1(val) {
    this._1.x = val.x;
    this._1.y = val.y;
    this._1.z = val.z;
  }

  set 2(val) {
    this._2.x = val.x;
    this._2.y = val.y;
    this._2.z = val.z;
  }

  mult(other) {
    if (other instanceof mat3) {
      let res = new mat3();
      for (let i = 0; i < 3; i ++) {
        for (let j = 0; j < 3; j ++) {
          let sum = 0;
          for (let k = 0; k < 3; k ++) {
            sum += this[k][i] * other[j][k];
          }
          res[i][j] = sum;
        }
      }
      return res;
    } else if (other instanceof vec2) {
      let res = new vec3()
      other = new vec3(other, 1);
      for (let i = 0; i < 3; i ++) {
        let sum = 0;
        for (let k = 0; k < 3; k ++) {
          // console.log(`sum += this[${k}][${i}] * other[${k}]`);
          sum += this[k][i] * other[k];
        }
        // console.log(`res[${i}] = ${sum}`);
        res[i] = sum;
      }
      return new vec2(res.x, res.y);
    }

  }

  translate(a, b) {
    return this.mult(mat3.translation(a, b));
  }

  scale(a, b) {
    return this.mult(mat3.scale(a, b));

  }

  rotate(angle) {
    return this.mult(mat3.rotation(angle));
  }

  static translation(a, b){
    if (a instanceof vec2) {
      return new mat3(
        new vec3(1,0,a.x),
        new vec3(0,1,a.y),
        new vec3(0,0,1)
      )
    } else {
      return new mat3(
        new vec3(1,0,a),
        new vec3(0,1,b),
        new vec3(0,0, 1)
      )
    }
  }

  static scale(a, b){
    if (a instanceof vec2) {
      return new mat3(
        new vec3(a.x,0,0),
        new vec3(0,a.y,0),
        new vec3(0, 0, 1)
      )
    } else {
      return new mat3(
        new vec3(a,0,0),
        new vec3(0,b,0),
        new vec3(0,0, 1)
      )
    }
  }

  static rotation(angle) {
    return new mat3(
      new vec3(Math.cos(angle),Math.sin(angle),0),
      new vec3(-Math.sin(angle),Math.cos(angle),0),
      new vec3(0,0, 1)
    )
  }

  toString(){
    return `mat3(${this[0][0]}, ${this[1][0]}, ${this[2][0]}\n     ${this[0][1]}, ${this[1][1]}, ${this[2][1]}\n     ${this[0][2]}, ${this[1][2]}, ${this[2][2]})`
  }
}

class mat4 {
  constructor(a, b, c, d) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 16);
      this.buffer = this.float32.buffer;
    } else {
      // //console.trace("Allocating new memory");
      this.float32 = new Float32Array(16);
      this.buffer = this.float32.buffer;
    }
    this._0 = new vec4(this.buffer, this.float32.byteOffset);
    this._1 = new vec4(this.buffer, this.float32.byteOffset + vec4.size);
    this._2 = new vec4(this.buffer, this.float32.byteOffset + vec4.size * 2);
    this._3 = new vec4(this.buffer, this.float32.byteOffset + vec4.size * 3);
    if (typeof a == 'number') {
      // this._0 = new vec4(0,0,0,a);
      // this._1 = new vec4(0,0,a,0);
      // this._2 = new vec4(0,a,0,0);
      // this._3 = new vec4(a,0,0,0);
      this._0.x = a;
      this._1.y = a;
      this._2.z = a;
      this._3.w = a;
    } else if (a instanceof vec4) {
      // this._0 = new vec4(a.x,a.y,a.z,a.w);
      // this._1 = new vec4(b.x,b.y,b.z,b.w);
      // this._2 = new vec4(c.x,c.y,c.z,c.w);
      // this._3 = new vec4(d.x,d.y,d.z,d.w);
      this[0] = a;
      this[1] = b;
      this[2] = c;
      this[3] = d;
    }
  }

  swapMemory(buffer, offset) {
    this.float32 = new Float32Array(buffer, offset, 16);
    this.buffer = this.float32.buffer;
    this._0.swapMemory(buffer, offset);
    this._1.swapMemory(buffer, offset + vec4.size);
    this._2.swapMemory(buffer, offset + vec4.size * 2);
    this._3.swapMemory(buffer, offset + vec4.size * 3);
  }

  get 0() {
    return this._0;
  }

  get 1() {
    return this._1;
  }

  get 2() {
    return this._2;
  }

  get 3() {
    return this._3;
  }

  set 0(val) {
    this._0.x = val.x;
    this._0.y = val.y;
    this._0.z = val.z;
    this._0.w = val.w;
  }

  set 1(val) {
    this._1.x = val.x;
    this._1.y = val.y;
    this._1.z = val.z;
    this._1.w = val.w;
  }

  set 2(val) {
    this._2.x = val.x;
    this._2.y = val.y;
    this._2.z = val.z;
    this._2.w = val.w;
  }

  set 3(val) {
    this._3.x = val.x;
    this._3.y = val.y;
    this._3.z = val.z;
    this._3.w = val.w;
  }

  mult(other) {
    if (other instanceof mat4) {
      let res = new mat4();
      for (let i = 0; i < 4; i ++) {
        for (let j = 0; j < 4; j ++) {
          let sum = 0;
          for (let k = 0; k < 4; k ++) {
            sum += this[k][i] * other[j][k];
          }
          res[j][i] = sum;
        }
      }
      return res;
    } else if (other instanceof vec3) {
      let res = new vec4()
      for (let i = 0; i < 4; i ++) {
        let sum = 0;
        for (let k = 0; k < 4; k ++) {
          sum += this[k][i] * other[k];
        }
        res[i] = sum;
      }
      return new vec3(res.x, res.y, res.z);
    }

  }

  toQuat(){
    let w = 0.5 * Math.sqrt(1 + this[0][0] + this[1][1] + this[2][2]);
    let x = (this[1][2]-this[2][1]) / (4 * w);
    let y = (this[2][0]-this[0][2]) / (4 * w);
    let z = (this[0][1]-this[1][0]) / (4 * w);
    return new quat(x, y, z, w);
  }

  static lookAt(eye, center, up){
    // let z = eye.sub(center);
    // z = z.normalised();
    // let y = up;
    // let x = y.cross(z);
    // y = z.cross(x);
    // x = x.normalised();
    // y = y.normalised();
    //
    // console.log(x, y, z);
    //
    // return new mat4(new vec4(x, -x.dot(eye)),
    //                 new vec4(y, -y.dot(eye)),
    //                 new vec4(z, -z.dot(eye)),
    //                 new vec4(0,0,0,1));

    let f = center.sub(eye).normalised();
    let s = f.cross(up).normalised();
    let u = s.cross(f);

    return new mat4(
      new vec4(s.x,u.x,-f.x,0),
      new vec4(s.y,u.y,-f.y,0),
      new vec4(s.z,u.z,-f.z,0),
      new vec4(-s.dot(eye),-u.dot(eye),f.dot(eye),1)
    )

  }

  transposed(){
    return new mat4(
      new vec4(this[0][0], this[1][0], this[2][0], this[3][0]),
      new vec4(this[0][1], this[1][1], this[2][1], this[3][1]),
      new vec4(this[0][2], this[1][2], this[2][2], this[3][2]),
      new vec4(this[0][3], this[1][3], this[2][3], this[3][3]),
    )
  }

  static perspective(fov, aspect, near, far){
    let tanHalfFov = Math.tan(toRadians(fov/2));
    let zRange = far - near;
    return new mat4(
      new vec4(1/(tanHalfFov * aspect), 0            , 0                       , 0  ),
      new vec4(0                       , 1/tanHalfFov, 0                       , 0  ),
      new vec4(0                       , 0           , -(far + near) / zRange  , -1 ),
      new vec4(0                       , 0           , -2 * far * near / zRange, 0  )
    )
  }

  static orthographic(top, bottom, left, right, near, far) {
    return new mat4(
      new vec4(2/(right-left),0,0,-(right + left)/(right / left)),
      new vec4(0,2/(top - bottom),0,-(top + bottom) / (top - bottom)),
      new vec4(0,0,2/(far-near),-(far+near)/(far-near)),
      new vec4(0,0,0,1)
    )
  }

  static get size(){
    return 4 * vec4.size;
  }
}

class cvec {
  constructor(type, length) {
    if (type instanceof ArrayBuffer) {
      if (type.byteLength % length.size !== 0) throw new RangeError("cvec: Initialisation over existing ArrayBuffer requires ArrayBuffer to have a byteLength that is an integer multiple of type.size")
      this.buffer = type;
      this.type = length;
      this.length = this.buffer.byteLength / this.type.size;
    } else {
      this.buffer = new ArrayBuffer(length * type.size);
      this.length = length;
      this.type = type;
    }
    for (let i = 0; i < this.length; i ++) {
      this[i] = new this.type(this.buffer, i * this.type.size);
    }
  }

  get byteLength(){
    return this.type.size * this.length;
  }

  resize(length) {
    if (length instanceof ArrayBuffer) {
      if (length.byteLength % this.type.size !== 0) throw new RangeError("cvec: Initialisation over existing ArrayBuffer requires ArrayBuffer to have a byteLength that is an integer multiple of type.size")
      this.buffer = length;
      // this.type = length;
      let oldLength = this.length;
      this.length = this.buffer.byteLength / this.type.size;
      let intersectLength = Math.min(this.length, oldLength);
      for (let i = 0; i < intersectLength; i ++) {
        this[i].swapMemory(this.buffer, i * this.type.size);
        // newBuffer[i] = oldBuffer[i];
      }
      let toCreate = this.length - intersectLength;
      for (let i = 0; i < toCreate; i ++) {
        this[intersectLength + i] = new this.type(this.buffer, (intersectLength + i) * this.type.size);
      }
    } else if (this.length != length) {
      let oldBuffer = new Uint8Array(this.buffer);
      this.buffer = new ArrayBuffer(this.type.size * length);
      let intersectLength = Math.min(this.length, length);
      let newBuffer = new Uint8Array(this.buffer);
      for (let i = 0; i < intersectLength; i ++) {
        newBuffer.set(new Uint8Array(oldBuffer.buffer, this.type.size), i * this.type.size);
        this[i].swapMemory(newBuffer.buffer, i * this.type.size);
        // newBuffer[i] = oldBuffer[i];
      }
      let toCreate = length - intersectLength;
      for (let i = 0; i < toCreate; i ++) {
        this[intersectLength + i] = new this.type(this.buffer, (intersectLength + i) * this.type.size);
      }
      this.length = length;
    }
  }

  *[Symbol.iterator](){
    for (let i = 0; i < this.length; i ++) {
      yield this[i];
    }
    return null;
  }

  data(){
    return new Uint8Array(this.buffer);
  }


}

class Vertex {
  constructor(pos, color) {
    if (pos instanceof ArrayBuffer) {
      this.float32 = new Float32Array(pos, color, 7);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Float32Array(7);
      this.buffer = float32.buffer;
    }
    this._pos = new vec3(this.buffer, this.float32.byteOffset);
    this._color = new vec4(this.buffer, this.float32.byteOffset + vec3.size);
  }

  swapMemory(buffer, offset){
    this.float32 = new Float32Array(buffer, offset, 7);
    this.buffer = buffer;
    this._pos.swapMemory(buffer, offset);
    this._color.swapMemory(buffer, offset + vec3.size);
  }

  get pos(){
    return this._pos;
  }

  set pos(pos) {
    this._pos.x = pos.x;
    this._pos.y = pos.y;
    this._pos.z = pos.z;
  }

  get color(){
    return this._color;
  }

  set color(color) {
    this._color.x = color.x;
    this._color.y = color.y;
    this._color.z = color.z;
    this._color.w = color.w;
  }

  static get size(){
    return vec3.size + vec4.size;
  }

  static getBindingDescription(){
    let bindingDescription = new VkVertexInputBindingDescription();
    bindingDescription.binding = 0;
    bindingDescription.stride = Vertex.size;
    bindingDescription.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
    return bindingDescription;
  }

  static getAttributeDescriptions(){
    let attributeDescriptions = STDVector(VkVertexInputAttributeDescription, 2);

    attributeDescriptions[0].binding = 0;
    attributeDescriptions[0].location = 0;
    attributeDescriptions[0].format = VK_FORMAT_R32G32B32_SFLOAT;
    attributeDescriptions[0].offset = 0;

    attributeDescriptions[1].binding = 0;
    attributeDescriptions[1].location = 1;
    attributeDescriptions[1].format = VK_FORMAT_R32G32B32A32_SFLOAT;
    attributeDescriptions[1].offset = vec3.size;

    return attributeDescriptions;
  }
}

class DrawCommandData {
  constructor(a, b, c, d, e) {
    if (a instanceof ArrayBuffer) {
      this.uint32 = new Uint32Array(a, b, 5);
      this.buffer = this.uint32.buffer;
      this.int32 = new Int32Array(a, b, 5);
    } else {
      this.uint32 = new Uint32Array(5);
      this.buffer = this.uint32.buffer;
      this.int32 = new Int32Array(this.buffer, 0, 5);
      this.indexCount = a;
      this.instanceCount = b;
      this.firstIndex = c;
      this.vertexOffset = d;
      this.firstInstance = e;
    }
  }

  get indexCount(){
    return this.uint32[0];
  }

  set indexCount(val){
    this.uint32[0] = val;
  }

  get instanceCount(){
    return this.uint32[1];
  }

  set instanceCount(val){
    this.uint32[1] = val;
  }

  get firstIndex(){
    return this.uint32[2];
  }

  set firstIndex(val){
    this.uint32[2] = val;
  }

  get vertexOffset(){
    return this.int32[3];
  }

  set vertexOffset(val){
    this.int32[3] = val;
  }

  get firstInstance(){
    return this.uint32[4];
  }

  set firstInstance(val){
    this.uint32[4] = val;
  }

  swapMemory(buffer, offset) {
    this.uint32 = new Uint32Array(buffer, offset, 5);
    this.int32 = new Int32Array(buffer, offset, 5);
    this.buffer = buffer;
  }

  static get size(){
    return 20;
  }
}

class UniformBufferObject {
  constructor(a, b, c) {
    if (a instanceof ArrayBuffer) {
      this.float32 = new Float32Array(a, b, 48);
      this.buffer = this.float32.buffer;
    } else {
      this.float32 = new Float32Array(48);
      this.buffer = this.float32.buffer;
    }

    this._model = new mat4(this.buffer);
    this._view = new mat4(this.buffer, mat4.size);
    this._proj = new mat4(this.buffer, mat4.size * 2);
  }

  get model(){
    return this._model;
  }

  get view(){
    return this._view;
  }

  get proj(){
    return this._proj;
  }

  set model(val) {
    this._model[0] = val[0];
    this._model[1] = val[1];
    this._model[2] = val[2];
    this._model[3] = val[3];
  }

  set view(val) {
    this._view[0] = val[0];
    this._view[1] = val[1];
    this._view[2] = val[2];
    this._view[3] = val[3];
  }

  set proj(val) {
    this._proj[0] = val[0];
    this._proj[1] = val[1];
    this._proj[2] = val[2];
    this._proj[3] = val[3];
  }

  static get size(){
    return 3 * mat4.size;
  }
}


module.exports = {lerp, vec2, vec3, vec4, quat, mat3, mat4, Vertex, cvec, UniformBufferObject, DrawCommandData};
