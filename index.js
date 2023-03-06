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
const { MessageAttachment, EmbedBuilder, Client, GatewayIntentBits, ActivityType, ButtonBuilder, SelectMenuBuilder, ActionRowBuilder, ClientUser, AttachmentBuilder } = require('discord.js');

require('dotenv').config()

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const options = {
  host: '127.0.0.1',
  port: 25585, // Default RCON port is 25575
  password: process.env.RCON_PASSWORD
};

const lobbyoptions = {
  host: process.env.LOBBY_HOST,
  port: process.env.LOBBY_PORT, // Default RCON port is 25575
  password: process.env.LOBBY_PASSWORD
};

// const client = new Rcon({ // all of those are required!
//   port: process.env.RCON_PORT,
//   host: process.env.RCON_HOST,
//   password: process.env.RCON_PASSWORD
// })

const rcon = new Rcon(options);
const lobbyrcon = new Rcon(lobbyoptions);

client.once('ready', () => {
  client.user.setPresence({ activities: [{ name: 'Server is not running'}], status: 'idle' });
  console.log('Ready!');
});

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
  let extension = 'bat'
  if (process.platform == 'linux') {
    extension = 'sh'
  }
  const sh = spawn('cmd.exe', ['/c','startmc.'+extension], {cwd: '../'});

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

cron.schedule('*/5 * * * *', async () => {
  //if startdate is not set or real time is 23:30:00 set startdate to new Date() and run startmc.sh
  if (!startdate && new Date().getHours() == 23 && new Date().getMinutes() == 30 && new Date().getSeconds() == 0) {
    startdate = new Date()
    startminecraft = true
    console.log('start Minecraft Server')
    //clear presence
    client.user.setPresence({ activities: [{ name: 'Server is starting'}], status: 'online' });
    const msg = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('One Day Project')
      .setDescription('เซิฟเวอร์เปิดแล้ว')
      .setTimestamp()
      .setFooter({text:'IP Address : 154.208.140.118:25565'});

    client.channels.cache.get('932671627152461936').send({ embeds: [msg]})
      .then(function (message) {
        //log message id
        console.log(message);
      });
      
    startmc()
  } else {
    if(new Date().getMinutes() % 10 == 0 && new Date().getSeconds() == 0 && startminecraft != true) {
      //get horus and minutes from now to 23:30:00
      let hours = 23 - new Date().getHours()
      let minutes = 30 - new Date().getMinutes()
      if (hours < 0) {
        hours = 24 + hours
      }
      if (minutes < 0) {
        minutes = 60 + minutes
      }
      client.user.setPresence({ activities: [{ name: 'Server will start in '+hours+' hours '+minutes+' minutes'}], status: 'idle' });
      // lobbyrcon.connect().then(() => {
      //   console.log("Connected to server!")
      //   rcon.send('dh line set odp 1 2 "Event จะเริ่มใน '+hours+' ชั่วโมง '+minutes+' นาที"').then(response => {
      //     console.log(`Response: ${response}`);
      //     // lobbyrcon.end();
      //   }).catch(err => {
      //     console.log("An error occurred while sending the query!")
      //     console.log(err)
      //   })
      //   rcon.send('dh line set odp 1 2 test').then(response => {
      //     console.log(`Response: ${response}`);
      //     // lobbyrcon.end();
      //   }).catch(err => {
      //     console.log("An error occurred while sending the query!")
      //     console.log(err)
      //   })
      //   lobbyrcon.end();
      // }).catch(err => {
      //   console.log("Connection to server cannot be established!")
      // })
      await lobbyrcon.connect();
      await lobbyrcon.send('dh line set odp 1 2 "Event จะเริ่มใน '+hours+' ชั่วโมง '+minutes+' นาที"');
      await lobbyrcon.end();
    }
  }
  //if time from startdate is over 24 hours and 30 minutes run minecraft rcon command to stop server
  if (startdate) {
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
          startdate = null
          startminecraft = false
          const msg = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('One Day Project')
            .setDescription('เซิฟเวอร์ปิดแล้ว')
            .setTimestamp()
            .setFooter({text:'เจอกันในอีก 23 ชั่วโมง'});

          client.channels.cache.get('932671627152461936').send({ embeds: [msg]})
            .then(function (message) {
              //log message id
              console.log(message);
              client.user.setPresence({ activities: [{ name: 'Server is shutting down see you in 23 hours'}], status: 'idle' });
            });
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
  }
})

client.login(process.env.DISCORD_TOKEN);
console.log('start now')