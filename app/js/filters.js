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
            return String(text).replace(/(\n)+/mg, '<br />');
        }
    }]).
    filter('escapeHTML', [function() {
        return function(text) {
            return text
                .replace(/&/g, '&amp;')
                .replace(/>/g, '&gt;')
                .replace(/</g, '&lt;');
        }
    }]).
    filter('stripHTML', [function() {

        return function(text) {
            var div = document.createElement("div");
            div.innerHTML = text;
            return div.textContent || div.innerText || ""
        }

    }]).
    filter('date', [function() {
        return function(text) {
            return moment.parseZone(text).format('LL');
        }
    }]).
    filter('date-short', [function() {
        return function(text) {
            return moment.parseZone(text).format('ll');
        }
    }]).
    filter('datetime', [function() {
        return function(text) {`
            return moment.parseZone(text).format('LLLL');
        }
    }]).
    filter('datetime-short', [function() {
        return function(text) {
            return moment.parseZone(text).format('llll');
        }
    }]);