'use strict';

const Homey = require('homey');

class SamsungMultiroomApp extends Homey.App {
  onInit() {
    this.log('Samsung multiroom app is running...');
  }
}

module.exports = SamsungMultiroomApp;
