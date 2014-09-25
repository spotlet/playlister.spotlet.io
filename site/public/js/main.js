var playlister = angular.module('playlister', ['ngRoute']);

playlister.directive('activeLink', ['$location', function(location) {
   return {
     restrict: 'A',
     link: function(scope, element, attrs, controller) {
       var clazz = attrs.activeLink;
       var path = attrs.href;
       path = path.substring(2); //hack because path does not return including hashbang
       scope.location = location;
       scope.$watch('location.path()', function(newPath) {
         if (path === newPath) {
           element.addClass(clazz);
         } else {
           element.removeClass(clazz);
         }
       });
     }
   };
 }]);

playlister.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: '/partials/home.html',
      controller: 'HomePageCtrl'
    }).
    when('/recently_saved', {
      templateUrl: '/partials/recently_saved/index.html',
      controller: 'RecentlySavedPageCtrl'
    }).
    otherwise({
      redirectTo: '/'
    })
  ;
}]);

playlister.controller('HomePageCtrl', function ($scope) {

});

playlister.controller('SignedInCtrl', function ($scope, $http) {
  $http.get('/api/v1/user/verify').success(function (data) {
    if (data.status) {
      $scope.signedInStatus = 'Sign Out';
      $scope.faClass = 'sign-out';
      $scope.path = '/auth/sign_out';
    } else {
      $scope.signedInStatus = 'Sign In';
      $scope.faClass = 'sign-in';
      $scope.path = '/auth/spotify';
    }

    $scope.show_state = true;
  });
});

playlister.controller('RecentlySavedPageCtrl', function ($scope, $http) {
  $scope.isChecked = false;

  $http.get('/api/v1/user/playlist/recently_added/list').success(function (data) {
    $scope.tracks = data.data
  });

  $http.get('/api/v1/user/playlist/recently_added/status').success(function (data) {
    $scope.isChecked = data.status;
  });

  $scope.trigger = function() {
    if ($scope.isChecked) {
      $http.post('/api/v1/user/playlist/recently_added/disable').success(function(data) {
        $scope.isChecked = false;
      });
    } else {
      $http.post('/api/v1/user/playlist/recently_added/enable').success(function(data) {
        $scope.isChecked = true;
      });
    }
  };
});

playlister.controller('SidebarLinksCtrl', function ($scope, $location, $rootScope) {
  $scope.sidebarLinks = [
    { name: 'Home', url: '/' },
    { name: 'Recently Saved', url: '/recently_saved' },
    { name: 'All Artist Songs', url: '/all_songs' },
  ];

  angular.forEach($scope.sidebarLinks, function(value, key) {
    if (value.url == $location.path()) {
      value.active = 'active';
    }
  });

  $rootScope.$on('$viewContentLoaded', function() {
    }
  );
});
