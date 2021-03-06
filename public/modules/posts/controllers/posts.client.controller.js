'use strict';

// Posts controller
angular.module('posts').controller('PostsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Posts','$http','$state',
	function($scope, $stateParams, $location, Authentication, Posts,$http,$state) {
		$scope.authentication = Authentication;

		// Create new Post
		$scope.create = function() {
            $http.post('/posts', $scope.fields).success(function(response) {
            // And redirect to the project page
                $location.path('/posts/'+response._id);
            }).error(function(response) {
                $scope.error = response.message;
        });
        };

		// Remove existing Post
		$scope.remove = function() {
            var post = $scope.post;
			$http.put('/posts/'+post._id+'/remove').success(function (response) {
                $location.path('/posts');
                $scope.post.isActive=false;
            }).error(function(response){
                $scope.error=response.message;
            });
		};

		// Update existing Post
		$scope.update = function() {
            var post = $scope.post;
            $http.put('/posts/'+post._id,$scope.edit).success(function (response) {
                $location.path('posts/' + response._id);
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        // Opt in
        $scope.opt_in= function(){
            var post = $scope.post;
            //var message =$scope.notification.message;
            //console.log(message);
            if($scope.notification!==undefined){
                var notificationOft = {
                    title: 'I am interested in your QuickSource Project',
                    message: $scope.notification.message
                };
                //console.log(post.user._id);
                //console.log($scope.notificationOft);
                $http.post('/notification/user/'+post.user._id+'/send',notificationOft).success(function(response) {
                });
            }
            $http.post('/posts/'+post._id+'/opt-in').success(function(response){
                $scope.post.interestedUsers = response.interestedUsers;
                post.isAlreadyInterested = true;
                console.log(response);
            }).error(function(response){
                $scope.error = response.message;
            });

        };

        //Opt out
        $scope.opt_out = function(){
            var post = $scope.post;
            $http.post('/posts/'+post._id+'/opt-out').success(function(response){
                $scope.post.interestedUsers = response.interestedUsers;
                post.isAlreadyInterested = false;
            }).error(function(response){
                $scope.error = response.message;
            });
        };

		// Find a list of Posts
		$scope.find = function() {
			$scope.posts = Posts.query();
		};

        $scope.addComment = function(){
            var post = $scope.post;
            $http.post('/posts/'+post._id+'/addComment', $scope.comment).success(function(response){
               //$http.post('/posts')
                $http.get('/posts/'+post._id+'/listComments').success(function(response) {
                    $scope.post.comments = response;
                });
               //console.log(response);
            }).error(function(response){
                $scope.error = response.message;
            });
        };

        $scope.findOne = function(){
            //var post = $scope.post;
            $http.get('/posts/'+$stateParams.postId).success(function(post){

                post.isAlreadyInterested = false;
                post.isPoster = false;
                for (var key in post.interestedUsers) {
                    if (post.interestedUsers.hasOwnProperty(key)) {
                        if(post.interestedUsers[key]._id===$scope.authentication.user._id){
                            post.isAlreadyInterested=true;
                        }
                    }
                }
                if(post.user._id===$scope.authentication.user._id){
                    post.isPoster=true;
                }
                post.user.profileImage = 'uploads/profilePic/'+post.user.profilePic;
                $scope.post = post;
                //console.log(post);
            }).error(function(response){
                alert(response.message);
                $scope.error = response.message;
                $location.path('/posts');
            });
        };

	}
]);
