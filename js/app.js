App = Ember.Application.create();

App.Router.map(function() {
  this.resource("instagram");
});

App.IndexRoute = Ember.Route.extend({ 
    redirect: function() {
      this.transitionTo('instagram');
	}
});

App.InstagramRoute = Ember.Route.extend({
	// model: 	App.Instagram.create({user: 'ericlarsnelson'});
	model: function() {
		return $.getJSON('https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980');
	}
});

App.Instagram = Em.Object.extend({
	loadedFeed: false,

	
	init: function() {
		var myfeed = this;
		if (!myfeed.loadedFeed) {
			this._super();
			$.getJSON('https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980').then(function(json){	
		  		console.log('starting insta');
		  		var feed = Em.A();
				json.data.forEach(function (item) {
				  	item.created_time_formatted = moment.unix(item.created_time).fromNow();
				  	feed.pushObject(item);
				});

				myfeed.setProperties({feed: feed, loadedProfile: true});
			});
		}	
	},			
});