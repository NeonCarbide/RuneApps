SEC = 1000;
MIN = SEC * 60;
HOUR = MIN * 60;
DAY = HOUR * 24;

settings = {
  timerDoneColour: '#32CD32',
  timerRunningColour: '#FFD700',
  enableSoundAlert: false,
  alertVolume: 100,
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
