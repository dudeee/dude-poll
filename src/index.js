export default bot => {
  const polls = [];

  const formatResult = poll => {
    let result = '';

    for (let vote of Object.keys(poll.votes)) {
      let value = poll.votes[vote];
      result += `:${vote}: => ${value}\n`;
    }

    return result;
  }

  bot.listen(/poll close (\d+)/i, message => {
    let [, id] = message.match;
    if (!id) return;

    let poll = polls[id];

    if (poll.user !== message.user) {
      let user = bot.find(poll.user);
      message.reply(`You are not the owner of poll, Only @${user.name} can close the poll.`);
      return;
    }

    poll.close = true;

    let result = formatResult(poll);

    message.reply(`Results for poll _${poll.subject}_\n` + result);
  });

  bot.listen(/poll result(?:s)? (\d+)/i, message => {
    let [, id] = message.match;
    if (!id) return;

    let poll = polls[id];

    let result = formatResult(poll);

    message.reply(`Closed poll _${poll.subject}_, Results:` + result);
  })

  bot.listen(/poll #(.*)# (.*)/i, message => {
    let [, subject, options] = message.match;
    if (!subject || !options) return;

    options = options.split(',');

    let votes = {};
    let possible = [];
    for (let option of options) {
      option = option.replace(/:/g, '').trim();
      votes[option] = 0;

      possible.push(`:${option}:`);
    }

    possible = possible.join(', ');

    let index = polls.push({
      subject, options, active: true, votes,
      user: message.user
    }) - 1;
    let poll = polls[index];

    let im = bot.ims.find(im => im.user === message.user).id;

    bot.sendMessage(im, `Poll id for _${subject}_: ${index}
Use this id to close the poll. See \`help poll\``);

    message.reply(`Poll: _${subject}_\nAvailable options: ${possible}`)
    .then(r => {
      poll.message = r;
    });
  })

  bot.on('reaction_added', function listener(ev) {
    let active = polls.filter(s => s.active);
    for (let poll of active) {
      if (ev.item.ts === poll.message.ts) {
        if (typeof poll.votes[ev.reaction] === 'undefined') return;

        poll.votes[ev.reaction]++;
      }
    }
  });

  bot.on('reaction_removed', function listener(ev) {
    let active = polls.filter(s => s.active);
    for (let poll of active) {
      if (ev.item.ts === poll.message.ts) {
        if (typeof poll.votes[ev.reaction] === 'undefined') return;

        poll.votes[ev.reaction]--;
      }
    }
  });

  bot.help('poll', 'Create a poll', `
poll #<subject># <options>
Subject must be inside two hashes.
Options is a comma-separated list of acceptable reaction emojis

poll close <id>
Close the poll and show the results
Only the owner of poll is allowed to close the survey.

poll result(s) <id>
Show results of a poll`);
}
