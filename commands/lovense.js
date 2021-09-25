require('../');
const nodeFetch = require('node-fetch');

module.exports = {
  name: 'lovense',
  description: 'Lovense Handler',
  async execute(msg) {
    const re = new RegExp('(https://c.lovense.com/c/\\w+)');
    const reMatch = re.exec(msg.cleanContent.toLowerCase());
    const shortUrl = reMatch[1];

    msg.client.logger.info('Got URL: ' + shortUrl);
    const sid = await getSid(shortUrl);
    msg.client.logger.info('SID: ' + sid);
    msg.reply('Got sid: ' + sid);

    
  },
};

// It's safe to assume urls will start with https://c.lovense.com/c/xxxxxx
async function getSid(url) {
  const res = await nodeFetch(url, {redirect: 'manual'});
  console.log("http status: " + res.status);
  if (res.status == "302") {  
    const locationValue = res.headers.get('location');
    console.log("Location Header: " + locationValue);
    const re = new RegExp("(\\w+)$");
    const reMatch = re.exec(locationValue);
    
    return reMatch[1];
  }
}


async function fetchJSON(url, fetchOptions = {}){
  if (fetchOptions.hasOwnProperty('timeout') === false)
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