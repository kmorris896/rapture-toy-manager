require('../');
const nodeFetch = require('node-fetch');
const ms = require('ms');

module.exports = {
  name: 'lovense',
  description: 'Lovense Handler',
  async execute(msg) {
    const re = new RegExp('https://c.lovense.com/(c|v2)/(\\w+)');
    const reMatch = re.exec(msg.cleanContent.toLowerCase());
    const shortUrl = 'https://c.lovense.com/c/' + reMatch[2];

    // Get the SID
    msg.client.logger.info('Got URL: ' + shortUrl);
    const sid = await getSid(shortUrl);
    msg.client.logger.info('SID: ' + sid);
    // msg.reply('Got sid: ' + sid);
    
    // get toys
    const toyData = await getToyInfo(sid);
    msg.client.logger.debug('Got toyData: ' + JSON.stringify(toyData));
    await toyReaction(msg, toyData.toys);
    await timeReaction(msg, toyData.leftTime);
    // msg.reply('Got toys: ' + JSON.stringify(toyData.toys));
    // msg.reply('Got time: ' + toyData.leftTime);
  },
};

async function timeReaction(msg, leftTime) {
  const numberEmoteArray = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
  let reactEmoteArray = [];
  
  if (leftTime === 0) 
    reactEmoteArray.push('♾');
  else if (leftTime < 60) // Less than one minute
    reactEmoteArray.push('1️⃣');
  else {
    let leftTimeMins = parseInt(ms(ms(leftTime + 's')));

    // If the first digit and second digit are the same, add one.
    if ((leftTimeMins > 10) && (leftTimeMins.toString()[0] === leftTimeMins.toString()[1])) 
      leftTimeMins++;
    
    if (leftTimeMins >= 100) // Timers cannot go above 99 minutes.
      leftTimeMins = 98;

    const leftTimeMinsString = leftTimeMins.toString();
    for (let index = 0; index < leftTimeMinsString.length; index++) {
      const digit = parseInt(leftTimeMinsString[index]);
      msg.client.logger.debug('lovense.TimeReaction: parsing ' + digit);

      reactEmoteArray.push(numberEmoteArray[digit]);
    }
  }

  for (let index = 0; index < reactEmoteArray.length; index++) {
    const emote = reactEmoteArray[index];
    await msg.react(emote);
  }

}

async function toyReaction(msg, toyArray) {
  toyArray.forEach(element => {
    // If there is a bot configuration for the server AND 
    // the bot configuration has an emote for the toy
    // and the length of that emote is greater than 0
    if ((Object.prototype.hasOwnProperty.call(msg.client.botConfig, msg.guildId)) &&
        (Object.prototype.hasOwnProperty.call(msg.client.botConfig[msg.guildId].toyEmotes, element)) && 
        (msg.client.botConfig[msg.guildId].toyEmotes[element].length > 0))
          msg.react(msg.client.botConfig[msg.guildId].toyEmotes[element]);
    else {
      msg.react(msg.client.botConfig[msg.guildId].toyEmotes.unknown);
      msg.client.logger.info(element + ": server is not configured or no emote listed for toy");
    }
  });
}

// It's safe to assume urls will start with https://c.lovense.com/c/xxxxxx
async function getSid(url) {
  const res = await nodeFetch(url, {redirect: 'manual'});
  console.log("http status: " + res.status);
  if (res.status == "302") {  
    const locationValue = res.headers.get('location');
    console.log("Location Header: " + locationValue);
    const re = new RegExp("play\/(\\w+)");
    const reMatch = re.exec(locationValue);

    if ((reMatch !== null) && (reMatch.length == 2))     
      return reMatch[1];
    else 
      return null;
  }
}

async function getToyInfo(sid) {
  let returnObject = {};

  if (sid === null) {
    returnObject = {
      "toys": ["invalid"],
      "leftTime": 0
    };
  }

  const json = await fetchJSON("https://api.lovense.com/developer/v2/loading/" + sid);

  
  // console.log("getToyInfo[" + this.shortURL + "]: " + JSON.stringify(json));
  if (json.result === true) {
    returnObject = json.data;
    returnObject.toys = json.data.toyType.split(',');
    returnObject.toyIds = json.data.toyId.split(',');
  } else if (json.result === false) {
    returnObject = json.result;
  }

  return returnObject;
}

async function fetchJSON(url, fetchOptions = {}){
  if (Object.prototype.hasOwnProperty.call(fetchOptions, 'timeout') === false)
    fetchOptions.timeout = 60000;  // Set Timeout to 5 seconds

  try {
    const response = await nodeFetch(url, fetchOptions);

    if (response.ok) {
      return response.json();
    } else {
      console.log('Received a non-okay response: ' + JSON.stringify(response, null, 2));
    }
  } catch (error) {
    console.log('URL fetch of ' + url + ' could not be completed.');
    console.log(JSON.stringify(error, null, 2));
  }
}