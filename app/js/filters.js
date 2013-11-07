'use strict';

/* Filters */

angular.module('app.filters', []).
    filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
    }]).
    filter('nl2br', [function() {
        return function(text) {
            return String(text).replace(/\n/mg, '<br />');
        }
    }]).
    filter('stripHTML', [function() {
        return function(text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
        }
    }]);


