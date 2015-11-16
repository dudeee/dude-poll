'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports['default'] = function (bot) {
  var surveys = [];

  var formatResult = function formatResult(survey) {
    var result = '';

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(survey.votes)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var vote = _step.value;

        var value = survey.votes[vote];
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

    return result;
  };

  var showResult = function showResult(message, close) {
    var _message$match = _slicedToArray(message.match, 2);

    var id = _message$match[1];

    if (!id) return;

    var survey = surveys[id];

    if (close) survey.active = false;

    var result = formatResult(survey);

    message.reply('Results for survey _' + survey.subject + '_\n' + result);
  };

  bot.listen(/survey close (\d+)/i, function (message) {
    showResult(message, true);
  });

  bot.listen(/survey result(?:s)? (\d+)/i, function (message) {
    showResult(message);
  });

  bot.listen(/survey #(.*)# (.*)/i, function (message) {
    var _message$match2 = _slicedToArray(message.match, 3);

    var subject = _message$match2[1];
    var options = _message$match2[2];

    if (!subject || !options) return;

    options = options.split(',');

    var votes = {};
    var possible = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = options[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var option = _step2.value;

        option = option.replace(/:/g, '');
        votes[option] = 0;

        possible.push(':' + option + ':');
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

    possible = possible.join(', ');

    var index = surveys.push({
      subject: subject, options: options, active: true, votes: votes
    }) - 1;
    var survey = surveys[index];

    var im = bot.ims.find(function (im) {
      return im.user === message.user;
    }).id;

    bot.sendMessage(im, 'Survey id: ' + index + '\nUse this id to close the survey. See `help survey`');

    message.reply('Survey: _' + subject + '_\nAvailable options: ' + possible).then(function (r) {
      survey.message = r;
    });
  });

  bot.on('reaction_added', function listener(ev) {
    var active = surveys.filter(function (s) {
      return s.active;
    });
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = active[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var survey = _step3.value;

        if (ev.item.ts === survey.message.ts) {
          if (typeof survey.votes[ev.reaction] === 'undefined') return;

          survey.votes[ev.reaction]++;
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

  bot.on('reaction_removed', function listener(ev) {
    var active = surveys.filter(function (s) {
      return s.active;
    });
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = active[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var survey = _step4.value;

        if (ev.item.ts === survey.message.ts) {
          if (typeof survey.votes[ev.reaction] === 'undefined') return;

          survey.votes[ev.reaction]--;
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
          _iterator4['return']();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  });

  bot.help('survey', 'Call for a survey', '\nsurvey #<subject># <options>\nSubject must be inside two hashes.\nOptions is a comma-separated list of acceptable reaction emojis\n\nsurvey close <id>\nClose the survey and show the results\n\nsurvey result(s) <id>\nShow results of a survey');
};

module.exports = exports['default'];
