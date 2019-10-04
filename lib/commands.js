const { SOURCES, MAXVOLUME } = require('../constants');

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
  play: 'CPM?cmd=<name>SetPlaybackControl</name><p type="str" name="playbackcontrol" val="play"/>',
  mute: 'UIC?cmd=<pwron>on</pwron><name>SetMute</name><p type="str" name="mute" val="on"/>',
  unmute: 'UIC?cmd=<pwron>on</pwron><name>SetMute</name><p type="str" name="mute" val="off"/>',
  next: 'UIC?cmd=<pwron>on</pwron><name>SetTrickMode</name><p type="str" name="trickmode" val="next"/>',
  previous: 'UIC?cmd=<pwron>on</pwron><name>SetTrickMode</name><p type="str" name="trickmode" val="previous"/>',
  GetSpkName: 'UIC?cmd=<name>GetSpkName</name>',
  GetMainInfo: 'UIC?cmd=<name>GetMainInfo</name>',
  GetCurrentPlayTime: 'UIC?cmd=<name>GetCurrentPlayTime</name>',
  GetMute: 'UIC?cmd=<name>GetMute</name>',
  SetPreviousTrack: 'CPM?cmd=<name>SetPreviousTrack</name>',
  SetSkipCurrentTrack: 'CPM?cmd=<name>SetSkipCurrentTrack</name>',
  GetCurrentEQMode: 'UIC?cmd=<name>GetCurrentEQMode</name>',
  GetFunc: 'UIC?cmd=<name>GetFunc</name>',
  cpm_GetPlayStatus: 'CPM?cmd=<name>GetPlayStatus</name>',
  cpm_SetPlaybackControl: playbackControl => `CPM?cmd=<name>SetPlaybackControl</name><p type="str" name="playbackcontrol" val="${playbackControl}"/>`,
  cpm_SetRepeatMode: mode => `CPM?cmd=<name>SetRepeatMode</name><p type="dec" name="mode" val="${mode}"/>`,
  GetCurrentRadioList: `CPM?cmd=<name>GetCurrentRadioList</name><p type="dec" name="startindex" val="0"/><p type="dec" name="listcount" val="99"/>`,
  PlayById: (player, mediaId) => `CPM?cmd=<name>PlayById</name><p type="str" name="cpname" val="${player}"/><p type="str" name="mediaid" val="${mediaId}"/>`,
  GetRadioInfo: 'CPM?cmd=<name>GetRadioInfo</name>',
  GetRearLevel: 'CPM?cmd=<name>GetRearLevel</name>',
  uic_GetPlayStatus: 'UIC?cmd=<name>GetPlayStatus</name>',
  Set7bandEQMode: newEqPreset => `UIC?cmd=<name>Set7bandEQMode</name>
  <p type="dec" name="presetindex" val="${newEqPreset}"/>`,
  GetSelectRadioList: contentId => `CPM?cmd=<name>GetSelectRadioList</name>
  <p type="dec" name="contentid" val="${contentId}"/>
  <p type="dec" name="startindex" val="0"/>
  <p type="dec" name="listcount" val="90"/>`,
  SetToggleShuffle: mode => `CPM?cmd=<name>SetToggleShuffle</name><p type="dec" name="mode" val="${mode}"/>`,
  SetChVolMultich: volume => `UIC?cmd=<pwron>on</pwron><name>SetChVolMultich</name><p type="dec" name="chvol" val="${volume}"/>`,
  SetCpService: cp => `CPM?cmd=<name>SetCpService</name><p type="dec" name="cpservice_id" val="${cp}"/>`,
  BrowseMain: `CPM?cmd=<name>BrowseMain</name><p type="dec" name="startindex" val="0"/><p type="dec" name="listcount" val="30"/>`,
  SetUrlPlayback: (trackUrl, resume) => `UIC?cmd=<pwron>on</pwron><name>SetUrlPlayback</name>
  <p type="cdata" name="url" val="empty"><![CDATA[${trackUrl}]]></p>
  <p type="dec" name="buffersize" val="0"/>
  <p type="dec" name="seektime" val="0"/>
  <p type="dec" name="resume" val="${resume}"/>`,
  uic_SetPlaybackControl: playbackControl =>
    `/UIC?cmd=<pwron>on</pwron><name>SetPlaybackControl</name><p type="str" name="playbackcontrol" val="${playbackControl}"/>`,
  uic_SetRepeatMode: repeatMode => `UIC?cmd=<name>SetRepeatMode</name><p type="str" name="repeatmode" val="${repeatMode}"/>`,
  GetGroupName: 'UIC?cmd=<name>GetGroupName</name>',
  GetMusicInfo: 'UIC?cmd=<name>GetMusicInfo</name>',
  createGroupCommandMain: (groupName, spksInGrp, mainSpkMAC, mainSpkName) => {
    groupName = groupName.replaceAll(' ', '%20');
    mainSpkName = mainSpkName.replaceAll(' ', '%20');
    return `UIC?cmd=<pwron>on</pwron><name>SetMultispkGroup</name>
      <p type="cdata" name="name" val="empty"><![CDATA[${groupName}]]></p>
      <p type="dec" name="index" val="1"/>
      <p type="str" name="type" val="main"/>
      <p type="dec" name="spknum" val="${spksInGrp}"/>
      <p type="str" name="audiosourcemacaddr" val="${mainSpkMAC}"/>
      <p type="cdata" name="audiosourcename" val="empty"><![CDATA[${mainSpkName}]]></p>
      <p type="str" name="audiosourcetype" val="speaker"/>`;
  },
  createGroupCommandSub: (subSpkIP, subSpkMAC) => `<p type="str" name="subspkip" val="${subSpkIP}"/><p type="str" name="subspkmacaddr" val="${subSpkMAC}"/>`,
  createSurrCommandMain: (groupName, spksInGroup, mainSpkMAC, mainSpkName, mainSpkLoc, mainSpkChVol) => {
    groupName = groupName.replaceAll(' ', '%20');
    mainSpkName = mainSpkName.replaceAll(' ', '%20');
    return `UIC?cmd=<pwron>on</pwron><name>SetMultichGroup</name>
    <p type="cdata" name="name" val="empty"><![CDATA[${groupName}]]></p>
    <p type="dec" name="index" val="1"/>
    <p type="str" name="type" val="main"/>
    <p type="dec" name="spknum" val="${spksInGroup}"/>
    <p type="str" name="audiosourcemacaddr" val="${mainSpkMAC}"/>
    <p type="cdata" name="audiosourcename" val="empty"><![CDATA[${mainSpkName}]]></p>
    <p type="str" name="audiosourcetype" val="speaker"/>
    <p type="str" name="channeltype" val="${mainSpkLoc}"/>
    <p type="dec" name="channelvolume" val="${mainSpkChVol}"/>`;
  },
  createSurrCommandSub: (subSpkIP, subSpkMAC, subSpkLoc) =>
    `<p type="str" name="subspkip" val="${subSpkIP}"/><p type="str" name="subspkmacaddr" val="${subSpkMAC}"/><p type="str" name="subchanneltype" val="${subSpkLoc}"/>`,

  nextMsg: '/UIC?cmd=<name>NEXTMESSAGE</name>',
};

module.exports = {
  COMMANDS,
};
