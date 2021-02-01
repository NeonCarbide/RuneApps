SEC = 1000;
MIN = SEC * 60;
HOUR = MIN * 60;
DAY = HOUR * 24;

timers = [];

window.addEventListener('beforeunload', saveData)

function start() {
  alt1.identifyAppUrl('appconfig.json');
  loadData();
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
  t = (h * 60 * 60 + m * 60 + s) * 1000;

  return { name: elid('name').value, hrs: h, min: m, sec: s, total: t };
}

function writeTime(data) {
  time = {
    h: data.h,
    m: data.m,
    s: data.s,
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
    html += '<div class="nisbutton2 control" id="start" onclick="startTimer(' + i + ')">Start</div>';
    html += '<div class="nisbutton2 control" id="pause" onclick="pauseTimer(' + i + ')">Pause</div>';
    html += '<div class="nisbutton2 control" id="reset" onclick="resetTimer(' + i + ')">Reset</div>';
    html +=
      '<div class="nisbutton2 control" onclick="removeTimer(' +
      i +
      ')">X</div>';
    html += '</div></div>';
    html += '<div class="nisseperator"></div>';
  }

  elid('timers').innerHTML = html;
}

function addTimer() {
  data = readIn();

  timers.push({
    name: data.name,
    hrs: data.hrs,
    h: data.hrs,
    min: data.min,
    m: data.min,
    sec: data.sec,
    s: data.sec,
    total: data.total,
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
  timers[index].start = Date.now();
  timers[index].end = timers[index].start + timers[index].total;
  drawTimers();
  scheduleTick(index);
}

function pauseTimer(index) {
  stopTick(index);
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
  elid('start').innerHTML = 'Start';
  drawTimers();
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
      console.log(timers[i].count)
      console.log(writeTime(timers[i]))
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
}

function scheduleTick(index) {
  stopTick(index);

  if (timers[index].start != null) {
    timers[index].interval = setInterval(tickTimers, 50);
  }
}

function saveData() {
  obj = [];

  for (var i = 0; i < timers.length; i ++) {
    obj.push(timers[i])
  }

  localStorage.gen_timers = JSON.stringify(obj);
}

function loadData() {
  timers = []

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

function startButton(index) {
  if (!timers[index].start) {
    startTimer(index);
  } else {
    pauseTimer(index);
  }
}