import { stopTick } from './app';

const SEC = 1000;
const MIN = SEC * 60;
const HOUR = MIN * 60;
const DAY = HOUR * 24;

function anyTimerDone() {
  for (var i = 0; i < timers.length; i++) {
    if (isTimerDone(i)) {
      return true;
    }
  }

  return false;
}

function clearField(field) {
  elid(field).value = '';
}

function createUserInput(id, value, meta) {
  if (['string', 'int', 'number', 'color', 'slider'].indexOf(meta.t) != -1) {
    if (meta.style) {
      return [
        { t: 'h/11' },
        { t: meta.n },
        { t: `${meta.t}:${id}`, v: value, style: meta.style },
      ];
    }

    return [{ t: 'h/11' }, { t: meta.n }, { t: `${meta.t}:${id}`, v: value }];
  } else if (meta.t == 'dropdown') {
    return [
      { t: 'h/11' },
      { t: meta.n },
      {
        t: `dropdown:${id}`,
        options: meta.options || meta.getOptions(),
        v: value,
      },
    ];
  } else if (meta.t == 'bool') {
    return [{ t: `bool:${id}`, v: value, text: meta.n }];
  }
}

function elid(id) {
  return document.getElementById(id);
}

function enterKeyPress(event) {
  if (event.keyCode === 13) {
    elid('add-timer').click();
  }
}

function getHexFromString(colour) {
  var checkHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colour);

  if (checkHex) {
    return colour.substring(1);
  }

  return false;
}

function getRGBFromHex(colour) {
  hex = getHexFromString(colour);

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(function (h) {
        return h + h;
      })
      .join('');
  }

  r = parseInt(hex.substr(0, 2), 16);
  g = parseInt(hex.substr(2, 2), 16);
  b = parseInt(hex.substr(4, 2), 16);

  return [r, g, b];
}

function getInverseColour(colour) {
  rgb = getRGBFromHex(colour);
  rI = Math.floor((255 - rgb[0]) * 1);
  gI = Math.floor((255 - rgb[1]) * 1);
  bI = Math.floor((255 - rgb[2]) * 1);

  return `rgb(${rI}, ${gI}, ${bI})`;
}

function getTextColourRelativeToBG(colour) {
  rgb = getRGBFromHex(colour);
  yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;

  if (yiq > 125) {
    return 'black';
  }

  return 'white';
}

function isTimerDone(index) {
  return timers[index].count && timers[index].count <= 0 ? true : false;
}

function loadData() {
  timers = [];

  if (!localStorage.gen_timers) {
    return;
  }

  try {
    obj = JSON.parse(localStorage.gen_timers);
  } catch (e) {
    return;
  }

  for (var i = 0; i < obj.length; i++) {
    timers.push({
      name: obj[i].name,
      hrs: obj[i].hrs,
      h: obj[i].h,
      min: obj[i].min,
      m: obj[i].m,
      sec: obj[i].sec,
      s: obj[i].s,
      total: obj[i].total,
      start: obj[i].start,
      end: obj[i].end,
      count: obj[i].count,
      interval: obj[i].interval,
    });
  }
}

function pad(n, width) {
  n = n + '';

  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function readIn() {
  h = elid('hrs').value || 0;
  m = elid('min').value || 0;
  s = elid('sec').value || 0;
  t = h * HOUR + m * MIN + s * SEC;

  return { name: elid('name').value, hrs: h, min: m, sec: s, total: t };
}

function saveData() {
  obj = [];

  for (var i = 0; i < timers.length; i++) {
    stopTick(i);
    obj.push(timers[i]);
  }

  localStorage.gen_timers = JSON.stringify(obj);
}

function writeTime(input) {
  time = {
    h: input.h > 0 ? input.h : 0,
    m: input.m > 0 ? input.m : 0,
    s: input.s > 0 ? input.s : 0,
  };

  return `${pad(time.h, 2)}:${pad(time.m, 2)}:${pad(time.s, 2)}`;
}

export {
  SEC,
  MIN,
  HOUR,
  DAY,
  anyTimerDone,
  clearField,
  createUserInput,
  elid,
  enterKeyPress,
  getHexFromString,
  getRGBFromHex,
  getInverseColour,
  getTextColourRelativeToBG,
  isTimerDone,
  loadData,
  pad,
  readIn,
  saveData,
  writeTime,
};
