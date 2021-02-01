timers = [];

function start() {
  alt1.identifyAppUrl('appconfig.json');
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
    h: data.hrs,
    m: data.min,
    s: data.sec,
  };

  return pad(time.h, 2) + ':' + pad(time.m, 2) + ':' + pad(time.s, 2);
}

function drawTimers() {
  html = '';

  for (var i = 0; i < timers.length; i++) {
    data = timers[i];

    html += '<div id="timer-' + i + '" class="timer">';
    html += '<div class="nistext time">' + writeTime(data) + '</div>';
    html += '<div class="nistext name">' + data.name + '</div>';
    html += '<div class="buttons">';
    html += '<div class="nisbutton2 control"' + '>Start</div>';
    html += '<div class="nisbutton2 control"' + '>Reset</div>';
    html += '<div class="nisbutton2 control" onclick="removeTimer(' + i + ')">X</div>';
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
    min: data.min,
    sec: data.sec,
    total: data.total,
  });

  clearField('name');
  clearField('hrs');
  clearField('min');
  clearField('sec');

  drawTimers();
}

function removeTimer(index) {
  timers.splice(index, 1);
  drawTimers();
}

function printTimers() {
  console.log(timers);
}

function printInputs() {
  time = readIn();

  console.log(time);
}
