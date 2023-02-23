// const { exec } = require('child_process');
// exec('cd .. && sh startmc.sh', (error, stdout, stderr) => {
//     if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
//     console.error(`stderr: ${stderr}`);
// });

const { spawn } = require('child_process');
const cron = require('node-cron');
// const Rcon = require('minecraft-rcon-client');
const Rcon = require('rcon-client').Rcon;

const options = {
  host: '127.0.0.1',
  port: 25575, // Default RCON port is 25575
  password: 'minecraft'
};

// const client = new Rcon({ // all of those are required!
//   port: process.env.RCON_PORT,
//   host: process.env.RCON_HOST,
//   password: process.env.RCON_PASSWORD
// })

const rcon = new Rcon(options);

//get this location 

// const sh = spawn('sh', ['startmc.sh'], {cwd: '../'});

let startdate
let startminecraft = false

// sh.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });

// sh.stderr.on('data', (data) => {
//   console.error(`stderr: ${data}`);
// });

// sh.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

function startmc() {
  const sh = spawn('sh', ['startmc.bat'], {cwd: '../'});

  sh.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  sh.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  sh.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

cron.schedule('*/5 * * * *', () => {
  //if startdate is not set or real time is 23:30:00 set startdate to new Date() and run startmc.sh
  if (!startdate && new Date().getHours() == 23 && new Date().getMinutes() == 30 && new Date().getSeconds() == 0) {
    startdate = new Date()
    startminecraft = true
    startmc()
	console.log('start Minecraft Server')
  }
  //if time from startdate is over 24 hours and 30 minutes run minecraft rcon command to stop server
  if (new Date() - startdate > 24*60*60*1000 + 30*60*1000) {
    // run rcon command to stop server
    // client.connect().then(() => {
    //   client.send("stop").then((response) => {
    //       console.log(response)
    //       startminecraft = false
    //       client.disconnect()
    //   }).catch(err => {
    //       console.log("An error occurred while sending the query!")
    //   })
    // }).catch(err => {
    //   console.log("Connection to server cannot be established!")
    // })
    rcon.connect().then(() => {
      console.log('Connected to RCON');
      rcon.send('stop').then(response => {
        console.log(`Response: ${response}`);
        rcon.end();
      }).catch(error => {
        console.error(error);
        rcon.end();
      });
    }).catch(error => {
      console.error(error);
    });
    //if server is stopped run startmc.sh
    //if server is started set startdate to new Date()
  }
})

console.log('start now')