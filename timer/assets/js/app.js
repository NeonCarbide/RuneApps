import { iconTick, soundNotify } from './notify';
import { loadSettings } from './settings';
import {
  SEC,
  MIN,
  HOUR,
  DAY,
  clearField,
  elid,
  isTimerDone,
  loadData,
  readIn,
  saveData,
  writeTime,
} from './util';

export var settings = {
  timerDoneColour: '#32CD32',
  timerRunningColour: '#FFD700',
  enableSoundAlert: false,
  alertVolume: 0.5,
  enableIconOverlay: true,
  iconSize: 48,
  iconColour: '#F0F000',
};

export var timers = [];

window.addEventListener('beforeunload', saveData);

export function start() {
  try {
    alt1.identifyAppUrl('appconfig.json');
    loadData();
    loadSettings();
  } catch (e) {
    console.log('Alt1 not found');
  }

  for (var i = 0; i < timers.length; i++) {
    if (timers[i].start) {
      if (Date.now() > timers[i].end) {
        timers[i].count = -1;
      }
    }
  }

  drawTimers();
}

export function drawTimers() {
  html = '';

  for (var i = 0; i < timers.length; i++) {
    str = '';

    str += timers[i].done || isTimerDone(i) ? ' done' : '';
    str += timers[i].interval ? ' running' : '';
    str += `">${writeTime(timers[i])}`;

    html += `<div id="timer-${i}" class="timer">`;
    html += `<div class="nistext time${str}</div>`;
    html += `<div class="nistext name">${timers[i].name}</div>`;
    html += '<div class="buttons">';
    html += `<div class="nisbutton2 control" id="start" onclick="startTimer(${i})">Start</div>`;
    html += `<div class="nisbutton2 control" id="pause" onclick="pauseTimer(${i})">Pause</div>`;
    html += `<div class="nisbutton2 control" id="reset" onclick="resetTimer(${i})">Reset</div>`;
    html += `<div class="nisbutton2 control" onclick="removeTimer(${i})">X</div>`;
    html += '</div></div>';
  }

  elid('timers').innerHTML = html;
}

export function addTimer() {
  input = readIn();

  timers.push({
    name: input.name,
    hrs: input.hrs,
    h: input.hrs,
    min: input.min,
    m: input.min,
    sec: input.sec,
    s: input.sec,
    total: input.total,
    done: false,
    start: null,
    end: null,
    count: null,
    interval: null,
  });

  clearField('name');
  clearField('hrs');
  clearField('min');
  clearField('sec');

  drawTimers();
}

export function pauseAllTimers() {
  for (var i = 0; i < timers.length; i++) {
    stopTick(i);
  }

  drawTimers();
}

export function pauseTimer(index) {
  stopTick(index);
  drawTimers();
}

export function removeTimer(index) {
  stopTick(index);
  timers.splice(index, 1);
  drawTimers();
}

export function resetAllTimers() {
  for (var i = 0; i < timers.length; i++) {
    if (timers[i].start) {
      resetTimer(i);
    }
  }
}

export function resetTimer(index) {
  stopTick(index);
  timers[index].h = timers[index].hrs;
  timers[index].m = timers[index].min;
  timers[index].s = timers[index].sec;
  timers[index].done = false;
  timers[index].start = null;
  timers[index].end = null;
  timers[index].count = null;
  drawTimers();
}

export function scheduleTick(index) {
  stopTick(index);

  if (timers[index].start != null) {
    timers[index].interval = setInterval(tickTimers, 1000);
  }
}

export function startTimer(index) {
  if (!timers[index].start) {
    timers[index].start = Date.now();
  }

  timers[index].end = timers[index].start + timers[index].total;

  scheduleTick(index);
  drawTimers();
}

export function stopTick(index) {
  if (!timers[index].interval) {
    return;
  }

  clearInterval(timers[index].interval);

  timers[index].interval = null;

  if (isTimerDone(index)) {
    timers[index].done = true;

    soundNotify();
    iconTick();
  }
}

export function tickTimers() {
  for (var i = 0; i < timers.length; i++) {
    if (isTimerDone(i)) {
      stopTick(i);
      continue;
    }
    if (timers[i].start) {
      timers[i].count = timers[i].end - Date.now();
      timers[i].h = Math.floor((timers[i].count % DAY) / HOUR);
      timers[i].m = Math.floor((timers[i].count % HOUR) / MIN);
      timers[i].s = Math.floor((timers[i].count % MIN) / SEC);
    }
  }
  drawTimers();
}
