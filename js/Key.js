import create from './utils/page.js';

export default class Key {
  constructor({ small, shift, code }) {
    this.code = code;
    this.small = small;
    this.shift = shift;
    this.isFnKey = Boolean(
      small.match(
        /Ctrl|Arr|Alt|Shift|Tab|Backspace|Del|Enter|CapsLock|Meta|Menu|__/,
      ),
    );

    if (shift && shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/)) {
      this.sub = create('div', 'sub', this.shift);
    } else {
      this.sub = create('div', 'sub', '');
    }

    this.letter = create('div', 'letter', small);

    this.div = create(
      'div',
      'keyboard__key',
      [this.sub, this.letter],
      null,
      ['code', this.code],
      this.isFnKey ? ['fn', 'true'] : ['fn', 'false'], // стилизовать функциональные клавиши отдельно
    );
  }
}

// const keyB = new Key({})
// keyB.sub.innerHTML = '';
