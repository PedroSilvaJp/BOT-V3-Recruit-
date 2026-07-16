
const {Client,GatewayIntentBits,Partials,Events,REST,Routes,SlashCommandBuilder,PermissionsBitField}=require('discord.js');
const cfg=require('./config.json');
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages],partials:[Partials.Channel]});
const cmds=[
new SlashCommandBuilder().setName('registro').setDescription('Registrar').addStringOption(o=>o.setName('nick').setDescription('Nick').setRequired(true)),
new SlashCommandBuilder().setName('clear').setDescription('Limpar').addIntegerOption(o=>o.setName('quantidade').setDescription('1-100').setRequired(true))
].map(c=>c.toJSON());
(async()=>{const r=new REST({version:'10'}).setToken(cfg.token);await r.put(Routes.applicationGuildCommands(cfg.clientId,cfg.guildId),{body:cmds});})();
client.once(Events.ClientReady,()=>console.log('Online'));
client.on(Events.InteractionCreate,async i=>{
if(!i.isChatInputCommand())return;
if(i.commandName==='registro'){
 const m=i.member;
 if(!m.roles.cache.has(cfg.roles.recruta)) return i.reply({content:'Você não possui o cargo Recruta.',ephemeral:true});
 const nick=i.options.getString('nick');
 await m.setNickname(nick).catch(()=>{});
 await m.roles.remove(cfg.roles.recruta).catch(()=>{});
 await m.roles.add(cfg.roles.guarda).catch(()=>{});
 return i.reply({content:`Registro concluído! Bem-vindo, ${nick}.`,ephemeral:true});
}
if(i.commandName==='clear'){
 if(!i.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return i.reply({content:'Sem permissão.',ephemeral:true});
 const q=i.options.getInteger('quantidade');
 await i.channel.bulkDelete(q,true);
 return i.reply({content:`${q} mensagens apagadas.`,ephemeral:true});
}
});
client.login(cfg.token);
