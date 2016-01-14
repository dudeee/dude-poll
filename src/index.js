export default bot => {
  const polls = [];
	const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five',
									 'six', 'seven', 'eight', 'nine', 'ten'];

  const formatResult = poll => {
		let result = '';

    for (let vote of Object.keys(poll.votes)) {
      let value = poll.votes[vote];
      result += `( *${value}* ) ${poll.options[vote]}\n`;
    }

    return result;
  }

  bot.listen(/poll close (\d+)/i, message => {
    let [id] = message.match;
    if (!id) return;

    let poll = polls[id];

    if (poll.user !== message.user) {
      let user = bot.find(poll.user);
      message.reply(`You are not the owner of poll, Only @${user.name} can close the poll.`);
      return;
    }

    poll.active = false;

    let result = formatResult(poll);

    message.reply(`Closed poll *${poll.subject}*, results:\n` + result);
  });

  bot.listen(/poll result(?:s)? (\d+)/i, message => {
    let [id] = message.match;
    if (!id) return;

    let poll = polls[id];

    let result = formatResult(poll);

    bot.sendMessage(poll.channel, `Results for *${poll.subject}*\n` + result);
  })

  bot.listen(/poll "(.*?)" (?:"(.*)")*/i, message => {
    let [subject, options] = message.match || message.asciiMatch;
		options = options.split('" "');

    if (!subject || !options.length) return;

    let votes = new Array(options.length).fill(0);

    let index = polls.push({
      subject, options, active: true, votes,
      user: message.user,
			channel: message.channel
    }) - 1;

    let poll = polls[index];

    let im = bot.ims.find(im => im.user === message.user).id;

    bot.sendMessage(im, `Poll id for _${subject}_: ${index}
Use this id to close the poll. See \`help poll\``);

		let optionsDisplay = options.map((text, index) => {
			return `:${NUMBERS[index]}: ${text}`;
		}).join('\n');

    message.reply(`Poll: _${subject}_\nAvailable options:\n${optionsDisplay}`)
    .then(r => {
      poll.message = r;
    });
  })

  bot.on('reaction_added', function listener(ev) {
    let active = polls.filter(s => s.active);
    for (let poll of active) {
      if (ev.item.ts === poll.message.ts) {
				let index = NUMBERS.findIndex(a => a === ev.reaction);
				console.log(index);

        if (index < 0 || typeof poll.votes[index] === 'undefined') return;

        poll.votes[index]++;
      }
    }
  });

  bot.on('reaction_removed', function listener(ev) {
    let active = polls.filter(s => s.active);
    for (let poll of active) {
      if (ev.item.ts === poll.message.ts) {
				let index = NUMBERS.findIndex(a => a === ev.reaction);

        if (index < 0 || typeof poll.votes[index] === 'undefined') return;

        poll.votes[index]--;
      }
    }
  });

  bot.help('poll', 'Start a poll', `
poll "<question>" "option1" "option2" "option3"
Arguments should be wrapped in quotes and options are space-separated

poll close <id>
Close the poll and show the results
Only the owner of poll is allowed to close the poll.

poll result <id>
Show results of a poll`);
}
