'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');
const { matchBetweenTags, getTimestamp } = require('./utils');
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
      .then(async res => {
        if (!res.ok) throw new Error(res.statusText);

        const body = await res.text();

        const manufacturer = matchBetweenTags('manufacturer', body);
        if (manufacturer !== 'Samsung Electronics') return;
        const modelName = matchBetweenTags('modelName', body);
        const udn = matchBetweenTags('UDN', body).replace('uuid:', '');

        const deviceType = modelName.substring(0, 2) === 'HW' ? HARDWARE.SOUNDBAR : HARDWARE.SPEAKER;
        // todo already exists then just overwrite

        const device = {
          udn,
          manufacturer,
          deviceType,
          modelName,
          address: discoveryResult.address,
          friendlyName: matchBetweenTags('friendlyName', body),
          modelNumber: matchBetweenTags('modelNumber', body),
          deviceId: matchBetweenTags('sec:deviceID', body),
        };
        this.devices.push(device);

        this.emit(`device:${device.udn}`, device);
        this.log(`Found device [${device.udn}] ${device.modelName} @ ${device.address}`);
      })
      .catch(this.error);
  }

  onPairListDevices(data, callback) {
    const devices = this.devices.map(device => {
      let deviceSoftware;
      let speakerName;
      fetch(`http://${device.address}:${PORT}/${COMMANDS.GetSoftwareVersion}`)
        .then(async response => {
          if (!response.ok) throw new Error(response.statusText);
          const xml = await response.text();
          const json = await convert.xml2json(xml, { compact: true, ignoreDeclaration: true, trim: true });
          console.log(json, '--------', json.UIC);
          deviceSoftware = json.UIC.response.version._text.substring(-6, -5) === 11 ? SOFTWARE.SOUNDPLUS : SOFTWARE.STANDARD;
        })
        .catch(this.error);

      fetch(`http://${device.address}:${PORT}/${COMMANDS.GetSpkName}`)
        .then(async response => {
          if (!response.ok) throw new Error(response.statusText);
          const xml = await response.text();
          const json = convert.xml2json(xml, { compact: true, ignoreDeclaration: true });
          speakerName = json.UIC.response._cdata.spkname;
        })
        .catch(this.error);

      return {
        name: speakerName || device.modelName || device.friendlyName,
        data: {
          id: device.udn,
          friendlyName: device.friendlyName,
          modelName: device.modelName,
          address: device.address,
          deviceId: device.deviceId,
          deviceType: device.deviceType,
          deviceSoftware,
          volumeScale: deviceSoftware === SOFTWARE.SOUNDPLUS ? 60 : 30,
        },
      };
    });
    return callback(null, devices);
  }

  async getDevice(id) {
    const device = this.devices.find(device => device.udn === id);
    try {
      const response = await fetch(`http://${device.address}:${PORT}/${COMMANDS.GetMainInfo}`);
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = SamsungMultiroomDriver;
