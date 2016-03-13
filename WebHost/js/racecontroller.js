var webApp = angular.module('webApp', ['chart.js']);

var max_lap_time = 60;

function sortNumber(a,b) {
    return a - b;
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var raceId = getParameterByName('id');

webApp.controller('mainCtrl', function ($scope,$http,$location) {


$scope.data = [];
$scope.Data2 = [];


$scope.home = function()
{
document.location.href = "/";
};

$scope.loadRaceData = function() {
      $http.get("/raceInfo?id=" + raceId).success(function(data, status) {
            //console.log(data);
            // $scope.data = data;
            $scope.raceName = data.name;
            $scope.data = data.details;
            $scope.updateData();
            //$scope.apply();
        });
};

console.log(raceId);
$scope.loadRaceData();

$scope.getusers = function()
{
  $http.get("/getusers").success(function(data, status) {
            $scope.users = data;
            // console.log(data);
        })
};
  
  $scope.getusers();

    $scope.updateData = function()
    {
      $scope.graph.data = [];
      $scope.graph.series = [];
      $scope.graph.labels = [];
      var max_lap_count = 0;
      for(var x=0;x<$scope.data.length;x++)
      {
        $scope.data[x].best = 99000;
        $scope.data[x].laps = 0;
        $scope.graph.series.push($scope.data[x].Name);
        var arr = [];
        for(var y=0;y<$scope.data[x].val.length;y++)
        {
            arr.push($scope.format_time($scope.data[x].val[y].lapTime));
            if($scope.data[x].best > $scope.data[x].val[y].lapTime)
            {
             $scope.data[x].best = $scope.data[x].val[y].lapTime; 
            }
            var lapcount = $scope.data[x].laps++;
            $scope.graph.labels[lapcount] = 'lap ' + $scope.data[x].laps;
            //$scope.data[x].laps++;

        }
        $scope.graph.data.push(arr);
      }
    };

// Graph
$scope.graph = {}; 
$scope.graph.data = [[0, 0, 0, 0], [0,0,0]];
  $scope.graph.labels = ['lap 1', 'lap 2', 'lap 3', 'lap 4', 'lap 5', 'lap 6', 'lap 7', 'lap 8'];
  $scope.graph.options = {
    animation: false
  };
  $scope.graph.series = ['No Laps', 'Start racing']
  // $scope.graph.colours;
  $scope.graph.legend = true;
// End Graph

$scope.format_time = function (val) {
    var seconds = Math.floor(val / 1000);
    var dec = Math.floor(val / 100);
    return seconds + "." + dec;
};



});