// --------------- fs Declarations
const fs = require("fs");

module.exports = {
  name: 'config',
  description: 'Configure the bot',
  async initializeConfig(client) {
    try {
      const configFile = fs.readFileSync('./config/server-config.json', 'utf8');
      const configJson = JSON.parse(configFile);

      for (let configServerId in configJson) {
        if (Object.prototype.hasOwnProperty.call(client.botConfig, configServerId)) {
          client.logger.info("Re-loading config for server " + configServerId);
          client.botConfig[configServerId] = configJson[configServerId];
        } else {
          client.logger.info("Loading config for server " + configServerId);
          client.botConfig[configServerId] = configJson[configServerId];
        }
        client.logger.debug("config loaded: " + JSON.stringify(client.botConfig[configServerId]));
      }
    } catch (err) {
      client.logger.error("Error loading config file: " + err);
    }
  }
};
