const discord = require('discord.js');
const client = new discord.Client()
client.commands = new discord.Collection()

const fs = require('fs')
const { prefix, token, admin_ids } = require('./config.json');
const cmdFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

cmdFiles.forEach(file => {
    const cmd = require(`./commands/${file}`)  
    client.commands.set(cmd.name, cmd);    
});


client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase()
    const commandArg = args.join(' ')
    if (!client.commands.has(command)) return;


    try{
       if(client.commands.get(command).adminCMD == true && Object.values(admin_ids).indexOf(message.author.id) == -1) return
        client.commands.get(command).execute(message,commandArg)
    } catch(error){
        console.log(error)
    }
    
});
    


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
// client.commands.get('match').execute('message','FLA Bounty')
  });

client.login(token);

