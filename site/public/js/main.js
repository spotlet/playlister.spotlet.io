var playlister = angular.module('playlister', ['ngRoute']);

playlister.filter('ellipse', function() {
  return function (input, limit) {
    input = input || '';
    limit = limit || 20;

    var shortVersion = input.slice(0, limit);

    if (shortVersion.length < input.length) {
      shortVersion = shortVersion + '...';
    }

    return shortVersion;
  };
});

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
    when('/all_songs', {
      templateUrl: '/partials/all_songs/index.html',
      controller: 'AllSongsPageCtrl'
    }).
    when('/all_songs/:artist', {
      templateUrl: '/partials/all_songs/index.html',
      controller: 'AllSongsPageCtrl'
    }).
    when('/cloner', {
      templateUrl: '/partials/cloner/index.html',
      controller: 'ClonerPageCtrl'
    }).
    when('/spotcast', {
      templateUrl: '/partials/spotcast.html',
      controller: 'SpotcastPageCtrl'
    }).
    otherwise({
      redirectTo: '/'
    })
  ;
}]);

playlister.controller('SpotcastPageCtrl', function ($scope, $rootScope, $http, $log) {
  $rootScope.pageTitle = 'SpotCast';
});

playlister.controller('HomePageCtrl', function ($scope, $http, $log, $rootScope) {
  $rootScope.pageTitle = 'Home';
});

playlister.controller('AllSongsPageCtrl', function ($scope, $http, $route, $routeParams, $log, $location, $rootScope) {
  $rootScope.pageTitle = 'All Songs';

  $scope.filters = {
    album: true,
    single: true,
    appears_on: true,
    compilation: true
  };

  $scope.artistName = $routeParams.artist || '';
  $scope.artists = [];

  $scope.makePlaylist = function (artistName) {
    $http({method: 'POST', url: '/api/v1/artist/playlist/all_songs/'+artistName, data: $.param({types: $scope.filters}), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).success(function (data) {
      $scope.artistName = '';
      $scope.artists = [];
      alert('Your playlist has been queued for creation!');
    });
  };

  $scope.searchArtists = function () {
    if ($scope.artistName.length < 1) {
      $scope.artists = [];
      return;
    }

    $http.get('/api/v1/artist/search/'+$scope.artistName).success(function (data) {
      $scope.artists = [];
      angular.forEach(data.data, function (value, key) {
        for (i in value.images) {
          if (value.images[i].height <= 300) {
            smallImage = value.images[i];
            break;
          }
        }
        var artist = { name: value.name, image: smallImage }
        $scope.artists.push(artist);
      });
    });
  };

  $scope.$watch('artistName', function() {
    $scope.searchArtists();
    // $location.path('/all_songs/'+$scope.artistName);
    // $route.updateParams({artist: $scope.artistName});
  });

});

playlister.controller('SignedInCtrl', function ($scope, $http) {

  $scope.signedIn = false;

  $http.get('/status').success(function (data) {
    if (data.status) {
      $scope.signedInStatus = 'Sign Out';
      $scope.faClass = 'sign-out';
      $scope.path = '/auth/sign_out';
    } else {
      $scope.signedInStatus = 'Sign In';
      $scope.faClass = 'sign-in';
      $scope.path = '/auth/spotify';
    }

    $scope.signedIn = data.status;
    $scope.userId = data.id;

    $scope.show_state = true;
  });
});

playlister.controller('RecentlySavedPageCtrl', function ($scope, $http, $rootScope) {
  $rootScope.pageTitle = 'Recently Saved';

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

playlister.controller('ClonerPageCtrl', function ($scope, $http, $rootScope) {
  $rootScope.pageTitle = 'Cloner';

  $scope.playlistId = '';
  $scope.result = {};

  $scope.clonePlaylist = function () {
    if ($scope.playlistId.length < 6) { return; }

    $http.post('/api/v1/cloner/clone?playlist='+$scope.playlistId).success(function (data) {
      console.log(data);
      $scope.result = data.results;
    });
  }
});

playlister.controller('SidebarLinksCtrl', function ($scope, $location, $rootScope) {
  $scope.sidebarLinks = [
    { name: 'Home', url: '/' },
    {
      name: 'SpotCast', url: '/spotcast', homepage: true,
      desc: 'This is the new Radio. Anyone can be a DJ and everyone can listen to human currated radio.'
    },
    {
      name: 'Recently Saved', url: '/recently_saved', homepage: true,
      desc: 'Build and maintain a playlist of the last 50 tracks added to "Your Music"'
    },
    {
      name: 'All Artist Songs', url: '/all_songs', homepage: true,
      desc: 'Build a playlist of every song by an artist, inclucing "Appears On" tracks'
    },
    {
      name: 'Cloner', url: '/cloner', homepage: true,
      desc: 'Duplicate any playlist so you can add/remove songs to it yourself'
    },
  ];

  angular.forEach($scope.sidebarLinks, function(value, key) {
    if (value.url == $location.path()) {
      value.active = 'active';
    }
  });

});
