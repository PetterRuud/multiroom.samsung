const SOURCES = {
  OPTICAL: 'optical',
  TVSOUNDCONNECT: 'soundshare',
  HDMI: 'hdmi',
  WIFI: 'wifi',
  AUX: 'aux',
  BLUETOOTH: 'bt',
};

const MODE = {
  DLNA: 'dlna',
  CP: 'cp',
};

const CHANNELS = {
  Pandora: '0',
  Spotify: '1',
  Deezer: '2',
  Napster: '3',
  '8tracks': '4',
  iHeartRadio: '5',
  Rdio: '6',
  BugsMusic: '7',
  JUKE: '8',
  '7digital': '9',
  Murfie: '10',
  'JB HI-FI Now': '11',
  Rhapsody: '12',
  Qobuz: '13',
  Stitcher: '15',
  'MTV Music': '16',
  'Milk Music': '17',
  'Milk Music Radio': '18',
  MelOn: '19',
  'Tidal HiFi': '21',
  SiriusXM: '22',
  Anghami: '23',
  AmazonPrime: '24',
  Amazon: '98',
  TuneIn: '99',
};

const HARDWARE = {
  SOUNDBAR: 'soundbar',
  SPEAKER: 'speaker',
};

const SOFTWARE = {
  SOUNDPLUS: 'SoundPlus',
  STANDARD: 'Standard',
};

const STATUS = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ON: 'on',
  OFF: 'off',
  ONE: 'one',
  ONEINT: '1',
  ZEROINT: '0',
  INACTIVE: 'inactive',
};

const ERROR = {
  FAIL_TO_PLAY: 'fail to play',
};

const PORT = 55001;

const MAXVOLUME = 100;

module.exports = {
  SOURCES,
  CHANNELS,
  PORT,
  MAXVOLUME,
  SOFTWARE,
  ERROR,
  MODE,
  HARDWARE,
  STATUS,
};
