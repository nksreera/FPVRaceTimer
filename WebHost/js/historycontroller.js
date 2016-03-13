var webApp = angular.module('webApp', ['chart.js']);



webApp.controller('mainCtrl', function ($scope,$http) {


$scope.data = [];


$scope.loadHistory = function() {
      $http.get("/historyData").success(function(data, status) {
            console.log(data);
            $scope.data = data;
            //$scope.apply();
        });
};

$scope.loadHistory();

$scope.home = function(){
  document.location.href = "/";
};


$scope.loadEdit = function(racer)
{
  $scope.currentUserId = racer;
  $scope.currentUserName = $scope.data[racer].name;
  $scope.currentUserDetails = $scope.data[racer].details;
  $('#myModal').modal() 
};

$scope.save = function()
{
  $http.post('/updateuser', { id: $scope.currentUserId, name:$scope.currentUserName, details:$scope.currentUserDetails }).success(function(data, status){
    console.log('done');
    $scope.data = data;
  });
};

});