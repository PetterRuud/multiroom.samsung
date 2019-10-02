'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');
const { guid, getTimestamp } = require('./utils');
const { PORT } = require('../constants');

class MultiroomDriver extends Homey.Driver {
  onInit() {}

  async get(ip_speaker) {
    Homey.ManagerSettings.set('ip_speaker', ip_speaker);
    Homey.ManagerSettings.set('port', PORT);

    try {
      const response = await fetch(`http://${iip_speakerp}:${PORT}`, {
        headers: {
          HOST: `http://${ip_speaker}:${PORT}`,
        },
      });
      if (response.ok) {
        const token = await response.json();
        Homey.ManagerSettings.set('token', token);
        return token;
      }
      return new Error('no_token');
    } catch (error) {
      throw new Error(error);
    }
  }

  async getDevices(_, callback) {
    const token = Homey.ManagerSettings.get('token');
    const timestamp = getTimestamp(new Date());

    try {
      const response = await fetch(`${LIST_URL}?format=json&timestamp=${timestamp}&token=${token}`, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      if (response.ok) {
        const result = await response.json();
        let devices = [];
        result.forEach(function(speaker) {
          const { device } = speaker;
          devices.push({
            name: device.name,
            data: {
              name: device.name,
              id: device.id,
              is_on: device.state,
              volume_level: device.volume_level,
              ip: device.ip,
              supported: speaker.isSupport,
              uri: speaker.uri,
              type: speaker.type,
            },
          });
        });
        return callback(devices);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async onPair(socket) {
    socket.on('login', async (data, callback) => {
      if (data.ip === '') return callback(null, false);
      await this.getToken(data.username, data.password);
      callback(null, true);
    });

    socket.on('list_devices', async (data, callback) => {
      await this.getDevices('devices', function(devices) {
        callback(null, devices);
      });
    });

    socket.on('add_device', (device, callback) => {});
  }
}

module.exports = MultiroomDriver;
