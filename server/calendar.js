const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { SerialPort } = require('serialport')
//const {ReadlineParser} = require('@serialport/parser-readline');
const parsers = SerialPort.parsers;

const port = new SerialPort({
    path:'COM4',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
})

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    console.log("Could not read file")
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  console.log("Checking for google calendar credentials ...")
  if (client) {
    console.log("Already authorized")
    return client;
  }
  console.log("Checking if credentials are available")
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    console.log("Credentials found")
    await saveCredentials(client);
    
  }
  return client;
}

const delay = ms => new Promise(res => setTimeout(res, ms)); 

async function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items;
  // console.log(res)
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }
  console.log('Upcoming events within the next 60 minutes:');
    events.forEach((event, i) => {
        const start = new Date(event.start.dateTime || event.start.date);
        const end = new Date(event.end.dateTime || event.end.date);

        const upcoming = new Date();
        const currentTime = new Date();
        upcoming.setMinutes(upcoming.getMinutes() + 60);

        if (start <= currentTime && end >= currentTime) {
          console.log(`Event happening now: ${event.summary} from ${event.start.dateTime} to ${event.end.dateTime}`);
        }

        if (start <= upcoming && end >= new Date()) {
            console.log(`Upcoming event within the next 60 minutes: ${event.summary} at ${event.start.dateTime}`);

            console.log("Sending info via serial")
            port.write(event.summary + "   ", function(err) {
              if (err) {
                return console.log('Error on write: ', err.message)
              }
              console.log('message written')
              
              
            })

          }

    });

}

//While loop: Run once first then Every 60 seconds
authorize().then(listEvents).catch(console.error);
setInterval( () => {authorize().then(listEvents).catch(console.error); } , 20000 )


// module.exports.requestAccess =  function requestAccess() {
//   authorize().catch(console.error);
// }
