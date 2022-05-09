import * as storage from './storage.js';
import create from './utils/page.js';
import language from './layouts/index.js'; // {en, ru}
import Key from './Key.js';

const main = create('main', '', [
  create('h1', 'title', 'RSS Virtual Keyboard'),
  create('h3', 'subtitle', 'Клавиатура создана в операционной системе Windows'),
  create(
    'p',
    'hint',
    'Для переключения языка используйте левые <kbd>Ctrl</kbd> + <kbd>Alt</kbd>',
  ),
]);

export default class Keyboard {
  constructor(rowsOrder) {
    this.rowsOrder = rowsOrder;
    this.keysPressed = {}; // this.keysPressed[ShiftLeft]...
    this.isCaps = false;
  }

  init(langCode) {
    // ru, en
    this.keyBase = language[langCode];
    this.output = create(
      'textarea',
      'output',
      null,
      main,
      ['placeholder', 'Начните печатать...'],
      ['rows', 5],
      ['cols', 50],
      ['spellcheck', false],
      ['autocorrect', 'off'],
    );
    this.container = create('div', 'keyboard', null, main, [
      'language',
      langCode,
    ]);
    document.body.prepend(main);
    return this;
  }

  generateLayout() {
    this.keyButtons = []; // Key()
    this.rowsOrder.forEach((row, i) => {
      const rowElement = create('div', 'keyboard__row', null, this.container, [
        'row',
        i + 1,
      ]);
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.div);
        }
      });
    });

    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    this.container.onmousedown = this.preHandleEvent;
    this.container.onmouseup = this.preHandleEvent;
  }

  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const {
      dataset: { code },
    } = keyDiv; // const code = keyDiv.dataset.code;
    keyDiv.addEventListener('mouseleave', this.resetButtonState);
    this.handleEvent({ code, type: e.type });
  };

  resetButtonState = ({
    target: {
      dataset: { code },
    },
  }) => {
    const keyObj = this.keyButtons.find((key) => key.code === code);
    keyObj.div.classList.remove('active');
    keyObj.div.removeEventListener('mouseleave', this.resetButtonState);
  };

  handleEvent = (e) => {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;
    this.output.focus();

    if (type.match(/keydown|mousedown/)) {
      if (type.match(/key/)) e.preventDefault(); // e.shiftKey = false либо true

      if (code.match(/Shift/)) this.shiftKey = true;

      if (this.shiftKey) this.switchUpperCase(true);

      keyObj.div.classList.add('active');

      // Caps down
      if (code.match(/Caps/) && !this.isCaps) {
        this.isCaps = true;
        this.switchUpperCase(true);
      } else if (code.match(/Caps/) && this.isCaps) {
        this.isCaps = false;
        this.switchUpperCase(false);
        keyObj.div.classList.remove('active');
      }

      // switch language

      if (code.match(/Control/)) this.ctrlKey = true;
      if (code.match(/Alt/)) this.altKey = true;

      if (code.match(/Control/) && this.altKey) this.switchLanguage();
      if (code.match(/Alt/) && this.ctrlKey) this.switchLanguage();

      if (!this.isCaps) {
        this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printToOutput(
            keyObj,
            keyObj.sub.innerHTML ? keyObj.shift : keyObj.small,
          );
        } else {
          this.printToOutput(
            keyObj,
            !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small,
          );
        }
      }
      // release button
    } else if (type.match(/keyup|mouseup/)) {
      // keyObj.div.classList.remove("active");

      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchUpperCase(false);
      }

      if (code.match(/Control/)) this.ctrlKey = false;
      if (code.match(/Alt/)) this.altKey = false;

      if (!code.match(/Caps/)) keyObj.div.classList.remove('active');
    }
  };

  switchLanguage = () => {
    const langAbbr = Object.keys(language); // ['en', 'ru']
    let langIdx = langAbbr.indexOf(this.container.dataset.language); // 1
    this.keyBase =
      langIdx + 1 < langAbbr.length
        ? language[langAbbr[(langIdx += 1)]]
        : language[langAbbr[(langIdx -= langIdx)]];
    this.container.dataset.language = langAbbr[langIdx];
    storage.set('kbLang', langAbbr[langIdx]);

    this.keyButtons = this.keyButtons.map((button) => {
      const newButton = { ...button };

      const keyObj = this.keyBase.find((key) => key.code === button.code);
      if (!keyObj) {
        return newButton;
      }

      newButton.shift = keyObj.shift;
      newButton.small = keyObj.small;
      if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
        newButton.sub.innerHTML = keyObj.shift;
      } else {
        newButton.sub.innerHTML = '';
      }

      newButton.letter.innerHTML = keyObj.small;
      return newButton;
    });

    if (this.isCaps) {
      this.switchUpperCase(true);
    }
  };

  switchUpperCase(isTrue) {
    if (isTrue) {
      this.keyButtons.forEach((button) => {
        if (button.sub) {
          if (this.shiftKey) {
            button.sub.classList.add('sub-active');
            button.letter.classList.add('sub-inactive');
          }
        }

        if (
          !button.isFnKey &&
          this.isCaps &&
          !this.shiftKey &&
          !button.sub.innerHTML
        ) {
          button.letter.innerHTML = button.shift;
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
          button.letter.innerHTML = button.small;
        } else if (!button.isFnKey && !button.sub.innerHTML) {
          button.letter.innerHTML = button.shift;
        }
      });
    } else {
      this.keyButtons.forEach((button) => {
        if (button.sub.innerHTML && !button.isFnKey) {
          button.sub.classList.remove('sub-active');
          button.letter.classList.remove('sub-inactive');

          if (!this.isCaps) {
            button.letter.innerHTML = button.small;
          } else if (!this.isCaps) {
            button.letter.innerHTML = button.shift;
          }
        } else if (!button.isFnKey) {
          if (this.isCaps) {
            button.letter.innerHTML = button.shift;
          } else {
            button.letter.innerHTML = button.small;
          }
        }
      });
    }
  }

  printToOutput(keyObj, symbol) {
    let cursourPos = this.output.selectionStart;
    const left = this.output.value.slice(0, cursourPos);
    const right = this.output.value.slice(cursourPos);

    const fnButtonsHandler = {
      Tab: () => {
        this.output.value = `${left}\t${right}`;
        cursourPos += 1;
      },
      ArrowLeft: () => {
        cursourPos = cursourPos - 1 >= 0 ? cursourPos - 1 : 0;
      },
      ArrowRight: () => {
        cursourPos += 1;
      },
      ArrowUp: () => {
        const positionFromLeft = this.output.value
          .slice(0, cursourPos)
          .match(/(\n).*$(?!\1)/g) || [[1]];
        cursourPos -= positionFromLeft[0].length;
      },
      ArrowDown: () => {
        const positionFromLeft = this.output.value
          .slice(cursourPos)
          .match(/^.*(\n).*(?!\1)/) || [[1]];
        cursourPos += positionFromLeft[0].length;
      },
      Enter: () => {
        this.output.value = `${left}\n${right}`;
        cursourPos += 1;
      },
      Delete: () => {
        this.output.value = `${left}${right.slice(1)}`;
      },
      Backspace: () => {
        this.output.value = `${left.slice(0, -1)}${right}`;
        cursourPos -= 1;
      },
      Space: () => {
        this.output.value = `${left} ${right}`;
        cursourPos += 1;
      },
    };

    if (fnButtonsHandler[keyObj.code]) fnButtonsHandler[keyObj.code]();
    else if (!keyObj.isFnKey) {
      cursourPos += 1;
      this.output.value = `${left}${symbol || ''}${right}`;
    }
    this.output.setSelectionRange(cursourPos, cursourPos);
  }
}
