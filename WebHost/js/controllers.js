var webApp = angular.module('webApp', ['chart.js']);

var max_lap_time = 60;

function sortNumber(a,b) {
    return a - b;
}

// filters
webApp.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

webApp.controller('mainCtrl', function ($scope,$http) {


$scope.data = [];
$scope.Data2 = [];

$scope.speakCheckBox = false;

$scope.speakToggle = function()
{
  //$scope.speakCheckBox = !$scope.speakCheckBox;
  console.log('toggled' + $scope.speakCheckBox);
}

$scope.RaceData = [];

$scope.IsWinner = function(racer, lapNum)
{
  return $scope.LapWinner(lapNum) == racer;
}

$scope.LapWinner = function(lapNum)
{
  // For this racer and lap the winner should have done most laps (max 5) and best total time
  var lapRank = 9999;
  var winnerRacer = -1;
  for(var x=0;x<$scope.Data2.length;x++)
  {
    // each racer check the current lap number
    //console.log($scope.Data2[x].lapRank);
    if($scope.Data2[x].lapRank[lapNum] < lapRank)
    {
      lapRank = $scope.Data2[x].lapRank[lapNum];
      winnerRacer = $scope.Data2[x].Id;
    }
  }

  return winnerRacer;
}

$scope.getusers = function()
{
  $http.get("/getusers").success(function(data, status) {
            $scope.users = data;
        })
};
  
  $scope.getusers();
$scope.createNewRace = function()
{
      var raceName = prompt("Please enter race name", "New Race");
      if(raceName != null)
      {
        $http.post("/newrace?name=" + raceName, {}).success(function(data, status) {
            console.log('race created');
        })
      }
};


  var socket = io();
  // console.log('registering io 1');
        socket.on('raceData', function(data){
          console.log(data);
          $scope.data = data;
          $scope.updateData();
          $scope.$apply();

        });

        socket.on('speak', function(data) {
          console.log(' will speak ');
          /*if(data.message)
          {
            $scope.speakNow(data.message);
          }
          else
          {
            $scope.speakNow(data.user + ' ' + $scope.format_time(data.value) + ' seconds.' );
          }*/
          $scope.speakNow(data);
          console.log(data);
        });

    socket.emit('fetch', 'data');

    $scope.speakNow = function(text) {
      if($scope.speakCheckBox)
      {
        var msg = new SpeechSynthesisUtterance();
        msg.text = text;
        window.speechSynthesis.speak(msg);
      }
    };

    $scope.updateData = function()
    {
      $scope.graph.data = [];
      $scope.graph.series = [];
      $scope.graph.labels = [];
      var max_lap_count = 0;
      for(var x=0;x<$scope.data.length;x++)
      {
        $scope.data[x].best = parseInt('990000');
        $scope.data[x].laps = 0;
        $scope.graph.series.push($scope.data[x].Name);
        var arr = [];
        for(var y=0;y<$scope.data[x].val.length;y++)
        {
            arr.push($scope.format_time($scope.data[x].val[y].lapTime));

            if($scope.data[x].best > parseInt($scope.data[x].val[y].lapTime))
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