'use strict';

const Homey = require('homey');
// const { ManagerCron } = require('homey');
const fetch = require('node-fetch');
const { COMMANDS } = require('./commands');
const { PORT, MODE, STATUS, SOFTWARE } = require('../constants');
const convert = require('xml-js');

class SamsungMultiroomDevice extends Homey.Device {
  /*
   * Homey Listeners
   */

  onInit() {
    this.setUnavailable(Homey.__('loading'));

    this.speaker = this.getData();

    this.image = new Homey.Image('jpg');
    this.image.setUrl(null);
    this.image
      .register()
      .then(() => {
        this.setAlbumArtImage(this.image);
      })
      .catch(this.error);

    if (!this.speaker.id) throw new Error('Missing Speaker ID');

    this.log(`[${this.getName()}]`, `Connected to speaker - ID: ${this.speaker.id}`);

    this.registerCapabilityListener('onoff', this.onCapabilityPower.bind(this));
    this.registerCapabilityListener('inputSource', this.onCapabilityInputSource.bind(this));
    this.registerCapabilityListener('volume_set', this.onCapabilityVolumeSet.bind(this));
    this.registerCapabilityListener('volume_up', this.onCapabilityVolumeUp.bind(this));
    this.registerCapabilityListener('volume_down', this.onCapabilityVolumeDown.bind(this));
    this.registerCapabilityListener('volume_mute', this.onCapabilityMute.bind(this));
    this.registerCapabilityListener('preset', this.onCapabilityPreset.bind(this));
    this.registerCapabilityListener('eqPreset', this.onCapabilityEQPreset.bind(this));
    this.registerCapabilityListener('speaker_repeat', this.onCapabilityRepeat.bind(this));
    this.registerCapabilityListener('speaker_shuffle', this.onCapabilityShuffle.bind(this));
    this.registerCapabilityListener('speaker_track', this.onCapabilityTrack.bind(this));
    this.registerCapabilityListener('speaker_album', this.onCapabilityAlbum.bind(this));
    this.registerCapabilityListener('speaker_artist', this.onCapabilityArtist.bind(this));
    this.registerCapabilityListener('speaker_playing', this.onCapabilityPlaying.bind(this));
    this.registerCapabilityListener('speaker_prev', this.onCapabilityPrev.bind(this));
    this.registerCapabilityListener('speaker_next', this.onCapabilityNext.bind(this));
    this.registerCapabilityListener('status', this.onCapabilityStatus.bind(this));
    this.registerCapabilityListener('selSpkName', this.onCapabilitySelectSpeakerName.bind(this));
    this.registerCapabilityListener('groupPsTitle', this.onCapabilityGroupPreset.bind(this));
    this.registerCapabilityListener('selSpkVol', this.onCapabilitySelectSpeakerVolume.bind(this));
    this.registerCapabilityListener('selSpkEqLevel', this.onCapabilitySelectSpeakerEQLevel.bind(this));
    this.registerCapabilityListener('switch', this.onCapabilitySwitch.bind(this));
    this.registerCapabilityListener('deletePresetState', this.onCapabilityDeletePreset.bind(this));

    this.connectSpeaker();
    this.setAvailable();
  }

  /*
   * Capability Listeners
   */
  async onCapabilityPower(value) {
    this.log('onCapabilityPower', value);
  }
  async onCapabilityInputSource(value) {
    this.log('onCapabilityInputSource', value);
    this.setInputSource(value);
  }
  async onCapabilityVolumeSet(value) {
    this.log('onCapabilityVolumeSet', value);
    this.setLevel(value);
  }
  async onCapabilityVolumeUp(value) {
    this.log('onCapabilityVolumeUp', value);
    this.setLevel(value);
  }
  async onCapabilityVolumeDown(value) {
    this.log('onCapabilityVolumeDown', value);
    this.setLevel(value);
  }
  async onCapabilityMute(value) {
    this.log('onCapabilityMute', value);
    this.mute();
  }
  async onCapabilityPreset(value) {}
  async onCapabilityEQPreset(value) {}
  async onCapabilityRepeat(value) {
    this.log('onCapabilityRepeat', value);
    this.toggleRepeat();
  }
  async onCapabilityShuffle(value) {
    this.log('onCapabilityShuffle', value);
    this.toggleShuffle();
  }
  async onCapabilityTrack(value) {
    this.log('onCapabilityTrack', value);
  }
  async onCapabilityAlbum(value) {
    this.log('onCapabilityAlbum', value);
  }
  async onCapabilityArtist(value) {
    this.log('onCapabilityArtist', value);
  }

  async onCapabilityStatus(value) {
    this.log('onCapabilityStatus', value);
  }
  async onCapabilitySelectSpeakerName(value) {}
  async onCapabilityGroupPreset(value) {}
  async onCapabilitySelectSpeakerVolume(value) {}
  async onCapabilitySelectSpeakerEQLevel(value) {}
  async onCapabilitySwitch(value) {}
  async onCapabilityDeletePreset(value) {}

  async onCapabilitySpeakerPlaying(value) {
    this.log('onCapabilitySpeakerPlaying', value);
  }

  async onCapabilitySpeakerPrev(value) {
    this.log('onCapabilitySpeakerPrev', value);
    this.previousTrack();
  }

  async onCapabilitySpeakerNext(value) {
    this.log('onCapabilitySpeakerNext', value);
    this.nextTrack();
  }

  connectSpeaker() {
    this.sendCmd(COMMANDS.SetPowerStatus(1), 'PowerStatus');
    this.sendCmd(COMMANDS.GetFunc, 'GetFunc');
    this.sendCmd(COMMANDS.GetMute, 'GetMute');
    this.sendCmd(COMMANDS.GetVolume, 'GetVolume');
    // ManagerCron.registerTask('setTrackDescription', '* * * * 5 *', {}, this.setTrackDescription);

    this.runIn(5, this.setTrackDescription);
  }

  off() {
    this.stop;
    this.sendCmd(COMMANDS.SetPowerStatus(STATUS.ZEROINT), 'PowerStatus');
    // ManagerCron.unregisterAllTasks();
  }

  setInputSource(value) {
    this.getCapabilityValue('inputSource');
    const sources = state.sources;
    const totSources = sources.length;
    const sourceNo = state.currentSourceNo;
    if (sourceNo + 1 >= totSources) {
      sourceNo = 0;
    } else {
      sourceNo = sourceNo + 1;
    }
    state.currentSourceNo = sourceNo;
    this.setCapabilityValue('inputSource', source);
    this.sendCmd(COMMANDS.SetFunc(sources[sourceNo]));
    this.runIn(5, this.setTrackDescription);
  }

  setLevel(level) {
    const { volumeScale } = this.speaker;
    const deviceLevel = Math.round((volumeScale * level) / 100);
    this.sendCmd(COMMANDS.SetVolume(deviceLevel), 'VolumeLevel');
  }

  mute() {
    this.sendCmd(COMMANDS.SetMute(STATUS.ON), 'MuteStatus');
  }

  unmute() {
    this.sendCmd(COMMANDS.SetMute(STATUS.OFF), 'MuteStatus');
  }

  setEqPreset() {
    this.sendCmd(COMMANDS.Get7BandEQList);
  }

  cmdEqPreset(totPresets) {
    const newEqPreset = '';
    const totalPresets = totPresets - 1;
    const currentEqPreset = state.currentEqPreset;
    if (currentEqPreset >= totalPresets) {
      newEqPreset = 0;
    } else {
      newEqPreset = currentEqPreset + 1;
    }
    this.sendCmd(COMMANDS.Set7bandEQMode(newEqPreset));
  }

  getPowerStatus() {
    const { deviceType } = this.speaker;
    if (deviceType === HARDWARE.SOUNDBAR) {
      this.sendCmd(COMMANDS.GetPowerStatus);
    } else {
      if (this.speaker.status === STATUS.PLAYING) {
        this.setCapabilityValue('switch', 'on');
      } else {
        this.setCapabilityValue('switch', 'off');
      }
    }
  }

  //	===================================
  //	===== Music Control Functions =====
  //	===================================

  play() {
    switch (state.subMode) {
      case MODE.DLNA:
        this.sendCmd(COMMANDS.uic_SetPlaybackControl('resume'));
        break;
      case MODE.CP:
        this.sendCmd(COMMANDS.cpm_SetPlaybackControl('play'));
        break;
      default:
        return;
    }
    this.runIn(5, this.getPlayTime);
  }

  pause() {
    switch (state.subMode) {
      case MODE.DLNA:
        this.sendCmd(COMMANDS.uic_SetPlaybackControl('pause'));
        break;
      case MODE.CP:
        this.sendCmd(COMMANDS.cpm_SetPlaybackControl('pause'));
        break;
      default:
        return;
    }
    this.unschedule('setTrackDesciption');
  }

  stop() {
    switch (state.subMode) {
      case MODE.DLNA:
        this.sendCmd(COMMANDS.uic_SetPlaybackControl('pause'));
        break;
      case MODE.CP:
        this.sendCmd(COMMANDS.cpm_SetPlaybackControl('stop'));
        break;
      default:
        return;
    }
    this.unschedule('setTrackDesciption');
  }

  getPlayStatus() {
    switch (state.subMode) {
      case MODE.DLNA:
        this.sendCmd(COMMANDS.uic_GetPlayStatus);
        break;
      case MODE.CP:
        this.sendCmd(COMMANDS.cpm_GetPlayStatus);
        break;
      default:
        // todo
        this.emit('status', STATUS.PLAYING);
        break;
    }
  }

  previousTrack() {
    switch (state.subMode) {
      case MODE.CP:
        const player = state.currentPlayer;
        if (player === 'Amazon' || player === 'AmazonPrime') {
          this.sendCmd(COMMANDS.SetPreviousTrack);
          this.runIn(1, this.sendCmd(COMMANDS.SetPreviousTrack));
        } else {
          this.log('previousTrack: Previous Track does not work for this player');
          throw new Error('previousTrack: Previous Track does not work for this player');
        }
        break;
      case MODE.DLNA:
        this.sendCmd(COMMANDS.SetTrickMode('previous'));
        break;
      default:
        this.log(`${device.label}_previousTrack: Previous Track does not work for this player`);
        throw new Error('previousTrack: Previous Track does not work for this player');
    }
    this.runIn(10, this.setTrackDescription);
  }

  nextTrack() {
    switch (state.subMode) {
      case MODE.CP:
        const player = state.currentPlayer;
        if (player === 'Amazon' || player === 'AmazonPrime' || player === 'Pandora' || player === '8tracks') {
          this.sendCmd(COMMANDS.SetSkipCurrentTrack);
        } else {
          this.log(`$nextTrack: Next Track does not work for this player`);
          throw new Error('nextTrack: Next Track does not work for this player');
        }
        break;
      case MODE.DLNA:
        this.sendCmd(COMMANDS.SetTrickMode('next'));
        break;
      default:
        this.log(`${device.label}_nextTrack: Next Track does not work for this player`);
        throw new Error('nextTrack: Next Track does not work for this player');
    }
    runIn(10, this.setTrackDescription);
  }

  toggleShuffle() {
    switch (state.subMode) {
      case MODE.DLNA:
        if (this.speaker.shuffle === STATUS.ZEROINT || this.speaker.shuffle === STATUS.INACTIVE) {
          this.sendCmd(COMMANDS.SetShuffleMode(STATUS.ON));
        } else {
          this.sendCmd(COMMANDS.SetShuffleMode(STATUS.OFF));
        }
        break;
      case MODE.CP:
        if (this.speaker.shuffle === STATUS.ZEROINT || this.speaker.shuffle === STATUS.INACTIVE) {
          this.sendCmd(COMMANDS.SetToggleShuffle(STATUS.ONEINT));
        } else {
          this.sendCmd(COMMANDS.SetToggleShuffle(STATUS.ZEROINT));
        }
        break;
      default:
        this.log('toggleShuffle: ShuffleMode not valid for device or mode');
        throw new Error('toggleShuffle: ShuffleMode not valid for device or mode');
    }
  }

  toggleRepeat() {
    switch (state.subMode) {
      case MODE.DLNA:
        if (this.speaker.repeat === STATUS.ZEROINT || this.speaker.repeat === STATUS.INACTIVE) {
          this.sendCmd(COMMANDS.uic_SetRepeatMode(STATUS.ONE));
        } else {
          this.sendCmd(COMMANDS.uic_SetRepeatMode(STATUS.OFF));
        }
        break;
      case MODE.CP:
        if (this.speaker.repeat === '0' || this.speaker.repeat === STATUS.INACTIVE) {
          this.sendCmd(COMMANDS.cpm_SetRepeatMode(STATUS.ONEINT));
        } else {
          this.sendCmd(COMMANDS.cpm_SetRepeatMode(STATUS.ZEROINT));
        }
        break;
      default:
        this.log('toggleRepeat: Repeat not valid for device or mode');
        throw new Error('toggleRepeat: Repeat not valid for device or mode');
    }
  }

  //	=============================
  //	===== Preset Initiators =====
  //	=============================
  preset_1() {
    state.currentPreset = 'preset_1';
    this.presetDirector('preset_1', 'content');
  }

  preset_2() {
    state.currentPreset = 'preset_2';
    this.presetDirector('preset_2', 'content');
  }

  preset_3() {
    state.currentPreset = 'preset_3';
    this.presetDirector('preset_3', 'content');
  }

  preset_4() {
    state.currentPreset = 'preset_4';
    this.presetDirector('preset_4', 'content');
  }

  preset_5() {
    state.currentPreset = 'preset_5';
    this.presetDirector('preset_5', 'content');
  }

  preset_6() {
    state.currentPreset = 'preset_6';
    this.presetDirector('preset_6', 'content');
  }

  preset_7() {
    state.currentPreset = 'preset_7';
    this.presetDirector('preset_7', 'content');
  }

  preset_8() {
    state.currentPreset = 'preset_8';
    this.presetDirector('preset_8', 'content');
  }

  groupPs_1() {
    state.currentGroupPs = 'groupPs_1';
    this.presetDirector('groupPs_1', 'group');
  }

  groupPs_2() {
    state.currentGroupPs = 'groupPs_2';
    this.presetDirector('groupPs_2', 'group');
  }

  groupPs_3() {
    state.currentGroupPs = 'groupPs_3';
    this.presetDirector('groupPs_3', 'group');
  }

  presetDirector(preset, psType) {
    const presetState = device.currentValue(preset);
    const deletePresetState = device.currentValue('deletePresetState');
    if (deletePresetState === 'armed') {
      this.prepareToDeletePS(preset);
    } else if (presetState === 'vacant') {
      this.armAddPreset(preset);
    } else if (presetState === 'add') {
      this.addPreset(preset, psType);
    } else if (psType === 'content') {
      this.playContent(preset);
    } else if (psType === 'group') {
      this.startGroup(preset);
    } else {
      this.log(`presetDirector: Error in presetDirector, preset = ${preset}`);
    }
  }

  //	=======================================
  //	===== Preset Management Functions =====
  //	=======================================
  armAddPreset(preset) {
    // todo
    this.emit('preset', 'add');
    this.runIn(15, this.cancelPresetUpdate, this.preset);
  }

  cancelPresetUpdate(data) {
    const preset = data.preset;
    const tempType = preset.substring(0, 6);
    if (device.currentValue(preset) === 'add') {
      if (tempType === 'preset') {
        state[preset] = [];
      }
      // todo
      this.emit('preset', 'vacant');
    }
  }

  addPreset(preset, psType) {
    //sendEvent(name: preset, value: "updating")
    state[preset]._Data = [];
    if (psType === 'content') {
      if (state.subMode === MODE.CP) {
        GetRadioInfo('getCpDataParse');
      } else if (state.submode === MODE.DLNA) {
        this.log(`addPreset: Presets not currently supported for ${state.subMode}.`);
        throw new Error('addPreset: Preset for DLNA mode not currently supported.');
      } else {
        this.log(`addPreset: Presets not currently supported for ${state.subMode}.`);
        throw new Error('addPreset: Preset for DLNA mode not currently supported.');
      }
    } else if (psType === 'group') {
      state.spkType = 'main';
      state.subSpkNo = 0;
      state.mainSpkMAC = this.speaker.deviceMac;
      state.mainSpkDNI = this.speaker.deviceNetworkId;
      this.sendCmd(COMMANDS.GetGroupName);
    } else {
      this.log(`addPreset: Error in addPreset, preset = ${preset}`);
      throw new Error('addPreset: Failed.  Please check for problem and try again.');
    }
  }

  createPreset(player, playerNo, path, title) {
    //	Create a content preset.
    const preset = state.currentPreset;
    const psState = [];
    psState['subMode'] = state.subMode;
    psState['path'] = path;
    psState['title'] = title;
    psState['player'] = player;
    psState['playerNo'] = playerNo;
    state[preset_Data] = psState;
    state.restore_Data = psState;
    title = title.toString();
    if (title.length() > 30) {
      title = title.take(29);
    }
    // todo
    this.emit('preset', title);
    this.runIn(10, this.GetRadioInfo);
  }

  deletePreset() {
    // todo
    this.emit('deletePresetState', 'armed');
    this.runIn(10, this.stopDeletePreset);
  }

  prepareToDeletePS(preset) {
    state.presetToDelete = preset;
    this.emit('deletePresetState', `PRESS TO DELETE\n\r${preset}`);
    this.runIn(10, this.stopDeletePreset);
  }

  finishDeletePreset() {
    unschedule('stopDeletePreset');
    const preset = state.presetToDelete;
    // todo
    this.emit('deletePresetState', STATUS.INACTIVE);
    state[preset_Data] = [];
    this.emit('preset', 'vacant');
  }

  stopDeletePreset() {
    // this.emit('deletePresetState', STATUS.INACTIVE)
  }

  //	===================================
  //	===== Group Control Functions =====
  //	===================================
  startGroup(preset) {
    if (state.activeGroupPs === null || state.activeGroupPs === preset) {
      state.activeGroupPs = preset;
    } else {
      this.log(`startGroup: tried to activate group with ${state.activeGroupPs} active.`);
      throw new Error('startGroup: Failed.  Group already active');
    }
    const groupData = state[preset_Data];
    const groupCmd = '';
    const subCmdStr = '';
    const groupType = groupData['groupType'];
    const groupName = groupData['groupName'];
    const spksInGroup = groupData['spksInGroup'];
    const mainData = groupData['main'];
    const mainSpkMAC = mainData['spkMAC'];
    const speakerName = mainData['spkName'];
    const mainSpkChVol = mainData['spkChVol'];
    const mainSpkLoc = mainData['spkLoc'];
    const mainSpkDefVol = mainData['spkDefVol'];
    state.activeGroupSpeakers = spksInGroup;
    if (groupType == 'group') {
      groupCmd = createGroupCommandMain(groupName, spksInGroup, mainSpkMAC, speakerName);
    } else {
      groupCmd = createSurrCommandMain(groupName, spksInGroup, mainSpkMAC, speakerName, mainSpkLoc, mainSpkChVol);
    }
    const i = 1;
    while (i < spksInGroup) {
      const spkId = `subSpk_${i}`;
      i = i + 1;
      const spkData = groupData[spkId];
      const subSpkDNI = spkData['spkDNI'];
      const subSpkIP = parent.getIP(subSpkDNI);
      const subSpkMAC = spkData['spkMAC'];
      const subSpkDefVol = spkData['spkDefVol'];
      const subSpkLoc = spkData['spkLoc'];
      const subSpkChVol = spkData['spkChVol'];
      if (groupType == 'group') {
        subCmdStr = createGroupCommandSub(subSpkIP, subSpkMAC);
      } else {
        subCmdStr = createSurrCommandSub(subSpkIP, subSpkMAC, subSpkLoc);
      }
      groupCmd = groupCmd + subCmdStr;
      parent.sendCmdToSpeaker(subSpkDNI, 'SetVolume', subSpkDefVol);
      parent.sendCmdToSpeaker(subSpkDNI, 'SetChVolMultich', subSpkChVol);
      parent.sendCmdToSpeaker(subSpkDNI, 'GetFunc', '', '');
      parent.sendCmdToSpeaker(subSpkDNI, 'setSpkType', 'sub', '');
    }
    this.sendCmd(groupCmd);
    this.setLevel(mainSpkDefVol);
    this.SetChVolMultich(mainSpkChVol);
    state.groupName = groupName;
    state.spkType = 'main';
    // todo
    this.emit('groupPsTitle', groupName);
    this.emit('selSpkName', 'Toggle Group');
    this.runIn(1, this.refresh);
  }

  getSubSpeakerData(mainSpkMAC, mainSpkDNI) {
    state.spkType = 'sub';
    state.mainSpkDNI = mainSpkDNI;
    state.mainSpkMAC = mainSpkMAC;
    this.sendCmd(COMMANDS.GetMainInfo);
  }

  rxDataFromSM(speakerData) {
    const groupPs = state.currentGroupPs;
    const data = state[groupPs_Data];
    const spksInGroup = data['spksInGroup'];
    state.subSpkNo = state.subSpkNo + 1;
    const subSpkNo = state.subSpkNo;
    const subSpkId = `subSpk_${subSpkNo}`;
    data[subSpkId] = speakerData;
    const groupName = data['groupName'];
    const preset = state.currentGroupPs;
    if (spksInGroup - 1 === subSpkNo) {
      // todo
      this.emit('preset', groupName);
      state.activeGroupPs = preset;
      state.groupName = groupName;
      state.activeGroupSpeakers = spksInGroup;
      this.emit('groupPsTitle', groupName);
      this.emit('selSpkName', 'Toggle Group');
      this.runIn(2, this.GetAcmMode);
      this.runIn(4, this.refresh);
    }
  }

  armGroupPsOff() {
    this.runIn(10, this.unArmGroupPsOff);
    // todo
    this.emit('groupPsTitle', 'armed');
  }

  groupPsOff() {
    this.unschedule('unArmGroupPsOff');
    const preset = state.activeGroupPs;
    const groupData = state[preset_Data];
    const groupName = groupData['groupName'];
    this.sendCmd(COMMANDS.SetUngroup);
    this.sendCmd(COMMANDS.SetChVolMultich('0'));
    const spksInGroup = state.activeGroupSpeakers;
    const i = 1;
    while (i < spksInGroup) {
      const spkId = `subSpk_${i}`;
      i = i + 1;
      const spkData = groupData[spkId];
      const subSpkDNI = spkData['spkDNI'];
      const subSpkChVol = '0';
      parent.sendCmdToSpeaker(subSpkDNI, 'SetChVolMultich', subSpkChVol, 'generalResponse');
      parent.sendCmdToSpeaker(subSpkDNI, 'setSpkType', 'solo', '');
      parent.sendCmdToSpeaker(subSpkDNI, 'off', '', '');
    }
    state.spkType = 'solo';
    // todo
    this.emit('selSpkName', STATUS.INACTIVE);
    this.emit('groupPsTitle', STATUS.INACTIVE);
    this.emit('selSpkVol', 0);
    this.emit('selSpkEqLevel', 0);
    state.activeGroupPs = null;
    this.runIn(2, this.refresh);
  }

  unArmGroupPsOff() {
    const preset = state.activeGroupPs;
    const groupData = state[preset_Data];
    const groupName = groupData['groupName'];
    /// todo
    this.emit('groupPsTitle', groupName);
  }

  setGroupMasterVolume(masterVolume) {
    if (state.activeGroupPs == null) {
      this.log('setGroupMasterVolume: Function not available, no Group active.');
      throw new Error('setGroupMasterVolume: Function not available, no Group active.');
    }
    this.setLevel(masterVolume);
    const spksInGroup = state.activeGroupSpeakers;
    const preset = state.activeGroupPs;
    const groupData = state[preset_Data];
    const i = 1;
    const oldMastVol = device.currentValue('masterVolume');
    const mastVolIncrement = masterVolume - oldMastVol;
    while (i < spksInGroup) {
      const spkId = `subSpk_${i}`;
      i = i + 1;
      const spkData = groupData[spkId];
      const subSpkDNI = spkData['spkDNI'];
      parent.sendCmdToSpeaker(subSpkDNI, 'setSubSpkVolume', mastVolIncrement);
    }
  }

  setSubSpkVolume(mastVolIncrement) {
    const oldLevel = device.currentValue('level');
    const newLevel = oldLevel + mastVolIncrement;
    if (newLevel < 10) {
      newLevel = 10;
    }
    this.setLevel(newLevel);
  }

  toggleGroupSpk() {
    const spksInGroup = state.activeGroupSpeakers;
    const selSpkNo = state.selSpkNo + 1;
    const selSpkId = '';
    let selSpkVol;
    let selSpkEqLevel;
    if (selSpkNo + 1 > spksInGroup || selSpkNo === 0) {
      selSpkNo = 0;
      selSpkId = 'main';
    } else {
      selSpkId = `subSpk_${selSpkNo}`;
    }
    state.selSpkNo = selSpkNo;
    state.selSpkId = selSpkId;
    const preset = state.activeGroupPs;
    const groupData = state[preset_Data];
    const spkData = groupData[selSpkId];
    const selSpkName = spkData['spkName'];
    state.selSpkDNI = spkData['spkDNI'];
    if (selSpkId === 'main') {
      selSpkVol = device.currentValue('level');
      selSpkEqLevel = state.MultiChVol;
    } else {
      selSpkVol = parent.getDataFromSpeaker(state.selSpkDNI, 'getSpkVolume');
      selSpkEqLevel = parent.getDataFromSpeaker(state.selSpkDNI, 'getSpkEqLevel');
    }
    // todo
    this.emit('selSpkName', selSpkName);
    this.emit('selSpkVol', selSpkVol);
    this.emit('selSpkEqLevel', selSpkEqLevel);
  }

  getSpkVol() {
    const spkVol = device.currentValue('level');
    return spkVol;
  }

  getSpkEqLevel() {
    const spkEqVol = state.MultiChVol;
    return spkEqVol;
  }

  setSelSpkVol(selSpkVol) {
    const selSpkId = state.selSpkId;
    const selSpkDNI = state.selSpkDNI;
    if (state.activeGroupPs == null) {
      this.log(`${device.label}_setSelSpkVol: Function not available, no Group active.`);
      throw new Error('setSelSpkVol: Function not available, no Group active.');
    } else if (selSpkId === 'main') {
      this.setLevel(selSpkVol);
    } else {
      parent.sendCmdToSpeaker(selSpkDNI, 'SetVolume', selSpkVol);
    }
    // todo
    this.emit('selSpkVol', selSpkVol);
  }

  setSelSpkEqLevel(selSpkEqLevel) {
    if (state.activeGroupPs == null) {
      this.log(`${device.label}_setSelSpkEqLevel: Function not available, no Group active.`);
      throw new Error('setSelSpkEqLevel: Function not available, no Group active.');
    }
    const selSpkId = state.selSpkId;
    const selSpkDNI = state.selSpkDNI;
    if (selSpkId === 'main') {
      this.sendCmd(COMMANDS.SetChVolMultich(selSpkEqLevel));
    } else {
      parent.sendCmdToSpeaker(selSpkDNI, 'SetChVolMultich', selSpkEqLevel);
    }
    // todo
    this.emit('selSpkEqLevel', selSpkEqLevel);
  }

  setSpkType(type) {
    state.spkType = type;
  }

  //	==============================================
  //	===== Play Content from players and DLNA =====
  //	==============================================
  playContent(preset) {
    const { contentType, player, playerNo, title } = preset;
    this.log(`playContent ${title} on ${player}.`);
    switch (player) {
      case 'Amazon':
        this.sendCmd(COMMANDS.SetSelectAmazonCp);
        break;
      case 'TuneIn':
        this.sendCmd(COMMANDS.SetSelectRadio);
        break;
      default:
        this.sendCmd(COMMANDS.SetCpService(playerNo));
        break;
    }
  }

  getAlbumArt() {
    if (typeof image_url === 'string') {
      if (image_url.startsWith('https://')) {
        this.image.setUrl(image_url);
        this.image.update().catch(this.error);
      } else {
        if (this.image.setStream) {
          this.image.setStream(async stream => {
            const res = await fetch(image_url);
            if (!res.ok) throw new Error(res.statusText);
            return res.body.pipe(stream);
          });
        } else {
          this.image.setBuffer(async () => {
            const res = await fetch(image_url);
            if (!res.ok) throw new Error(res.statusText);
            return res.buffer();
          });
        }
        this.image.update().catch(this.error);
      }
    } else {
      this.image.setUrl(null);
      this.image.update().catch(this.error);
    }
  }

  //	=======================================
  //	===== Content Information Methods =====
  //	=======================================
  setTrackDescription() {
    // this.unschedule('setTrackDesciption');
    const submode = state.subMode;
    const source = this.speaker.inputSource;
    if (source !== SOURCES.WIFI) {
      // todo
      this.setCapabilityValue('trackDescription', source);
      this.log(`setTrackDescription: Updated trackDesciption to ${source}`);
      this.setCapabilityValue('speaker_shuffle', STATUS.INACTIVE);
      this.setCapabilityValue('speaker_repeat', STATUS.INACTIVE);
    } else {
      switch (submode) {
        case MODE.DLNA:
          this.sendCmd(COMMANDS.GetMusicInfo);
          break;
        case MODE.CP:
          this.sendCmd(COMMANDS.GetRadioInfo);
          break;
        case 'device':
          // todo
          this.emit('trackDescription', `WiFi ${submode}`);
          this.log(`setTrackDescription: Updated trackDesciption to WiFi ${submode}`);
          state.updateTrackDescription = 'no';
          this.setCapabilityValue('speaker_shuffle', STATUS.INACTIVE);
          this.setCapabilityValue('speaker_repeat', STATUS.INACTIVE);
          this.sendCmd(COMMANDS.GetAcmMode); //	Determine what data is here and how to parse and use.
          break;
        default:
          // todo
          this.emit('trackDescription', `WiFi (${submode})`);
          this.log(`setTrackDescription: Updated trackDesciption to WiFi ${submode}`);
          state.updateTrackDescription = 'no';
          this.setCapabilityValue('speaker_shuffle', STATUS.INACTIVE);
          this.setCapabilityValue('speaker_repeat', STATUS.INACTIVE);
      }
    }
  }

  getPlayTime() {
    const update = state.updateTrackDescription;
    if (update === 'no') {
      this.log('getPlayTime: schedSetTrackDescription turned off');
      return;
    } else {
      this.sendCmd(COMMANDS.GetCurrentPlayTime);
    }
  }

  schedSetTrackDescription(playtime) {
    let nextUpdate;
    if (state.trackLength === null || state.trackLength === 0) {
      state.updateTrackDescription = 'no';
      this.log('schedSetTrackDescription: Track Description will not update.');
      return;
    } else {
      nextUpdate = state.trackLength - playtime + 3;
    }
    this.runIn(nextUpdate, this.setTrackDescription);
    this.log(`schedSetTrackDescription: Track Description will update in ${nextUpdate} seconds`);
  }

  //	======================================
  //	===== Play external URI Commands =====
  //	======================================
  playTextAndRestore(text, volume = null) {
    this.playTextAsVoiceAndRestore(text, volume);
  }

  playTextAndResume(text, volume = null) {
    this.playTextAsVoiceAndResume(text, volume);
  }

  playTextAsVoiceAndRestore(text, volume = null, voice = null) {
    if (state.spkType === 'sub') {
      //	If a subspeaker in group, send to the Main speaker.
      this.log('playTextAsVoiceAndRestore: Subspeaker sending playTextAsVoiceAndResume to Main Group Speaker.');
      parent.sendCmdToMain(state.mainSpkDNI, 'playTextAsVoiceAndRestore', text, volume, voice, '');
    } else {
      state.resumePlay = '0';
      this.playTextAsVoiceAndResume(text, volume, voice);
    }
  }

  playTextAsVoiceAndResume(text, volume = null, voice = null) {
    if (!voice) {
      voice = state.ttsVoice;
    }
    const swType = this.speaker.swType;
    if (state.spkType === 'sub') {
      //	If a subspeaker in group, send to the Main speaker.
      this.log('playTextAsVoiceAndResume: Subspeaker sending playTextAsVoiceAndResume to Main Group Speaker.');
      parent.sendCmdToMain(state.mainSpkDNI, 'playTextAsVoiceAndResume', text, volume, voice, '');
    } else if (swType === SOFTWARE.SOUNDPLUS) {
      const uriText = URLEncoder.encode(text, 'UTF-8').replaceAll(/\+/, '%20');
      const trackUrl = `http://api.voicerss.org/?key=${ttsApiKey}&f=48khz_16bit_stereo&hl=${state.ttsLanguage}&src=${uriText}`;
      const duration = Math.max(Math.round(text.length() / 12), 2);
      this.playTrackAndResume(trackUrl, parseInt(duration) + 1, volume);
    } else {
      const sound = this.textToSpeech(text, voice);
      const trackUrl = sound.uri;
      duration = sound.duration;
      this.playTrackAndResume(trackUrl, parseInt(duration) + 1, volume);
    }
  }

  playTrack(trackUri, volume = null) {
    this.log('NOT SUPPORTED');
  }

  playTrackAndRestore(trackUrl, duration, volume = null) {
    if (state.spkType === 'sub') {
      // TODO	If a subspeaker in group, send to the Main speaker.
      this.log(`playTrackAndRetore: Subspeaker sending Audio Notification / TTS to Main.`);
      parent.sendCmdToMain(state.mainSpkDNI, 'playTrackAndRestore', uri, duration, volume, '');
    } else {
      state.resumePlay = STATUS.ZEROINT;
      this.playTrackAndResume(trackUrl, duration, volume);
    }
  }

  playTrackAndResume(trackUrl, duration, volume = null) {
    const { inputSource, deviceSoftware } = this.speaker;
    if (state.spkType === 'sub') {
      // todo	If a subspeaker in group, send to the Main speaker.
      this.log('playTrackAndResume: Subspeaker sending Audio Notification to Main Group Speaker.');
      parent.sendCmdToMain(state.mainSpkDNI, 'playTrackAndResume', trackUrl, duration, volume, '');
    } else {
      this.log(`playTrackAndResume(${trackUrl}, ${duration}, ${volume}) on the Speaker`);
      const newLevel = volume;
      if (newLevel) {
        this.setLevel(newLevel);
      }
      if (state.resumePlay === '1') {
        const subMode = state.subMode;
        const oldLevel = this.speaker.level;
        const delayTime = duration + 2;
        this.runIn(delayTime, resumeHwPlayer, {
          level: oldLevel,
          inputsource: inputSource,
          submode: subMode,
        });
      }
      if (deviceSoftware === SOFTWARE.SOUNDPLUS) {
        state.resumePlay = STATUS.ONEINT;
        let result = [];
        // result << sendUpnpCmd("SetAVTransportURI", [InstanceID: 0, CurrentURI: trackUrl, CurrentURIMetaData: ""])
        // result << sendUpnpCmd("Play")
        // result
      } else {
        this.sendCmd(COMMANDS.SetUrlPlayback(trackUrl, state.resumePlay));
        state.resumePlay = '1';
      }
    }
  }

  resumeHwPlayer(data) {
    //	Soundbar only.  Restore player after playing url.
    this.log(`resumeHwPlayer: Restoring playback using ${data}`);
    this.setLevel(data.level);
    if (data.inputsource === SOURCES.WIFI) {
      if (data.submode === MODE.CP) {
        this.playContent('restore');
      } else if (data.submode === MODE.DLNA) {
        this.sendCmd(COMMANDS.uic_SetPlaybackControl('resume'));
      }
    } else {
      this.sendCmd(COMMANDS.SetFunc(data.inputsource));
    }
    this.runIn(2, this.play);
  }

  async sendCmd(command, action) {
    // this.log(command, action);
    try {
      const result = await fetch(`http://${this.speaker.address}:${PORT}/${command}`);
      const xml = await result.text();
      const data = convert.xml2js(xml, { compact: true, ignoreDeclaration: true, trim: true });
      const { response, method, _attributes } = data.UIC;
      this.log('DATA', method, _attributes);
      this.doAction(method._text, response);
    } catch (error) {
      this.log(`sendCmd ${error}`);
      throw new Error(error);
    }
  }

  doAction(action, response) {
    if (!response) return;
    const { cpname } = response;
    switch (action) {
      //	----- SOUNDBAR STATUS METHODS -----
      case 'PowerStatus':
        const { powerStatus } = response;
        if (powerStatus === STATUS.ZEROINT) {
          this.setCapabilityValue('onoff', false);
        } else {
          this.setCapabilityValue('onoff', true);
        }
        break;
      case 'CurrentFunc':
        if (response.submode === 'dmr') {
          //	Ignore dmr encountered during TTS
          this.log(`${command}:  Encountered submode DMR.`);
          return;
        } else if (response.function !== this.speaker.inputSource || response.submode !== state.subMode) {
          this.setCapabilityValue('onoff', true);
          this.setCapabilityValue('inputSource', response.function);
          this.setStoreValue('submode', response.submode);
        }
        break;
      case 'VolumeLevel':
        volume = parseInt((100 * response.volume) / this.speaker.volumeScale);
        this.setCapabilityValue('volume_set', level);
        // this.emit('masterVolume', level);
        break;
      case 'MuteStatus':
        if (response.mute === STATUS.ON) {
          // this.emit('mute', 'muted');
          this.setCapabilityValue('volume_mute', 'muted');
        } else {
          //this.emit('mute', 'unmuted');
          this.setCapabilityValue('volume_mute', 'unmuted');
        }
        break;
      case '7BandEQList':
        this.cmdEqPreset(response.listcount);
        break;
      case 'EQMode':
      case 'EQDrc':
        this.sendCmd(COMMANDS.GetCurrentEQMode);
        break;
      case '7bandEQMode':
      case 'CurrentEQMode':
        this.setCapabilityValue('eqPreset', response.presetname);
        this.setStoreValue('currentEqPreset', response.presetindex);
        break;
      case 'RearLevel':
        this.setStoreValue('rearLevel', response.level);
        break;
      //	----- MEDIA CONTROL STATUS METHODS -----
      case 'PlayStatus':
      case 'PlaybackStatus':
        let playerStatus;
        const prevStatus = this.speaker.status;
        switch (response.playstatus) {
          case 'play':
            playerStatus = STATUS.PLAYING;
            break;
          case 'pause':
            playerStatus = STATUS.PAUSED;
            break;
          case 'stop':
            playerStatus = STATUS.STOPPED;
            break;
          default:
            break;
        }
        this.setCapabilityValue('status', playerStatus);
        if (playerStatus === STATUS.PLAYING) {
          this.createPresetrunIn(5, this.getPlayTime());
        }
        break;
      case 'RepeatMode':
        const submode = this.getStoreValue('submode');
        if (submode === MODE.DLNA) {
          if (response.repeat === STATUS.ONE) {
            this.setCapabilityValue('speaker_repeat', '1');
          } else {
            this.setCapabilityValue('speaker_repeat', '0');
          }
        } else if (submode === MODE.CP) {
          this.setCapabilityValue('speaker_repeat', response.repeatmode);
        }
        break;
      case 'ShuffleMode':
        if (response.shuffle === STATUS.ON) {
          this.setCapabilityValue('speaker_shuffle', STATUS.ONEINT);
        } else {
          this.setCapabilityValue('speaker_shuffle', STATUS.ZEROINT);
        }
        break;
      case 'ToggleShuffle':
        this.setCapabilityValue('speaker_shuffle', response.shufflemode);
        break;
      //	----- MUSIC INFORMATION METHODS
      case 'MusicInfo':
        const { timelength } = response;
        if (timelength === '' || timelength === null) {
          state.updateTrackDescription = 'no';
          state.trackLength = 0;
        } else {
          state.updateTrackDescription = 'yes';
          //state.trackLength = timeLength[-5..-4].toInteger() * 60 + timeLength[-2..-1].toInteger()
        }

        if (response === 'No Music' || response.errCode === 'fail to play') {
          // todo
          this.emit('trackDescription', 'WiFi DLNA not playing');
          this.setCapabilityValue('speaker_shuffle', STATUS.ZEROINT);
          return;
        } else {
          // this.emit('trackDescription', `${response.title}\n\r${response.artist}`);
          this.setCapabilityValue('speaker_track', response.title);
          this.setCapabilityValue('speaker_artist', response.artist);
        }
        this.getPlayTime();
        break;
      case 'RadioInfo':
        if (response.tracklength === '' || response.tracklength === '0') {
          state.trackLength = 0;
          state.updateTrackDescription = 'no';
        } else {
          state.trackLength = response.tracklength;
          state.updateTrackDescription = 'yes';
        }
        if (cpname === 'Unknown') {
          // todo
          this.emit('trackDescription', 'Unknown Player');
        } else if (cpname === 'Pandora' && state.trackLength === 0) {
          //	Special code to handle Pandora Commercials (reported at 0 length)
          // todo
          // this.emit('trackDescription', 'Commercial');
          this.setCapabilityValue('speaker_track', 'Commercial');
          state.trackLength = 30;
        } else if (cpname === 'Amazon' || cpname === 'AmazonPrime' || cpname === 'Pandora' || cpname === '8tracks') {
          // this.emit('trackDescription', `${respData.artist}: ${respData.title}`);
          this.setCapabilityValue('speaker_track', response.title);
          this.setCapabilityValue('speaker_artist', response.artist);
        } else {
          this.setCapabilityValue('speaker_track', response.title);
        }

        if (response.shufflemode === '') {
          this.setCapabilityValue('speaker_shuffle', STATUS.INACTIVE);
        } else {
          this.setCapabilityValue('speaker_shuffle', response.shufflemode);
        }
        if (response.repeatmode === '') {
          this.setCapabilityValue('speaker_repeat', STATUS.INACTIVE);
        } else {
          this.setCapabilityValue('speaker_repeat', response.repeatmode);
        }
        this.log(`${command}: Track Description is ${this.speaker.trackDescription}`);
        this.getPlayTime();
        break;
      case 'MusicPlayTime':
        if (response.playtime !== '' && response.playtime !== null) {
          this.schedSetTrackDescription(response.playtime);
        } else {
          this.log(`${command}: Null playtime ignored. schedUpdateTrackDescription not called.`);
        }
        break;
      //	----- PLAY PRESET METHODS
      case 'CpChanged':
        const presetData = state[state.currentPreset]._Data;
        const path = presetData.path;
        if (cpname === 'AmazonPrime') {
          if (path === 'Playlists') {
            this.sendCmd(COMMANDS.SetSelectCpSubmenu(1, 'searchRadioList'));
          } else if (path === 'Prime Stations') {
            this.sendCmd(COMMANDS.SetSelectCpSubmenu(2, 'searchRadioList'));
          } else if (path === 'My Music') {
            this.sendCmd(COMMANDS.SetSelectCpSubmenu(6, 'searchRadioList'));
          }
        } else if (cpname === 'Pandora') {
          //	Added to support pandora problem in latest firmware
          this.sendCmd(COMMANDS.BrowseMain('searchRadioList'));
        } else {
          const playerState = state.restore_Data;
          this.sendCmd(COMMANDS.PlayById(playerState.player, playerState.path));
          this.runIn(15, this.sendCmd(COMMANDS.GetRadioInfo));
        }
        break;
      case 'RadioSelected':
        const playerState = state.restore_Data;
        this.sendCmd(COMMANDS.PlayById(playerState.player, playerState.path));
        this.sendCmd(COMMANDS.cpm_SetPlaybackControl('play'));
        this.runIn(10, this.cpPlay());
        this.runIn(15, this.GetRadioInfo());
        break;
      case 'AmazonCpSelected':
        this.sendCmd(COMMANDS.SetSelectCpSubmenu(1, 'searchRadioList'));
        break;
      //	----- GROUP METHODS
      case 'GroupName':
        const { groupName } = response;
        if (groupName === '' || groupName === 'Group 0') {
          this.log(`${command}: Not a group speaker.`);
          return;
        }
        const groupPs = state.currentGroupPs;
        const data = state[groupPs]._Data;
        data['groupName'] = groupName;
        this.sendCmd(COMMANDS.GetMainInfo);
        break;
      case 'MainInfo':
        const { groupmainmacaddr, channeltype, channelvolume } = response;
        if (groupmainmacaddr === '00:00:00:00:00:00') {
          return; //	Speakers are not in a group
        } else if (groupmainmacaddr !== state.mainSpkMAC) {
          return;
        }
        this.sendCmd(COMMANDS.GetVolume);
        const speakerData = [];
        const deviceDNI = device.deviceNetworkId;
        speakerData['spkName'] = device.name;
        speakerData['spkDNI'] = deviceDNI;
        speakerData['spkMAC'] = this.speaker.deviceMac;
        speakerData['spkLoc'] = channeltype;
        speakerData['spkChVol'] = channelvolume;
        const spkDefVol = device.currentValue('level');
        speakerData['spkDefVol'] = spkDefVol;
        if (state.spkType === 'sub') {
          const mainSpkDNI = state.mainSpkDNI;
          parent.sendDataToMain(mainSpkDNI, speakerData);
        } else {
          const groupPs = state.currentGroupPs;
          const data = state[groupPs]._Data;
          if (response.groupmode === 'aasync') {
            data['groupType'] = 'group';
          } else {
            data['groupType'] = 'surround';
          }
          data['spksInGroup'] = response.groupspknum;
          data['main'] = speakerData;
          parent.requestSubSpeakerData(deviceMac, deviceDNI);
        }
        break;
      case 'ChVolMultich':
        state.MultiChVol = response.channelvolume;
        break;
      case 'AcmMode':
        const sourceMac = response.audiosourcemacaddr;
        if (this.speaker.deviceMac === sourceMac) {
          const groupName = state.groupName;
        }
        break;
      case 'SkipInfo':
      case 'ErrorEvent':
        this.log(`Speaker Error: ${command} : ${response}`);
        this.sendCmd(COMMANDS.NEXTMESSAGE);
        throw new error('ERROR');
      case 'SelectCpService':
      case 'RadioList':
      case 'SubMenu':
      case 'Ungroup':
      case 'RadioPlayList':
      case 'MultispkGroup':
      case 'SoftwareVersion':
      case 'RequestDeviceInfo':
      case 'MultispkGroupStartEvent':
      case 'StartPlaybackEvent':
      case 'MediaBufferStartEvent':
      case 'StopPlaybackEvent':
      case 'EndPlaybackEvent':
      case 'MediaBufferEndEvent':
      case 'PausePlaybackEvent':
        this.runIn(3, this.getPlayStatus);
        break;
      default:
        this.log(`${command}: Data: ${response}`);
        break;
    }
  }

  unschedule() {
    return false;
  }

  runIn(delay, callback) {
    let timer = 0;
    let reject = null;
    const promise = new Promise((resolve, _reject) => {
      reject = _reject;
      timer = setTimeout(resolve, delay, callback);
    });
    return {
      get promise() {
        return promise;
      },
      cancel() {
        if (timer) {
          clearTimeout(timer);
          timer = 0;
          reject();
          reject = null;
        }
      },
    };
  }

  // this method is called when the Device is added
  onAdded() {
    this.log('device added');
    this.log('name:', this.getName());
    this.log('class:', this.getClass());
    this.log('data', this.getData());
  }

  onRenamed(name) {
    this.log('new name', name);
  }
}

module.exports = SamsungMultiroomDevice;
