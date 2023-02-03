const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "play",
    description: "Plays a song!",
    options: [
      {
        name: "query",
        type: ApplicationCommandOptionType.String,
        description: "The song you want to play",
        required: true,
      },
    ],
  },
  {
    name: "skip",
    description: "Skips a song!",
  },
];

const rest = new REST({ version: "10" }).setToken(
  "MTA3MDg2MTEyODk0ODc5NzQ1MA.GK-yuF.jTGSzWCoJEl92f40xwgvE5xIX6ZOveeI1nx_Iw"
);

(async () => {
  try {
    console.log("Started refreshing application [/] commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        "1070861128948797450",
        "776981886647271475"
      ),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application [/] commands.");
  } catch (error) {
    console.error(error);
  }
})();

const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["Guilds", "GuildVoiceStates"],
});
const { Player } = require("discord-player");

// Create a new Player (you don't need any API Key)
const player = new Player(client);

// add the trackStart event so when a song will be played this message will be sent
player.on("trackStart", (queue, track) =>
  queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`)
);

client.once("ready", () => {
  console.log("I'm ready !");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // /play track:Despacito
  // will play "Despacito" in the voice channel
  if (interaction.commandName === "play") {
    if (!interaction.member.voice.channelId)
      return await interaction.reply({
        content: "You are not in a voice channel!",
        ephemeral: true,
      });
    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me.voice.channelId
    )
      return await interaction.reply({
        content: "You are not in my voice channel!",
        ephemeral: true,
      });
    const query = interaction.options.getString("query");
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });

    // verify vc connection
    try {
      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);
    } catch {
      queue.destroy();
      return await interaction.reply({
        content: "Could not join your voice channel!",
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const track = await player
      .search(query, {
        requestedBy: interaction.user,
      })
      .then((x) => x.tracks[0]);
    if (!track)
      return await interaction.followUp({
        content: `❌ | Track **${query}** not found!`,
      });

    queue.play(track);

    return await interaction.followUp({
      content: `⏱️ | Loading track **${track.title}**!`,
    });
  } else if (interaction.commandName === "skip") {
    if (!interaction.member.voice.channelId)
      return await interaction.reply({
        content: "You are not in a voice channel!",
        ephemeral: true,
      });
    if (
      interaction.guild.members.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.members.me.voice.channelId
    )
      return await interaction.reply({
        content: "You are not in my voice channel!",
        ephemeral: true,
      });
    const query = interaction.options.getString("query");
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });

    // verify vc connection
    try {
      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);
    } catch {
      queue.destroy();
      return await interaction.reply({
        content: "Could not join your voice channel!",
        ephemeral: true,
      });
    }

    queue.skip();
  }
});

client.login(
  "MTA3MDg2MTEyODk0ODc5NzQ1MA.GK-yuF.jTGSzWCoJEl92f40xwgvE5xIX6ZOveeI1nx_Iw"
);
