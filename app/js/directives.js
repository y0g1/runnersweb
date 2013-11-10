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
    .directive('smartFloat', [function() {
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
    }])
    .directive('comments', ['$rootScope', 'Auth', '$http', function($rootScope, Auth, $http) {
        return {
            restrict: 'E', /// element
            templateUrl: '/r/partials/comments.html',
            scope: {
                postId: '@',
                type: '@'
            },

            controller: ['Auth', '$scope', '$http', function(Auth, $scope, $http) {
                $scope.sendComment = function() {
                    $http({
                        method: 'POST',
                        url: '/comment/add',
                        data : {type:$scope.type, id:$scope.postId, message:$scope.message}
                    }).success(function(data) {
                        toastr.success('[[[Comment has been added]]]');
                        $scope.message = '';
                        $scope.comments = $scope.getComments($scope.type, $scope.postId);
                    });
                };

                $scope.deleteComment = function(id) {
                    $http({
                        method: 'POST',
                        url: '/comment/delete',
                        data : {type:$scope.type, id:id}
                    }).success(function(data) {
                        toastr.success('[[[Comment has been removed]]]');
                        $scope.comments = $scope.getComments($scope.type, $scope.postId);
                    });
                };


                $scope.getComments = function(type, id) {
                    $http({
                        method: 'POST',
                        url: '/comment/get-list',
                        data : {type:type, id:id}
                    }).success(function(data) {
                        $scope.comments = [];

                        angular.forEach(data.res, function(com) {
                            if(com.member_id == Auth.getMember().id) {
                                com.isOwner = true;
                            } else {
                                com.isOwner = false;
                            }
                            $scope.comments.push(com);
                        });
                        //$scope.comments = data.res;
                    });
                };
            }],
            link: function(scope, element, attrs) {

                scope.$watch('postId', function(val) {
                    if( val!='' && parseInt(val) != 0) {
                        scope.getComments(scope.type, val);
                    }
                });

            }
        }



    }]);