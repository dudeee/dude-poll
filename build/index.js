'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = function (bot) {
  var surveys = [];

  bot.listen(/survey close (\d+)/i, function (message) {
    var _message$match = _slicedToArray(message.match, 2);

    var id = _message$match[1];

    surveys[id].active = false;

    var result = '';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(surveys[id].votes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var vote = _step.value;

        var value = surveys[id].votes[vote];
        result += ':' + vote + ': => ' + value + '\n';
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

    message.reply('Results for survey _' + survey[id].subject + '_\n' + result);
  });

  bot.listen(/survey #(.*)# (.*)/i, function (message) {
    var _message$match2 = _slicedToArray(message.match, 3);

    var subject = _message$match2[1];
    var options = _message$match2[2];

    options = options.split(',');

    var votes = {};
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var option = _step2.value;

        votes[option] = 0;
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

    var index = surveys.push({
      subject: subject, options: options, active: true, votes: votes
    }) - 1;

    var im = bot.ims.find(function (im) {
      return im.user === message.user;
    }).id;

    bot.sendMessage(im, 'Survey id: ' + index + '\nUse this id to close the survey. See `help survey`');

    message.reply(subject).then(function (r) {
      var ts = r.ts;

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
    });
  });

  bot.help('survey', 'Call for a survey', '\nsurvey #<subject># <options>\nSubject must be inside two hashes.\nOptions is a comma-separated list of acceptable reactions to\n\nsurvey close <id>\nClose the vote and show the results');
};

module.exports = exports['default'];
