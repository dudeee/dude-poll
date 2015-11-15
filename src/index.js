export default bot => {
  const surveys = [];

  bot.listen(/survey close (\d+)/i, message => {
    let [, id] = message.match;

    surveys[id].active = false;

    let result = '';

    for (let vote of Object.keys(surveys[id].votes)) {
      let value = surveys[id].votes[vote];
      result += `:${vote}: => ${value}\n`;
    }

    message.reply(`Results for survey _${survey[id].subject}_\n` + result);
  });

  bot.listen(/survey #(.*)# (.*)/i, message => {
    let [, subject, options] = message.match;
    options = options.split(',');

    let votes = {};
    for (let option of options) {
      votes[option] = 0;
    }

    let index = surveys.push({
      subject, options, active: true, votes
    }) - 1;

    let im = bot.ims.find(im => im.user === message.user).id;

    bot.sendMessage(im, `Survey id: ${index}
Use this id to close the survey. See \`help survey\``);

    message.reply(subject).then(r => {
      let { ts } = r;
      bot.on('reaction_added', function listener(ev) {
        if (ev.item.ts === ts) {
          surveys[index].votes[ev.reaction]++;
        }

        // bot.removeListener('reaction_added', listener);
      });

      bot.on('reaction_removed', function listener(ev) {
        if (ev.item.ts === ts) {
          surveys[index].votes[ev.reaction]--;
        }

        // bot.removeListener('reaction_removed', listener);
      });
    })
  });


  bot.help('survey', 'Call for a survey', `
survey #<subject># <options>
Subject must be inside two hashes.
Options is a comma-separated list of acceptable reactions to

survey close <id>
Close the vote and show the results`);
}
