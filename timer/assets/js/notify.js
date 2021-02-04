import { anyTimerDone, getHexFromString } from './util';

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

function overlayNotify() {
  if (window.alt1 && settings.enableIconOverlay) {
    text = '\u23F0';
    h = alt1.rsHeight;
    w = alt1.rsWidth;
    x = settings.iconSize;
    y = parseInt(h / 2 - settings.iconSize / 2);
    colour = parseInt(`0xFF${getHexFromString(settings.iconColour)}`);

    alt1.overLayText(text, colour, settings.iconSize, x, y, delay);
  }
}

function soundNotify() {
  if (window.alt1 && settings.enableSoundAlert) {
    alertSound.volume = settings.alertVolume / 100;
    alertSound.play();
  }
}

export { checkTimers, clearIcon, iconTick, overlayNotify, soundNotify };
