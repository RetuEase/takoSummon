export class Tako {
  constructor(id, age = 1) {
    this.id = id;
    this.age = age;
    this.#judge();
  }

  #judge() {
    this.child = this.age < 2;
    this.old = this.age > 4;
    this.dead = this.age > 7;
  }

  older() {
    this.age++;
    this.#judge();
  }
}
