export default bot => {
  const surveys = [];

  const formatResult = survey => {
    let result = '';

    for (let vote of Object.keys(survey.votes)) {
      let value = survey.votes[vote];
      result += `:${vote}: => ${value}\n`;
    }

    return result;
  }

  const showResult = (message, close) => {
    let [, id] = message.match;
    if (!id) return;

    let survey = surveys[id];

    if (close) survey.active = false;

    let result = formatResult(survey);

    message.reply(`Results for survey _${survey.subject}_\n` + result);
  }

  bot.listen(/survey close (\d+)/i, message => {
    showResult(message, true);
  });

  bot.listen(/survey result(?:s)? (\d+)/i, message => {
    showResult(message);
  })

  bot.listen(/survey #(.*)# (.*)/i, message => {
    let [, subject, options] = message.match;
    if (!subject || !options) return;

    options = options.split(',');

    let votes = {};
    for (let option of options) {
      option = option.replace(/:/g, '');
      votes[option] = 0;
    }

    let index = surveys.push({
      subject, options, active: true, votes
    }) - 1;
    let survey = surveys[index];

    let im = bot.ims.find(im => im.user === message.user).id;

    bot.sendMessage(im, `Survey id: ${index}
Use this id to close the survey. See \`help survey\``);

    message.reply(`Survey: _${subject}_`).then(r => {
      survey.message = r;
    });
  })

  bot.on('reaction_added', function listener(ev) {
    let active = surveys.filter(s => s.active);
    for (let survey of active) {
      if (ev.item.ts === survey.message.ts) {
        if (typeof survey.votes[ev.reaction] === 'undefined') return;

        survey.votes[ev.reaction]++;
      }
    }
  });

  bot.on('reaction_removed', function listener(ev) {
    let active = surveys.filter(s => s.active);
    for (let survey of active) {
      if (ev.item.ts === survey.message.ts) {
        if (typeof survey.votes[ev.reaction] === 'undefined') return;

        survey.votes[ev.reaction]--;
      }
    }
  });

  bot.help('survey', 'Call for a survey', `
survey #<subject># <options>
Subject must be inside two hashes.
Options is a comma-separated list of acceptable reaction emojis

survey close <id>
Close the survey and show the results

survey result(s) <id>
Show results of a survey`);
}
