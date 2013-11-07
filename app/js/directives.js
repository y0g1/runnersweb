'use strict';

/* Directives */


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
    }]);