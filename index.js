const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionsBitField
} = require("discord.js");

const config = require("./config.json");

// Cria o cliente do bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ],
    partials: [
        Partials.Channel
    ]
});

// Lista de comandos
const comandos = [];

// -----------------------------
// Comando /registro
// -----------------------------
comandos.push(
    new SlashCommandBuilder()
        .setName("registro")
        .setDescription("Registrar na guilda")
        .addStringOption(opcao =>
            opcao
                .setName("nick")
                .setDescription("Seu nick no jogo")
                .setRequired(true)
        )
);

// -----------------------------
// Comando /clear
// -----------------------------
comandos.push(
    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Apagar mensagens")
        .addIntegerOption(opcao =>
            opcao
                .setName("quantidade")
                .setDescription("Quantidade de mensagens")
                .setRequired(true)
        )
);

// Registrar os comandos no servidor
async function registrarComandos() {

    try {

        const rest = new REST({ version: "10" }).setToken(config.token);

        await rest.put(
            Routes.applicationGuildCommands(
                config.clientId,
                config.guildId
            ),
            {
                body: comandos.map(comando => comando.toJSON())
            }
        );

        console.log("Comandos registrados com sucesso.");

    } catch (erro) {

        console.log("Erro ao registrar comandos.");
        console.log(erro);

    }

}

registrarComandos();

// Quando o bot ligar
client.once(Events.ClientReady, () => {

    console.log("Bot conectado!");
    console.log(client.user.tag);

});

// Escutar os comandos Slash
client.on(Events.InteractionCreate, async (interaction) => {

    if (!interaction.isChatInputCommand()) {
        return;
    }

    // ==========================
    // COMANDO /registro
    // ==========================
    if (interaction.commandName === "registro") {

        const membro = interaction.member;

        // Verifica se possui o cargo Recruta
        if (!membro.roles.cache.has(config.roles.recruta)) {

            await interaction.reply({
                content: "Você não possui o cargo Recruta.",
                ephemeral: true
            });

            return;
        }

        const nick = interaction.options.getString("nick");

        // Altera o apelido
        try {

            await membro.setNickname(nick);

        } catch (erro) {

            console.log("Não foi possível alterar o nickname.");

        }

        // Remove o cargo Recruta
        try {

            await membro.roles.remove(config.roles.recruta);

        } catch (erro) {

            console.log("Erro ao remover cargo.");

        }

        // Adiciona o cargo Guarda
        try {

            await membro.roles.add(config.roles.guarda);

        } catch (erro) {

            console.log("Erro ao adicionar cargo.");

        }

        await interaction.reply({
            content: `Registro concluído! Bem-vindo, ${nick}.`,
            ephemeral: true
        });

        return;
    }
     // ==========================
    // COMANDO /clear
    // ==========================
    if (interaction.commandName === "clear") {

        // Verifica se o usuário tem permissão
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {

            await interaction.reply({
                content: "Você não possui permissão para usar este comando.",
                ephemeral: true
            });

            return;
        }

        // Quantidade de mensagens
        let quantidade = interaction.options.getInteger("quantidade");

        // Limita entre 1 e 100
        if (quantidade < 1) {
            quantidade = 1;
        }

        if (quantidade > 100) {
            quantidade = 100;
        }

        try {

            await interaction.channel.bulkDelete(quantidade, true);

            await interaction.reply({
                content: `${quantidade} mensagens foram apagadas.`,
                ephemeral: true
            });

        } catch (erro) {

            console.log("Erro ao apagar mensagens.");
            console.log(erro);

            await interaction.reply({
                content: "Não foi possível apagar as mensagens.",
                ephemeral: true
            });

        }

        return;
    }

});

// Liga o bot
client.login(config.token);
