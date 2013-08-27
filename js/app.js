App = Ember.Application.create();

App.Router.map(function() {
  this.resource("instagram");
  this.resource("instagramauth");
});

App.IndexRoute = Ember.Route.extend({ 
    redirect: function() {
      this.transitionTo('instagram');
	}
});

App.InstagramauthRoute = Em.Route.extend({
	url: 'https://instagram.com/oauth/authorize/?client_id=' + '0bc1b880b6934131be1aba1d76423980' + '&redirect_uri=' + 'file:///Users/Eric/Development/Projects/js/_Ember/Oauth-demo/index.html#/instagram' + '&response_type=token',

	setupController: function() {
		console.log(this.url);
	}

});

App.InstagramRoute = Ember.Route.extend({

	setupController: function(controller) {
		$.ajax({
			url: "https://api.instagram.com/v1/users/1574083/?access_token=" + App.Instagram.token,
		    // url:"https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980",
		    type:'GET',
		    dataType:'JSONP',
			}).then(function(json){
				if (json.meta.code !== 200) {
		     		console.log('in evetns hook.  Unauthorized, redirecting to: ' + App.Instagram.authURL);
		       		controller.transitionToRoute('instagramauth');
		       	}
				console.log('json: ' + JSON.stringify(json));
				controller.set('model', json.data);
		});
	},
});

App.Instagram = Em.Object.extend({

});

App.Instagram.reopenClass ({
	clientId: '0bc1b880b6934131be1aba1d76423980',
	redirectUri: 'file:///Users/Eric/Development/Projects/js/_Ember/Oauth-demo/index.html#/instagram',
	authURL: 'https://instagram.com/oauth/authorize/?client_id=' + '0bc1b880b6934131be1aba1d76423980' + '&redirect_uri=' + 'file:///Users/Eric/Development/Projects/js/_Ember/Oauth-demo/index.html#/instagram' + '&response_type=token',
	token: localStorage.Instagram_token,
	tokenChanged: function() {
	   localStorage.token = this.get('Instagram_token');
	 }.observes('token')
});