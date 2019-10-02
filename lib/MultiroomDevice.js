'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');
const { getTimestamp } = require('./utils');
const { COMMANDS } = require('./commands');
const { SOURCES } = require('../constants');

class MultiroomDevice extends Homey.Device {
  async onAdded() {
    try {
      await this.onInit();
    } catch (error) {
      throw new Error(error);
    }
  }

  onInit() {
    const capabilities = this.getCapabilities();
    this.registerCapabilityListener('speaker_playing', this.onCapabilitySpeakerPlaying.bind(this));
    this.registerCapabilityListener('speaker_prev', this.onCapabilitySpeakerPrev.bind(this));
    this.registerCapabilityListener('speaker_next', this.onCapabilitySpeakerNext.bind(this));
    this.registerCapabilityListener('speaker_shuffle', this.onCapabilitySpeakerShuffle.bind(this));
    this.registerCapabilityListener('speaker_repeat', this.onCapabilitySpeakerRepeat.bind(this));
    this.registerCapabilityListener('volume_set', this.onCapabilityVolumeSet.bind(this));
    this.registerCapabilityListener('volume_mute', this.onCapabilityVolumeMute.bind(this));
    this.getDeviceData(this);
  }

  async getDeviceData(data, callback) {
    const device = this.getData();
    const self = this;
    const timestamp = getTimestamp(new Date());
    const token = Homey.ManagerSettings.get('token');

    try {
      const response = await fetch(`${LIST_URL}?format=json&timestamp=${timestamp}&token=${token}`, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const currentDevice = result.find(function(d) {
          return d.id === device.id;
        });
        const status = currentDevice.status.split(',');

        return;
      }
    } catch (error) {
      throw new Error(error);
    }

    this._cancelTimeout = clearTimeout(this._syncTimeout);
    const updateInterval = this.getSettings().interval;
    const interval = 1000 * 60 * updateInterval;
    this._syncTimeout = setTimeout(this.getDeviceData.bind(this), interval);
  }

  async updateCapabilityValues(capability) {
    // Homey.ManagerSettings.get adds \r for some reason
    const token = Homey.ManagerSettings.get('token').replace(/(\r)/gm, '');
    const device = this.getData();

    try {
      let sensor_id = '01';
      let control_data = {};

      switch (capability) {
        case 'onoff':
          sensor_id = '01';
          control_data = `{%22value%22:%22${this.getCapabilityValue('onoff') === true ? '1' : '0'}%22}`;
          break;
        case 'target_temperature':
          sensor_id = '02';
          control_data = `{%22value%22:%22${this.getCapabilityValue('target_temperature').toFixed(1)}%22}`;
          break;
        case 'mode':
          sensor_id = '12';
          control_data = `{%22value%22:%22${this.modeToValue(this.getCapabilityValue('mode'))}%22}`;
          break;
        case 'away':
          sensor_id = '03';
          control_data = `{%22value%22:%22${this.getCapabilityValue('away') === true ? '1' : '0'}%22}`;
          break;
      }

      const timestamp = getTimestamp(new Date());

      const response = await fetch(
        `${CONTROL_URL}?control_data=${control_data}&device_id=${device.id}&format=json&sensor_id=${sensor_id}&sensor_type=1&timestamp=${timestamp}&token=${token}`,
        {
          method: 'POST',
          headers: {
            'User-Agent': USER_AGENT,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        return result;
      }

      this._syncTimeout = setTimeout(this.getDeviceData.bind(this), 2 * 60 * 1000);
    } catch (error) {
      throw new Error(error);
    }
  }

  /*
   * Capability Listeners
   */
  async onCapabilitySpeakerPlaying(value) {
    const { pid } = this;
    return this.speaker.playerSetPlayState({
      pid,
      state: value ? 'play' : 'pause',
    });
  }

  async onCapabilitySpeakerPrev() {
    const { pid } = this;
    return this.speaker.playerPlayPrevious({
      pid,
    });
  }

  async onCapabilitySpeakerNext() {
    const { pid } = this;
    return this.speaker.playerPlayNext({
      pid,
    });
  }

  async onCapabilitySpeakerShuffle(value) {
    const { pid } = this;
    return this.speaker.playerSetPlayMode({
      pid,
      shuffle: value ? 'on' : 'off',
    });
  }

  async onCapabilitySpeakerRepeat(value) {
    const { pid } = this;

    let repeat;
    if (value === 'none') repeat = 'off';

    if (value === 'track') repeat = 'on_one';

    if (value === 'playlist') repeat = 'on_all';

    if (!repeat) return;

    return this.speaker.playerSetPlayMode({
      pid,
      repeat,
    });
  }

  async onCapabilityVolumeSet(value) {
    const { pid } = this;
    return this.speaker.playerSetVolume({
      pid,
      level: value * 100,
    });
  }

  async onCapabilityVolumeMute(value) {
    const { pid } = this;
    return this.speaker.playerSetMute({
      pid,
      mute: !!value,
    });
  }
}

module.exports = MultiroomDevice;