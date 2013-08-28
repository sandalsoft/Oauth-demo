App = Ember.Application.create();

App.Router.map(function() {
  this.route("catchme", { path: "*:"});
  this.resource("instagram");
  this.resource("instagramauth");
});

App.CatchmeRoute = Em.Route.extend({
  setupController: function() {
    console.log("hash pipe: " + window.location.hash);
  }
});

App.IndexRoute = Ember.Route.extend({ 
    redirect: function() {
      console.log("index hash: " + window.location.hash);
      this.transitionTo('instagram');
	}
});

App.InstagramauthRoute = Em.Route.extend({


  // beforeModel: function() {
  //   console.log("authroute hash: " + window.location.hash);
  // },

	setupController: function() {
    var redirect_uri = 'file:///Users/Eric/Development/Projects/js/_Ember/Oauth-demo/index.html%23/instagramauth';
    var client_id = '0bc1b880b6934131be1aba1d76423980';
    var url = 'https://instagram.com/oauth/authorize/?client_id=' + client_id + '&redirect_uri=' + redirect_uri + '&response_type=token';
  
		console.log('click: '  + url);
	}

});

App.InstagramController = Em.ArrayController.extend({
  instagramtoken: localStorage.instagramtoken,
  instagramtokenChanged: function() {
      localStorage.instagramtoken = this.get('instagramtoken');
   }.observes('instagramtoken'),

});

App.InstagramRoute = Ember.Route.extend({
  events: {
      error: function(reason, transition) {
          if (reason.code === 400) {
              // console.log('in evetns hook.  Unauthorized, redirecting to: ' + App.Instagram.authURL);
              this.transitionTo(App.Instagramauth);
          } else {
              console.log('err.  reason.code: ' + reason.code);
          }
      }
  },
  model: function(params, transition) {
      var promise = new Ember.RSVP.Promise(function(resolve, reject){
          $.ajax({
            url:"https://api.instagram.com/v1/users/1574083/?access_token=" + this.instagramtoken,
            // url:"https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980",
            type:'GET',
            dataType:'JSONP',
            }).then(function(json){
                if (json.meta.code ===400) {
                    reject(json.meta);
                }
                else {
                    resolve(json.data);
                }   
        });
      })
      return promise;
  }
});

App.LoadingRoute = Ember.Route.extend({});


// App.Instagram = Em.Object.extend({

// });

// App.Instagram.reopenClass ({
// 	clientId: '0bc1b880b6934131be1aba1d76423980',
// 	redirectUri: 'http://sandalsoft.com/Oauth-demo/index.html#/instagram',
// 	authURL: 'https://instagram.com/oauth/authorize/?client_id=' + '0bc1b880b6934131be1aba1d76423980' + '&redirect_uri=' + 'file:///Users/Eric/Development/Projects/js/_Ember/Oauth-demo/index.html#/instagram' + '&response_type=token',
// 	token: localStorage.Instagram_token,
// 	tokenChanged: function() {
// 	   localStorage.token = this.get('Instagram_token');
// 	 }.observes('token')
// });