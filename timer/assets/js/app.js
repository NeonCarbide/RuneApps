SEC = 1000;
MIN = SEC * 60;
HOUR = MIN * 60;
DAY = HOUR * 24;

alertSound = new Audio('assets/audio/pop.wav');

settings = {
  enableSoundAlert: false,
  alertVolume: 0.5,
  enableIconOverlay: true,
  iconSize: 32,
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
    h: input.h,
    m: input.m,
    s: input.s,
  };

  return pad(time.h, 2) + ':' + pad(time.m, 2) + ':' + pad(time.s, 2);
}

function drawTimers() {
  html = '';

  for (var i = 0; i < timers.length; i++) {
    html += '<div id="timer-' + i + '" class="timer">';
    if (timers[i].count && timers[i].count <= 0) {
      html += '<div class="nistext time" style="color: limegreen;">DONE</div>';
    } else {
      html += '<div class="nistext time">' + writeTime(timers[i]) + '</div>';
    }
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
    if (timers[i].count && timers[i].count <= 0) {
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
  iconTick();
  toastNotify(index);
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
    if (timers[i].count && timers[i].count <= 0) {
      showIcon = true;
    }
  }

  if (showIcon) {
    overlayNotify();
  }
}

function soundNotify() {
  if (window.alt1 && settings.enableSoundAlert) {
    alertSound.volume = settngs.alertVolume;
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

function toastNotify(index) {
  try {
    if (!window.alt1) {
      if (!('Notification' in window)) {
        alert('Error: Browser does not support toast notifications');
      } else if (Notification.permission === 'granted') {
        return toast(index);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          if (permission === 'granted') {
            return toast(index);
          }
        });
      }
    }
  } catch (e) {
    console.log('Something went wrong...');
  }
}

function getColourFromString(colour) {
  var checkHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colour);

  if (checkHex) {
    return colour.substring(1);
  }

  return false;
}

function toast(index) {
  return new Notification('General Timers', {
    body: timers[index].name + ' : Done',
    icon: 'icon.png',
  });
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

  data.push({
    t: 'bool:soundEnable',
    v: settings.enableSoundAlert,
    text: 'Enable Sound Alert',
  });

  if (settings.enableSoundAlert) {
    data.push({ t: 'h/11' });
    data.push({ t: 'text', text: 'Alert Volume' });
    data.push({ t: 'slider:alertVolume', v: settings.alertVolume * 100 });
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
    data.push({ t: 'text', text: 'Icon Colour HEX Code' });
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
      settings.enableSoundAlert = menu.soundEnable.getValue();

      if (menu.alertVolume) {
        settings.alertVolume = menu.alertVolume.getValue() * 0.01;
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

function createUserInput(id, value, meta) {
  if (['string', 'int', 'number', 'color', 'slider'].indexOf(meta.t) != -1) {
    return [
      { t: 'h/11' },
      { t: 'text', text: meta.n },
      { t: meta.t, id: id, v: value },
    ];
  } else if (meta.t == 'dropdown') {
    return [
      { t: 'h/11' },
      { t: 'text', text: meta.n },
      {
        t: 'dropdown',
        id: id,
        options: meta.options || meta.getOptions(),
        v: value,
      },
    ];
  } else if (meta.t == 'bool') {
    return [{ t: 'bool', id: id, v: value, text: meta.n }];
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
