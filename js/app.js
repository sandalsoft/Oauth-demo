App = Ember.Application.create({
    //  LOG_STACKTRACE_ON_DEPRECATION : true,
    // LOG_BINDINGS                  : true,
    LOG_TRANSITIONS               : true,
    LOG_TRANSITIONS_INTERNAL      : false,
    // LOG_VIEW_LOOKUPS              : true,
    // LOG_ACTIVE_GENERATION         : true 
});

App.Router.map(function() {
  this.route("catchme", { path: "*:"});
  this.resource("instagram");
  this.resource("instagramauth");
});

App.IndexRoute = Ember.Route.extend({ 
    redirect: function() {
      this.transitionTo('instagram');
  }
});

App.CatchmeRoute = Em.Route.extend({
  setupController: function() {
    localStorage.instagramtoken = window.location.hash.split("=")[1];
    console.log("access_token: " + localStorage.instagramtoken);
    this.transitionTo('instagram');
  }
});



App.InstagramauthRoute = Em.Route.extend({
	model: function() { 
    console.log("in model: of authroute");
    var redirect_uri = 'http://sandalsoft.com/Oauth-demo/index.html%23/instagramauth';
    var client_id = '0bc1b880b6934131be1aba1d76423980';
    var url = 'https://instagram.com/oauth/authorize/?client_id=' + client_id + '&redirect_uri=' + redirect_uri + '&response_type=token';
    return url;
	}
});

App.InstagramController = Em.ArrayController.extend({
  getInstagramFeed: function(controller) {
    console.log('text entry: ' + this.get('username'));
    var myinstgramfeed = App.Instagram.create({username: this.get('username')});
    this.setProperties({model: myinstgramfeed});
  },

  instagramtoken: localStorage.instagramtoken,
  instagramtokenChanged: function() {
      localStorage.instagramtoken = this.get('instagramtoken');
   }.observes('instagramtoken'),

   content: [],

  
});


App.Instagram = Ember.Object.extend({
  loadedFeed: false,

  init: function() {
    var isnum = /^\d+$/.test(this.username);

    if (!isnum) {
      console.log('not all numbers, getting userid for: ' + this.username);
      // this.userid = App.Instagram.getUserid(this.get('username'));
      $.ajax({
        url:'https://api.instagram.com/v1/users/search?q=' + this.username + '&access_token=' + localStorage.instagramtoken,
        type:'GET',
        dataType:'JSONP',
      }).then(function(json){
        if (json.meta.code !==200) {
          console.log('Error searging for userId: json: ' + JSON.stringify(json));
        }
        else {
          var userid = json.data[0].id;
          console.log('got search: ' + JSON.stringify(json.data[0].id));
          var myfeed = this;
          if (!myfeed.loadedFeed) {
            var promise = new Ember.RSVP.Promise(function(resolve, reject){
              $.ajax({
                url:'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
                type:'GET',
                dataType:'JSONP',
                }).then(function(json){
                    if (json.meta.code ===400) {
                        console.log("reject json: " + JSON.stringify(json));
                        reject(json.meta);
                    }
                    else {
                        console.log("RESOLVE json: " + JSON.stringify(json)); 
                        resolve(json.data);
                    }   
                });
              })
            return promise;
          }
        } 
    });
    }
  },
});

App.Instagram.reopenClass({
  getUserid: function(params) {
      var promise = new Ember.RSVP.Promise(function(resolve, reject){
        $.ajax({
          url:'https://api.instagram.com/v1/users/search?q=' + params + '&access_token=' + localStorage.instagramtoken,
          type:'GET',
          dataType:'JSONP',
          }).then(function(json){
              if (json.meta.code ===400) {
                  console.log("reject json: " + JSON.stringify(json));
                  reject(json.meta);
              }
              else {
                  console.log("RESOLVE json: " + JSON.stringify(json.data.id)); 
                  resolve(json.data.id);
              }   
          });
        })
      return promise;
    }
});

App.InstagramRoute = Ember.Route.extend({
  events: {
      error: function(reason, transition) {
          if (reason.code === 400) {
              console.log('in evetns hook.  Unauthorized, redirecting to: Instagramauth');
  
              this.transitionTo('instagramauth');
          } else {
              console.log('err.  reason.code: ' + JSON.stringify(reason));
          }
      }
  },
  model: function(params, transition) {
      var promise = new Ember.RSVP.Promise(function(resolve, reject){
        console.log("token: " + localStorage.instagramtoken);
          $.ajax({
            url:"https://api.instagram.com/v1/users/528979886/media/recent?access_token=" + localStorage.instagramtoken,
            // url:"https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980",
            type:'GET',
            dataType:'JSONP',
            }).then(function(json){
                if (json.meta.code ===400) {
                    console.log("reject json: " + JSON.stringify(json));
                    reject(json.meta);
                }
                else {
                    // console.log("RESOLVE json: " + JSON.stringify(json)); 
                    resolve(json.data);
                }   
        });
      })
      return promise;
  }
});

App.LoadingRoute = Ember.Route.extend({});

// 348191526.0bc1b88.913be5df5fa145f7a06de980d086592e
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