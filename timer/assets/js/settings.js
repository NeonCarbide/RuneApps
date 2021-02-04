import { createUserInput, getTextColourRelativeToBG } from 'util';

export function settingsMenu() {
  data = [];
  styles = {
    done: '',
    running: '',
    icon: '',
  };

  styles.done += `background-color: ${settings.timerDoneColour};`;
  styles.done += `color: ${getTextColourRelativeToBG(
    settings.timerDoneColour
  )};`;

  styles.running += `background-color: ${settings.timerRunningColour};`;
  styles.running += `color: ${getTextColourRelativeToBG(
    settings.timerRunningColour
  )};`;

  styles.icon += `background-color: ${settings.iconColour};`;
  styles.icon += `color: ${getTextColourRelativeToBG(settings.iconColour)};`;

  data.concat(
    createUserInput('doneColour', settings.timerDoneColour, {
      t: 'string',
      n: 'Done HEX Colour Code',
      style: styles.done,
    }),
    createUserInput('runningColour', settings.timerRunningColour, {
      t: 'string',
      n: 'Running HEX Colour Code',
      style: styles.running,
    }),
    createUserInput('soundEnable', settings.enableSoundAlert, {
      t: 'bool',
      n: 'Enable Sound Alert',
    })
  );

  if (settings.enableSoundAlert) {
    data.concat(
      createUserInput('alertVolume', settings.alertVolume, {
        t: 'int',
        n: 'Alert Volume',
      })
    );
  }

  data.concat(
    createUserInput('iconEnable', settings.enableIconOverlay, {
      t: 'bool',
      n: 'Enable Icon Overlay',
    })
  );

  if (settings.enableIconOverlay) {
    data.concat(
      createUserInput('iconSize', settings.iconSize, {
        t: 'int',
        n: 'Icon Font Size',
      }),
      createUserInput('iconColour', settings.iconColour, {
        t: 'string',
        n: 'Icon HEX Colour Code',
        style: styles.icon,
      })
    );
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

export function saveSettings() {
  localStorage.gen_timers_config = JSON.stringify(settings);
}

export function loadSettings() {
  if (localStorage.gen_timers_config) {
    userSettings = JSON.parse(localStorage.gen_timers_config);
    settings = Object.assign(settings, userSettings);
  }
}
