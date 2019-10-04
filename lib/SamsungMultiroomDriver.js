'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');
const { matchBetweenTags, getTimestamp } = require('./utils');
const { PORT } = require('../constants');
class SamsungMultiroomDriver extends Homey.Driver {
  onInit() {
    this.devices = [];

    const discoveryStrategy = Homey.ManagerDiscovery.getDiscoveryStrategy('samsung');
    discoveryStrategy.on('result', this.onDiscoveryResult.bind(this));
  }

  onDiscoveryResult(discoveryResult) {
    fetch(discoveryResult.headers.location)
      .then(async res => {
        if (!res.ok) throw new Error(res.statusText);

        const body = await res.text();

        const manufacturer = matchBetweenTags('manufacturer', body);
        if (manufacturer !== 'Samsung Electronics') return;

        const udn = matchBetweenTags('UDN', body).replace('uuid:', '');

        // todo already exists then just overwrite

        const device = {
          udn,
          manufacturer,
          address: discoveryResult.address,
          friendlyName: matchBetweenTags('friendlyName', body),
          modelName: matchBetweenTags('modelName', body),
          modelNumber: matchBetweenTags('modelNumber', body),
          deviceId: matchBetweenTags('DeviceID', body),
          wlanMac: matchBetweenTags('wlanMac', body),
        };
        this.devices.push(device);

        this.emit(`device:${device.udn}`, device);
        this.log(`Found device [${device.udn}] ${device.friendlyName} @ ${device.address}`);
      })
      .catch(this.error);
  }

  onPairListDevices(data, callback) {
    const devices = this.devices.map(device => {
      return {
        name: device.friendlyName || device.modelName,
        data: {
          id: device.udn,
          modelName: device.modelName,
          address: device.address,
        },
      };
    });
    return callback(null, devices);
  }

  async getDevice(id) {
    const device = this.devices.find(device => device.udn === id);
    // todo if device
    try {
      const response = await fetch(`http://${device.address}:${PORT}`);
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = SamsungMultiroomDriver;
