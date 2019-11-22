'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');
const { matchBetweenTags } = require('./utils');
const { PORT, HARDWARE, SOFTWARE } = require('../constants');
const { COMMANDS } = require('./commands');
const convert = require('xml-js');
class SamsungMultiroomDriver extends Homey.Driver {
  onInit() {
    this.devices = [];
    const discoveryStrategy = Homey.ManagerDiscovery.getDiscoveryStrategy('samsung');
    discoveryStrategy.on('result', this.onDiscoveryResult.bind(this));
  }

  onDiscoveryResult(discoveryResult) {
    fetch(discoveryResult.headers.location)
      .then(async response => {
        if (!response.ok) throw new Error(response.statusText);

        const body = await response.text();

        const manufacturer = matchBetweenTags('manufacturer', body);
        if (manufacturer !== 'Samsung Electronics') return;
        const modelName = matchBetweenTags('modelName', body);
        const udn = matchBetweenTags('UDN', body).replace('uuid:', '');
        const deviceSoftware = await this.getDeviceSoftware(discoveryResult.address);
        const name = await this.getDeviceName(discoveryResult.address);
        const deviceType = modelName.substring(0, 2) === 'HW' ? HARDWARE.SOUNDBAR : HARDWARE.SPEAKER;
        // todo already exists then just overwrite

        const device = {
          udn,
          manufacturer,
          deviceType,
          modelName,
          name,
          deviceSoftware,
          address: discoveryResult.address,
          friendlyName: matchBetweenTags('friendlyName', body),
          modelNumber: matchBetweenTags('modelNumber', body),
          deviceId: matchBetweenTags('sec:deviceID', body),
        };
        this.devices.push(device);

        this.emit(`device:${device.udn}`, device);
        this.log(`Found device [${device.udn}] ${device.name} @ ${device.address}`);
      })
      .catch(this.error);
  }

  onPairListDevices(data, callback) {
    const devices = this.devices.map(device => {
      return {
        name: device.name || device.modelName || device.friendlyName,
        data: {
          id: device.udn,
          name: device.name,
          friendlyName: device.friendlyName,
          modelName: device.modelName,
          address: device.address,
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          deviceSoftware: device.deviceSoftware,
          volumeScale: device.deviceSoftware === SOFTWARE.SOUNDPLUS ? 60 : 30,
        },
      };
    });
    return callback(null, devices);
  }

  async getDevice(id) {
    const device = this.devices.find(device => device.udn === id);
    try {
      const response = await fetch(`http://${device.address}:${PORT}/${COMMANDS.GetMainInfo}`);
      const xml = await response.text();
      const result = convert.xml2js(xml, { compact: true, ignoreDeclaration: true, trim: true });
      return result;
    } catch (error) {
      this.log(error);
      throw new Error(error);
    }
  }

  async getDeviceName(address) {
    try {
      const response = await fetch(`http://${address}:${PORT}/${COMMANDS.GetSpkName}`);
      //if (!response.ok) throw new Error(response.statusText);
      const xml = await response.text();
      const result = convert.xml2js(xml, { compact: true, ignoreDeclaration: true, trim: true });
      return result.UIC.response.spkname._cdata;
    } catch (error) {
      this.log(error);
      throw new Error(error);
    }
  }

  async getDeviceSoftware(address) {
    try {
      const response = await fetch(`http://${address}:${PORT}/${COMMANDS.GetSoftwareVersion}`);
      //if (!response.ok) throw new Error(response.statusText);
      const xml = await response.text();
      const result = convert.xml2js(xml, { compact: true, ignoreDeclaration: true, trim: true });
      return result.UIC.response.version._text.substring(-6, -5) === 11 ? SOFTWARE.SOUNDPLUS : SOFTWARE.STANDARD;
    } catch (error) {
      this.log(error);
      throw new Error(error);
    }
  }
}

module.exports = SamsungMultiroomDriver;
