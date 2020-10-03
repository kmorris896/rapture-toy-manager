module.exports = {
    name: 'foo',
    description: 'Foo!',
    execute(msg, args) {
      // msg.reply('bar');
      msg.channel.send('bar');
    },
};