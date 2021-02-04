SEC = 1000;
MIN = SEC * 60;
HOUR = MIN * 60;
DAY = HOUR * 24;

settings = {
  timerDoneColour: '#32CD32',
  timerRunningColour: '#FFD700',
  enableSoundAlert: false,
  alertVolume: 0.5,
  enableIconOverlay: true,
  iconSize: 48,
  iconColour: '#F0F000',
};

alertSound = new Audio('assets/audio/pop.wav');

delay = 1050;
tick = 1000;
showIcon = false;
iconTimeout = null;
timerList = [];

var util = (function () {
  function createUserInput(id, value, meta) {
    if (['string', 'int', 'number', 'color', 'slider'].indexOf(meta.t) != -1) {
      if (meta.style) {
        return [
          { t: 'h/11' },
          { t: 'text', text: meta.n },
          { t: `${meta.t}:${id}`, v: value, style: meta.style },
        ];
      }

      return [
        { t: 'h/11' },
        { t: 'text', text: meta.n },
        { t: `${meta.t}:${id}`, v: value },
      ];
    } else if (meta.t == 'dropdown') {
      return [
        { t: 'h/11' },
        { t: 'text', text: meta.n },
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

  function clearField(field) {
    elid(field).value = '';
  }

  function elid(id) {
    return document.getElementById(id);
  }

  function enterKeyPress(e) {
    if (e.key === 'Enter') {
      elid('add-timer').click();
    }
  }

  function getHexFromString(colour) {
    checkHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colour);

    return checkHex ? colour.substring(1) : false;
  }

  function getRGBFromHex(colour) {
    hex = getHexFromString(colour);

    if (hex.length == 3) {
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

  function getContrastColourRelativeToBG(colour) {
    rgb = getRGBFromHex(colour);
    yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;

    return yiq > 125 ? 'black' : 'white';
  }

  function isTimerDone(index) {
    return timerList[index].count && timerList[index].count <= 0 ? true : false;
  }

  function padWithZero(n, width) {
    n = n + '';

    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join('0') + n;
  }

  function writeTime(info) {
    time = {
      h: info.h > 0 ? info.h : 0,
      m: info.m > 0 ? info.m : 0,
      s: info.s > 0 ? info.s : 0,
    };

    return `${padWithZero(time.h, 2)}:${padWithZero(time.m, 2)}:${padWithZero(
      time.s,
      2
    )}`;
  }

  return {
    anyDone: function () {
      for (var i = 0; i < timerList.length; i++) {
        if (isTimerDone(i)) {
          return true;
        }
      }

      return false;
    },
    contrastColour: getContrastColourRelativeToBG,
    clearField: clearField,
    createInput: createUserInput,
    elid: elid,
    enterKeyPress: enterKeyPress,
    hexFromString: getHexFromString,
    inverseColour: getInverseColour,
    isDone: isTimerDone,
    pad: padWithZero,
    readIn: function () {
      h = elid('hrs').value || 0;
      m = elid('min').value || 0;
      s = elid('sec').value || 0;
      t = h * HOUR + m * MIN + s * SEC;

      return { name: elid('name').value, hrs: h, min: m, sec: s, total: t };
    },
    writeTime: writeTime,
  };
})();

var config = (function () {
  function configMenu() {
    info = [];
    styles = {
      done: '',
      running: '',
      icon: '',
    };

    styles.done += `background-color: ${settings.timerDoneColour};`;
    styles.done += `color: ${util.contrastColour(settings.timerDoneColour)};`;

    styles.running += `background-color: ${settings.timerRunningColour};`;
    styles.running += `color: ${util.contrastColour(
      settings.timerRunningColour
    )};`;

    styles.icon += `background-color: ${settings.iconColour};`;
    styles.icon += `color: ${util.contrastColour(settings.iconColour)};`;

    // info.concat(
    //   util.createInput('doneColour', settings.timerDoneColour, {
    //     t: 'string',
    //     n: 'Done HEX Colour Code',
    //     // style: styles.done,
    //   }),
    //   util.createInput('runningColour', settings.timerRunningColour, {
    //     t: 'string',
    //     n: 'Running HEX Colour Code',
    //     // style: styles.running,
    //   }),
    //   util.createInput('soundEnable', settings.enableSoundAlert, {
    //     t: 'bool',
    //     n: 'Enable Sound Alert',
    //   })
    // );

    // console.log(info);

    // if (settings.enableSoundAlert) {
    //   info.concat(
    //     util.createInput('alertVolume', settings.alertVolume, {
    //       t: 'int',
    //       n: 'Alert Volume',
    //     })
    //   );
    // }

    // info.concat(
    //   util.createInput('iconEnable', settings.enableIconOverlay, {
    //     t: 'bool',
    //     n: 'Enable Icon Overlay',
    //   })
    // );

    // console.log(info);

    // if (settings.enableIconOverlay) {
    //   info.concat(
    //     util.createInput('iconSize', settings.iconSize, {
    //       t: 'int',
    //       n: 'Icon Font Size',
    //     }),
    //     util.createInput('iconColour', settings.iconColour, {
    //       t: 'string',
    //       n: 'Icon HEX Colour Code',
    //       // style: styles.icon,
    //     })
    //   );
    // }

    info.push({ t: 'h/11' });
    info.push({ t: 'text', text: 'Done HEX Colour Code' });
    info.push({
      t: 'string:doneColour',
      v: settings.timerDoneColour,
      style: doneStyle,
    });
    info.push({ t: 'h/11' });
    info.push({ t: 'text', text: 'Running HEX Colour Code' });
    info.push({
      t: 'string:runningColour',
      v: settings.timerRunningColour,
      style: runningStyle,
    });

    info.push({
      t: 'bool:soundEnable',
      v: settings.enableSoundAlert,
      text: 'Enable Sound Alert',
    });

    if (settings.enableSoundAlert) {
      info.push({ t: 'h/11' });
      info.push({ t: 'text', text: 'Alert Volume' });
      info.push({ t: 'int:alertVolume', v: settings.alertVolume });
    }

    info.push({
      t: 'bool:iconEnable',
      v: settings.enableIconOverlay,
      text: 'Enable Icon Overlay',
    });

    if (settings.enableIconOverlay) {
      info.push({ t: 'h/11' });
      info.push({ t: 'text', text: 'Icon Font Size' });
      info.push({ t: 'int:iconSize', v: settings.iconSize });
      info.push({ t: 'h/11' });
      info.push({ t: 'text', text: 'Icon HEX Colour Code' });
      info.push({
        t: 'string:iconColour',
        v: settings.iconColour,
        style: iconStyle,
      });
    }

    info.push({ t: 'h/11' });
    info.push({ t: 'button:confirm', text: 'Confirm' });
    info.push({ t: 'button:cancel', text: 'Cancel' });

    console.log(info);

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
        info
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

        config.cfgSave();
        menu.frame.close();
      };
    } catch (e) {
      console.log(e);
    }
  }

  return {
    cfgLoad: function () {
      if (localStorage.gen_timers_config) {
        userConfig = JSON.parse(localStorage.gen_timers_config);
        config = Object.assign(config, userConfig);
      }
    },
    cfgSave: function () {
      localStorage.gen_timers_config = JSON.stringify(config);
    },
    dataLoad: function () {
      timerList = [];

      if (!localStorage.gen_timers) {
        return;
      }

      try {
        obj = JSON.parse(localStorage.gen_timers);
      } catch (e) {
        return;
      }

      for (var i = 0; i < obj.length; i++) {
        timerList.push({
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
    },
    dataSave: function () {
      obj = [];

      for (var i = 0; i < timerList.length; i++) {
        timers.stop(i);
        obj.push(timerList[i]);
      }

      localStorage.gen_timers = JSON.stringify(obj);
    },
    menu: configMenu,
  };
})();

var notify = (function () {
  function checkTimers() {
    for (var i = 0; i < timers.length; i++) {
      if (util.anyDone()) {
        showIcon = true;
        break;
      }
    }

    if (showIcon) {
      overlayNotify();
    }
  }

  function iconTick() {
    if (settings.enableIconOverlay) {
      iconTimeout = setTimeout(function () {
        checkTimers();
        iconTick();
      }, tick);
    }
  }

  function overlayNotify() {
    if (window.alt1 && settings.enableIconOverlay) {
      text = '\u23F0';
      h = alt1.rsHeight;
      w = alt1.rsWidth;
      x = settings.iconSize;
      y = parseInt(h / 2 - settings.iconSize / 2);
      colour = parseInt(`0xFF${util.hexFromString(settings.iconColour)}`);

      alt1.overLayText(text, colour, settings.iconSize, x, y, delay);
    }
  }

  function soundNotify() {
    if (window.alt1 && settings.enableSoundAlert) {
      alertSound.volume = settings.alertVolume / 100;
      alertSound.play();
    }
  }

  return {
    clearIcon: function () {
      clearTimeout(iconTimeout);

      showIcon = false;
    },
    soundNotify: soundNotify,
    tick: iconTick,
  };
})();

var timers = (function () {
  function drawTimers() {
    html = '';

    for (var i = 0; i < timerList.length; i++) {
      str = '';

      str += timerList[i].done || util.isDone(i) ? ' done' : '';
      str += timerList[i].interval ? ' running' : '';
      str += `">${util.writeTime(timerList[i])}`;

      html += `<div id="timer-${i}" class="timer">`;
      html += `<div class="nistext time${str}</div>`;
      html += `<div class="nistext name">${timerList[i].name}</div>`;
      html += '<div class="buttons">';
      html += `<div class="nisbutton2 control" id="start" onclick="timers.start(${i})">Start</div>`;
      html += `<div class="nisbutton2 control" id="pause" onclick="timers.pause(${i})">Pause</div>`;
      html += `<div class="nisbutton2 control" id="reset" onclick="timers.reset(${i})">Reset</div>`;
      html += `<div class="nisbutton2 control" onclick="timers.remove(${i})">X</div>`;
      html += '</div></div>';
    }

    util.elid('timers').innerHTML = html;
  }

  function resetTimer(index) {
    stopTick(index);
    timerList[index].h = timerList[index].hrs;
    timerList[index].m = timerList[index].min;
    timerList[index].s = timerList[index].sec;
    timerList[index].done = false;
    timerList[index].start = null;
    timerList[index].end = null;
    timerList[index].count = null;
    drawTimers();
  }

  function scheduleTick(index) {
    stopTick(index);

    if (timerList[index].start != null) {
      timerList[index].interval = setInterval(startTick, 1000);
    }
  }

  function startTick() {
    for (var i = 0; i < timerList.length; i++) {
      if (util.isDone(i)) {
        stopTick(i);
        continue;
      }
      if (timerList[i].start) {
        timerList[i].count = timerList[i].end - Date.now();
        timerList[i].h = Math.floor((timerList[i].count % DAY) / HOUR);
        timerList[i].m = Math.floor((timerList[i].count % HOUR) / MIN);
        timerList[i].s = Math.floor((timerList[i].count % MIN) / SEC);
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

    if (util.isDone(index)) {
      timers[index].done = true;

      notify.soundNotify();
      notify.tick();
    }
  }

  return {
    add: function () {
      input = util.readIn();

      timerList.push({
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

      util.clearField('name');
      util.clearField('hrs');
      util.clearField('min');
      util.clearField('sec');

      drawTimers();
    },
    draw: drawTimers,
    pauseAll: function () {
      for (var i = 0; i < timerList.length; i++) {
        stopTick(i);
      }

      drawTimers();
    },
    pause: function (index) {
      stopTick(index);
      drawTimers();
    },
    remove: function (index) {
      stopTick(index);
      timerList.splice(index, 1);
      drawTimers();
    },
    resetAll: function () {
      for (var i = 0; i < timerList.length; i++) {
        if (timerList[i].start) {
          resetTimer(i);
        }
      }
    },
    reset: resetTimer,
    start: function (index) {
      if (!timerList[index].start) {
        timerList[index].start = Date.now();
      }

      timerList[index].end = timerList[index].start + timerList[index].total;

      scheduleTick(index);
      drawTimers();
    },
    stop: stopTick,
  };
})();

var app = (function () {
  return {
    start: function () {
      try {
        alt1.identifyAppUrl('appconfig.json');
        config.cfgLoad();
        config.dataLoad();
      } catch (e) {
        console.log('Alt1 not found');
      }

      for (var i = 0; i < timerList.length; i++) {
        if (timerList[i].start) {
          if (Date.now() > timerList[i].end) {
            timerList[i].count = -1;
          }
        }
      }

      timers.draw();
    },
  };
})();

window.addEventListener('beforeunload', function () {
  config.cfgSave();
});
window.addEventListener('mouseover', function () {
  notify.clearIcon();
});
