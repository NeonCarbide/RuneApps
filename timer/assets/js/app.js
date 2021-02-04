SEC = 1000;
MIN = SEC * 60;
HOUR = MIN * 60;
DAY = HOUR * 24;

alertSound = new Audio('assets/audio/pop.wav');

settings = {
  timerDoneColour: '#32CD32',
  timerRunningColour: '#FFD700',
  enableSoundAlert: false,
  alertVolume: 0.5,
  enableIconOverlay: true,
  iconSize: 48,
  iconColour: '#F0F000',
};

delay = 1050;
tick = 1000;
showIcon = false;
iconTimeout = null;
timers = [];

window.addEventListener('beforeunload', saveData);
window.addEventListener('mouseover', clearIcon);

function start() {
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

function elid(id) {
  return document.getElementById(id);
}

function pad(n, width) {
  n = n + '';

  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function clearField(field) {
  elid(field).value = '';
}

function readIn() {
  h = elid('hrs').value || 0;
  m = elid('min').value || 0;
  s = elid('sec').value || 0;
  t = h * HOUR + m * MIN + s * SEC;

  return { name: elid('name').value, hrs: h, min: m, sec: s, total: t };
}

function writeTime(input) {
  time = {
    h: 0,
    m: 0,
    s: 0,
  };

  if (input.h > 0) {
    time.h = input.h;
  }

  if (input.m > 0) {
    time.m = input.m;
  }

  if (input.s > 0) {
    time.s = input.s;
  }

  return pad(time.h, 2) + ':' + pad(time.m, 2) + ':' + pad(time.s, 2);
}

function drawTimers() {
  html = '';

  for (var i = 0; i < timers.length; i++) {
    str = '';

    if (timers[i].done || isTimerDone(i)) {
      str += ' done';
    } else if (timers[i].interval) {
      str += ' running';
    }

    str += '">';
    str += writeTime(timers[i]);

    html += '<div id="timer-' + i + '" class="timer">';
    html += '<div class="nistext time' + str + '</div>';
    html += '<div class="nistext name">' + timers[i].name + '</div>';
    html += '<div class="buttons">';
    html +=
      '<div class="nisbutton2 control" id="start" onclick="startTimer(' +
      i +
      ')">Start</div>';
    html +=
      '<div class="nisbutton2 control" id="pause" onclick="pauseTimer(' +
      i +
      ')">Pause</div>';
    html +=
      '<div class="nisbutton2 control" id="reset" onclick="resetTimer(' +
      i +
      ')">Reset</div>';
    html +=
      '<div class="nisbutton2 control" onclick="removeTimer(' +
      i +
      ')">X</div>';
    html += '</div></div>';
  }

  elid('timers').innerHTML = html;
}

function addTimer() {
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

function removeTimer(index) {
  stopTick(index);
  timers.splice(index, 1);
  drawTimers();
}

function startTimer(index) {
  if (!timers[index].start) {
    timers[index].start = Date.now();
  }

  timers[index].end = timers[index].start + timers[index].total;

  scheduleTick(index);
  drawTimers();
}

function pauseTimer(index) {
  stopTick(index);
  drawTimers();
}

function pauseAllTimers() {
  for (var i = 0; i < timers.length; i++) {
    stopTick(i);
  }

  drawTimers();
}

function resetTimer(index) {
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

function resetAllTimers() {
  for (var i = 0; i < timers.length; i++) {
    if (timers[i].start) {
      resetTimer(i);
    }
  }
}

function tickTimers() {
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

function stopTick(index) {
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

function scheduleTick(index) {
  stopTick(index);

  if (timers[index].start != null) {
    timers[index].interval = setInterval(tickTimers, 1000);
  }
}

function clearIcon() {
  clearTimeout(iconTimeout);
  showIcon = false;
}

function iconTick() {
  if (settings.enableIconOverlay) {
    iconTimeout = setTimeout(function () {
      checkTimers();
      iconTick();
    }, tick);
  }
}

function checkTimers() {
  for (var i = 0; i < timers.length; i++) {
    if (anyTimerDone()) {
      showIcon = true;
      break;
    }
  }

  if (showIcon) {
    overlayNotify();
  }
}

function soundNotify() {
  if (window.alt1 && settings.enableSoundAlert) {
    alertSound.volume = settings.alertVolume / 100;
    alertSound.play();
  }
}

function overlayNotify() {
  if (window.alt1 && settings.enableIconOverlay) {
    text = '\u23F0';
    h = alt1.rsHeight;
    w = alt1.rsWidth;
    x = settings.iconSize;
    y = parseInt(h / 2 - settings.iconSize / 2);
    colour = parseInt('0xFF' + getColourFromString(settings.iconColour));

    alt1.overLayText(text, colour, settings.iconSize, x, y, delay);
  }
}

function getColourFromString(colour) {
  var checkHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colour);

  if (checkHex) {
    return colour.substring(1);
  }

  return false;
}

function getTextColourRelativeToBG(colour) {
  hex = getColourFromString(colour);

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(function (h) {
        return h + h;
      })
      .join('');
  }

  r = parseInt(hex.substring(0, 2), 16);
  g = parseInt(hex.substring(2, 2), 16);
  b = parseInt(hex.substring(4, 2), 16);

  yiq = (r * 299 + g * 587 + b * 114) / 1000;

  if (yiq >= 128) {
    return 'black';
  }

  return 'white';
}

function saveData() {
  obj = [];

  for (var i = 0; i < timers.length; i++) {
    stopTick(i);
    obj.push(timers[i]);
  }

  localStorage.gen_timers = JSON.stringify(obj);
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

function enterKeyPress(event) {
  if (event.keyCode === 13) {
    elid('add-timer').click();
  }
}

function settingsMenu() {
  data = [];

  doneStyle = '';
  doneStyle += 'background-color: ' + settings.timerDoneColour + '; ';
  doneStyle += 'color: ' + getTextColourRelativeToBG(settings.timerDoneColour) + ';';

  runningStyle = '';
  runningStyle += 'background-color: ' + settings.timerRunningColour;
  runningStyle +=
    'color: ' + getTextColourRelativeToBG(settings.timerRunningColour);

  data.push({ t: 'h/11' });
  data.push({ t: 'text', text: 'Done HEX Colour Code' });
  data.push({
    t: 'string:doneColour',
    v: settings.timerDoneColour,
    style: doneStyle,
  });
  data.push({ t: 'h/11' });
  data.push({ t: 'text', text: 'Running HEX Colour Code' });
  data.push({
    t: 'string:runningColour',
    v: settings.timerRunningColour,
    style: runningStyle,
  });

  data.push({
    t: 'bool:soundEnable',
    v: settings.enableSoundAlert,
    text: 'Enable Sound Alert',
  });

  if (settings.enableSoundAlert) {
    data.push({ t: 'h/11' });
    data.push({ t: 'text', text: 'Alert Volume' });
    data.push({ t: 'int:alertVolume', v: settings.alertVolume });
  }

  data.push({
    t: 'bool:iconEnable',
    v: settings.enableIconOverlay,
    text: 'Enable Icon Overlay',
  });

  if (settings.enableIconOverlay) {
    data.push({ t: 'h/11' });
    data.push({ t: 'text', text: 'Icon Font Size' });
    data.push({ t: 'int:iconSize', v: settings.iconSize });
    data.push({ t: 'h/11' });
    data.push({ t: 'text', text: 'Icon HEX Colour Code' });
    data.push({ t: 'string:iconColour', v: settings.iconColour });
  }

  data.push({ t: 'h/11' });
  data.push({ t: 'button:confirm', text: 'Confirm' });
  data.push({ t: 'button:cancel', text: 'Cancel' });

  try {
    menu = promptbox2(
      {
        title: 'Settings',
        style: 'popup',
        width: 290,
        stylesheets: [
          'assets/css/settings.css',
          'https://runeapps.org/nis/nis.css',
        ],
      },
      data
    );

    menu.cancel.onclick = menu.frame.close.b();
    menu.confirm.onclick = function () {
      settings.timerDoneColour = menu.doneColour.getValue();
      settings.timerRunningColour = menu.runningColour.getValue();

      document.documentElement.style.setProperty(
        '--colour-timer-done',
        settings.timerDoneColour
      );
      document.documentElement.style.setProperty(
        '--colour-timer-running',
        settings.timerRunningColour
      );

      settings.enableSoundAlert = menu.soundEnable.getValue();

      if (menu.alertVolume) {
        menu.alertVolume.min = 0;
        menu.alertVolume.max = 100;
        settings.alertVolume = menu.alertVolume.getValue();
      }

      settings.enableIconOverlay = menu.iconEnable.getValue();

      if (menu.iconSize) {
        settings.iconSize = menu.iconSize.getValue();
      }

      if (menu.iconColour) {
        settings.iconColour = menu.iconColour.getValue();
      }

      saveSettings();
      menu.frame.close();
    };
  } catch (e) {
    console.log(e);
  }
}

function saveSettings() {
  localStorage.gen_timers_config = JSON.stringify(settings);
}

function loadSettings() {
  if (localStorage.gen_timers_config) {
    userSettings = JSON.parse(localStorage.gen_timers_config);
    settings = Object.assign(settings, userSettings);
  }
}

function isTimerDone(index) {
  if (timers[index].count && timers[index].count <= 0) {
    return true;
  }

  return false;
}

function anyTimerDone() {
  for (var i = 0; i < timers.length; i++) {
    if (isTimerDone(i)) {
      return true;
    }
  }

  return false;
}
