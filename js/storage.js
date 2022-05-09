export function set(name, value) {
  window.localStorage.setItem(name, JSON.stringify(value));
}

// lang = get("kbLang", '"en"');

export function get(name, subst = null) {
  return JSON.parse(window.localStorage.getItem(name) || subst);
}

export function del(name) {
  window.localStorage.removeItem(name);
}

// import { } from "";
