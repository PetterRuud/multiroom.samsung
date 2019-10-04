'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');
const querystring = require('querystring');
const { getTimestamp, matchBetweenTags, getResult } = require('./utils');
const { COMMANDS } = require('./commands');
const { PORT } = require('../constants');

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

    this.registerCapabilityListener('speaker_playing', this.onCapabilitySpeakerPlaying.bind(this));
    this.registerCapabilityListener('speaker_prev', this.onCapabilitySpeakerPrev.bind(this));
    this.registerCapabilityListener('speaker_next', this.onCapabilitySpeakerNext.bind(this));
    this.registerCapabilityListener('speaker_shuffle', this.onCapabilitySpeakerShuffle.bind(this));
    this.registerCapabilityListener('speaker_repeat', this.onCapabilitySpeakerRepeat.bind(this));
    this.registerCapabilityListener('volume_set', this.onCapabilityVolumeSet.bind(this));
    this.registerCapabilityListener('volume_mute', this.onCapabilityVolumeMute.bind(this));

    this.setAvailable();
  }
  /*
   * Capability Listeners
   */
  async onCapabilitySpeakerPlaying(value) {
    const { address } = this.speaker;
    // todo check maxvolume
    this.log(`http://${address}:${PORT}/${COMMANDS.SetVolume(volume)}`);
    const response = await fetch(`http://${address}:${PORT}/${COMMANDS.SetVolume(volume)}`);
    const body = await response.text();
    if (getResult(body)) {
      return matchBetweenTags('volume', body);
    }
  }

  async onCapabilitySpeakerPrev() {
    const { address } = this.speaker;
    const response = await fetch(`http://${address}:${PORT}/${COMMANDS.previous}`);
    const body = response.text();
    if (getResult(body)) {
      return matchBetweenTags('volume', body);
    }
  }

  async onCapabilitySpeakerNext() {
    const { address } = this.speaker;
    const response = await fetch(`http://${address}:${PORT}/${COMMANDS.previous}`);
    const body = response.text();
    if (getResult(body)) {
      return matchBetweenTags('volume', body);
    }
  }

  async onCapabilitySpeakerShuffle(value) {
    const { address } = this.speaker;
    const response = await fetch(`http://${address}:${PORT}/${COMMANDS.previous}`);
    const body = response.text();
    if (getResult(body)) {
      return matchBetweenTags('volume', body);
    }
  }

  async onCapabilitySpeakerRepeat(value) {
    const { address } = this.speaker;
    const response = await fetch(`http://${address}:${PORT}/${COMMANDS.previous}`);
    const body = response.text();
    if (getResult(body)) {
      return matchBetweenTags('volume', body);
    }
  }

  async onCapabilityVolumeSet(value) {
    const { address } = this.speaker;
    // todo check maxvolume
    const volume = parseInt(value * 100);
    this.log(`http://${address}:${PORT}/${COMMANDS.SetVolume(volume)}`);
    const response = await fetch(`http://${address}:${PORT}/${COMMANDS.SetVolume(volume)}`);
    const body = await response.text();
    if (getResult(body)) {
      return matchBetweenTags('volume', body);
    }
  }

  async onCapabilityVolumeMute(value) {
    const { address } = this.speaker;
    const { mute, unmute } = COMMANDS;

    const response = await fetch(`http://${address}:${PORT}/${value ? mute : unmute}`);
    const body = response.text();
    if (getResult(body)) {
      return matchBetweenTags('mute', body);
    }
  }

  // this method is called when the Device is added
  onAdded() {
    this.log('device added');
    this.log('name:', this.getName());
    this.log('class:', this.getClass());
    this.log('settings', this.getSettings());
    this.log('data', this.getData());
  }
}

module.exports = SamsungMultiroomDevice;
