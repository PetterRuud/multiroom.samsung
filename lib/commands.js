const { SOURCES } = require('../constants');

const COMMANDS = {
  TVSOUNDCONNECT: `/UIC?cmd=<name>SetFunc</name><p type="str" name="function" val="${SOURCES.TVSOUNDCONNECT}"/>`,
  WIFI: `/UIC?cmd=<name>SetFunc</name><p type="str" name="function" val="${SOURCES.WIFI}"/>`,
  AUX: `/UIC?cmd=<name>SetFunc</name><p type="str" name="function" val="${SOURCES.AUX}"/>`,
  BLUETOOTH: `/UIC?cmd=<name>SetFunc</name><p type="str" name="function" val="${SOURCES.BLUETOOTH}"/>`,
  GetPowerStatus: 'UIC?cmd=<name>GetPowerStatus</name>',
  SetPowerStatusOn: `UIC?cmd=<name>SetPowerStatus</name><p type="dec" name="powerstatus" val="1"/>`,
  SetPowerStatusOff: `UIC?cmd=<name>SetPowerStatus</name><p type="dec" name="powerstatus" val="0"/>`,
  GetVolume: '/UIC?cmd=<name>GetVolume</name>',
  SetVolume6: '/UIC?cmd=<name>SetVolume%</name>%<p type="dec" name="volume" val="6"/>',
  GetSpkName: '/UIC?cmd=<name>GetSpkName</name>',
  GetAlarmInfo: '/UIC?cmd=<name>GetAlarmInfo</name>',
  GetAvSource: '/UIC?cmd=<name>GetAvSourceAll</name>',
  SpkInGroup: '/UIC?cmd=<name>SpkInGroup</name><p type="str" name="act" val="select"/>',
  GetPlayStatus: '/UIC?cmd=<name>GetPlayStatus</name>',
  Ungroup: '/UIC?cmd=<name>SetUngroup</name>',
  stop: '/CPM?cmd=<name>SetPlaybackControl</name><p type="str" name="playbackcontrol" val="stop"/>',
  pause: '/CPM?cmd=<name>SetPlaybackControl</name><p type="str" name="playbackcontrol" val="pause"/>',
  play: '/CPM?cmd=<name>SetPlaybackControl</name><p type="str" name="playbackcontrol" val="play"/>',
  mute: '/UIC?cmd=<pwron>on</pwron><name>SetMute</name><p type="str" name="mute" val="on"/>',
  unmute: '/UIC?cmd=<pwron>on</pwron><name>SetMute</name><p type="str" name="mute" val="off"/>',
  next: '/UIC?cmd=<pwron>on</pwron><name>SetTrickMode</name><p type="str" name="trickmode" val="next"/>',
  previous: '/UIC?cmd=<pwron>on</pwron><name>SetTrickMode</name><p type="str" name="trickmode" val="previous"/>',
};

module.exports = {
  COMMANDS,
};
