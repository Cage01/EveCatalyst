const { EmbedBuilder } = require('discord.js');

const exampleEmbed = new EmbedBuilder()
  .setAuthor({
    name: "Info",
    url: "https://example.com",
  })
  .setTitle("Example Title")
  .setURL("https://example.com")
  .setDescription("This is an example description. Markdown works too!\n\nhttps://automatic.links\n> Block Quotes\n```\nCode Blocks\n```\n*Emphasis* or _emphasis_\n`Inline code` or ``inline code``\n[Links](https://example.com)\n<@123>, <@!123>, <#123>, <@&123>, @here, @everyone mentions\n||Spoilers||\n~~Strikethrough~~\n**Strong**\n__Underline__")
  .addFields(
    {
      name: "The first inline field.",
      value: "This field is inline.",
      inline: true
    },
    {
      name: "The second inline field.",
      value: "Inline fields are stacked next to each other.",
      inline: true
    },
    {
      name: "Field Name",
      value: "This is the field value.",
      inline: false
    },
  )
  .setImage("https://cubedhuang.com/images/alex-knight-unsplash.webp")
  .setThumbnail("https://dan.onl/images/emptysong.jpg")
  .setColor("#00b0f4")
  .setFooter({
    text: "Example Footer",
    iconURL: "https://slate.dan.onl/slate.png",
  })
  .setTimestamp();

module.exports = { exampleEmbed }; 