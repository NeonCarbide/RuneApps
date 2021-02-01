var timers = [];

function start() {
  alt1.identifyAppUrl('appconfig.json');
}

function drawTimers() {
  var html = '';
  
  for (var i = 0; i < timers.length; i++) {
    html += '<div id="timer-' + i + '" class="timer">';
    html += '<div class="nistext name"></div>';
    html += '<div class="nistext time"></div>';
    html += '<div class="nisbutton2 control"' + '>Start</div>';
    html += '<div class="nisbutton2 control"' + '>Reset</div>';
    html += '<div class="nisbutton2 control"' + '>X</div>';
    html += '</div>';
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

  drawTimers();
}

function elid(id) {
  return document.getElementById(id);
}

function readIn() {
  h = elid('hrs').value || 0;
  m = elid('min').value || 0;
  s = elid('sec').value || 0;
  t = (h * 60 * 60 + m * 60 + s) * 1000;

  return { name: elid('name').value, hrs: h, min: m, sec: s, total: t };
}

function printTimers() {
  console.log(timers);
}

function printInputs() {
  time = readIn();

  console.log(time);
}
