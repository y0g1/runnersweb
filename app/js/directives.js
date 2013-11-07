'use strict';

/* Directives */

var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;

angular.module('app.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
    .directive('signedIn', ['$rootScope', 'Auth', function($rootScope, Auth) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch('member', function(member) {
                    if(!Auth.isLoggedIn(member))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                });
            }
        };
    }])
    .directive('signedOut', ['$rootScope', 'Auth', function($rootScope, Auth) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch('member', function(member) {
                    if(!Auth.isLoggedIn(member))
                        element.css('display', prevDisp);
                    else
                        element.css('display', 'none');
                });
            }
        };
    }])
    .directive('ngBindHtmlUnsafe', [function() {
        return function(scope, element, attr) {
            element.addClass('ng-binding').data('$binding', attr.ngBindHtmlUnsafe);
            scope.$watch(attr.ngBindHtmlUnsafe, function ngBindHtmlUnsafeWatchAction(value) {
                element.html(value || '');
            });
        }
    }])
    .directive('smartFloat', function() {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function(viewValue) {
                    if (FLOAT_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('float', true);
                        return parseFloat(viewValue.replace(',', '.'));
                    } else {
                        ctrl.$setValidity('float', false);
                        return undefined;
                    }
                });
            }
        };
    });