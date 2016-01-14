'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = function (bot) {
  var polls = [];
  var NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

  var formatResult = function formatResult(poll) {
    var result = '';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(poll.votes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var vote = _step.value;

        var value = poll.votes[vote];
        result += '( *' + value + '* ) ' + poll.options[vote] + '\n';
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return result;
  };

  bot.listen(/poll close (\d+)/i, function (message) {
    var _message$match = _slicedToArray(message.match, 1);

    var id = _message$match[0];

    if (!id) return;

    var poll = polls[id];

    if (poll.user !== message.user) {
      var user = bot.find(poll.user);
      message.reply('You are not the owner of poll, Only @' + user.name + ' can close the poll.');
      return;
    }

    poll.active = false;

    var result = formatResult(poll);

    message.reply('Closed poll *' + poll.subject + '*, results:\n' + result);
  });

  bot.listen(/poll result(?:s)? (\d+)/i, function (message) {
    var _message$match2 = _slicedToArray(message.match, 1);

    var id = _message$match2[0];

    if (!id) return;

    var poll = polls[id];

    var result = formatResult(poll);

    bot.sendMessage(poll.channel, 'Results for *' + poll.subject + '*\n' + result);
  });

  bot.listen(/poll "(.*?)" (?:"(.*)")*/i, function (message) {
    var _ref = message.match || message.asciiMatch;

    var _ref2 = _slicedToArray(_ref, 2);

    var subject = _ref2[0];
    var options = _ref2[1];

    options = options.split('" "');

    if (!subject || !options.length) return;

    var votes = new Array(options.length).fill(0);

    var index = polls.push({
      subject: subject, options: options, active: true, votes: votes,
      user: message.user,
      channel: message.channel
    }) - 1;

    var poll = polls[index];

    var im = bot.ims.find(function (im) {
      return im.user === message.user;
    }).id;

    bot.sendMessage(im, 'Poll id for _' + subject + '_: ' + index + '\nUse this id to close the poll. See `help poll`');

    var optionsDisplay = options.map(function (text, index) {
      return ':' + NUMBERS[index] + ': ' + text;
    }).join('\n');

    message.reply('Poll: _' + subject + '_\nAvailable options:\n' + optionsDisplay).then(function (r) {
      poll.message = r;
    });
  });

  bot.on('reaction_added', function listener(ev) {
    var active = polls.filter(function (s) {
      return s.active;
    });
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = active[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var poll = _step2.value;

        if (ev.item.ts === poll.message.ts) {
          var index = NUMBERS.findIndex(function (a) {
            return a === ev.reaction;
          });
          console.log(index);

          if (index < 0 || typeof poll.votes[index] === 'undefined') return;

          poll.votes[index]++;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });

  bot.on('reaction_removed', function listener(ev) {
    var active = polls.filter(function (s) {
      return s.active;
    });
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = active[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var poll = _step3.value;

        if (ev.item.ts === poll.message.ts) {
          var index = NUMBERS.findIndex(function (a) {
            return a === ev.reaction;
          });

          if (index < 0 || typeof poll.votes[index] === 'undefined') return;

          poll.votes[index]--;
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
          _iterator3['return']();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  });

  bot.help('poll', 'Start a poll', '\npoll "<question>" "option1" "option2" "option3"\nArguments should be wrapped in quotes and options are space-separated\n\npoll close <id>\nClose the poll and show the results\nOnly the owner of poll is allowed to close the poll.\n\npoll result <id>\nShow results of a poll');
};

module.exports = exports['default'];
