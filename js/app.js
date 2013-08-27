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
	setupController: function(controller) {
		$.ajax({
		    url:"https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980",
		    type:'GET',
		    dataType:'JSONP',
			}).then(function(json){
				console.log('json: ' + json.data[0].id);
				controller.set('model', json.data);
		});
	}
});