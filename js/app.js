App = Ember.Application.create({
    // LOG_STACKTRACE_ON_DEPRECATION : true,
    // LOG_BINDINGS                  : true,
    // LOG_TRANSITIONS               : true,
    // LOG_TRANSITIONS_INTERNAL      : true,
    // LOG_VIEW_LOOKUPS              : true,
    // LOG_ACTIVE_GENERATION         : true 
  });

App.Router.map(function() {
  // This is needed to get the 
  this.route("catchme", { path: "*:"});
  this.resource("instagram");
  this.resource("instagramauth");
});

App.IndexRoute = Ember.Route.extend({ 
  redirect: function() {
      // console.log('!!: ' + App.Instagram.getFeed(44037631));
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


///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////


App.InstagramRoute = Ember.Route.extend({
  model: function() {
    var multiModel = Ember.Object.create(
      {
        instagram: App.Instagram.getAss(localStorage.instagram_username),
        // tits: App.Tits.getTitsNow(),
      });
    return multiModel;
    // return App.Instagram.getUserid(localStorage.instagram_username).then(function(userid) {
    //   return App.Instagram.getStuff(userid);
    // });
  },
  setupController: function(controller, model) {
    controller.set('instagram', model.instagram);
    // controller.set('tits', model.tits);
    // controller.getInstagramFeed();
  }

});


App.InstagramController = Em.ArrayController.extend({
  content: [],

    getInstagramFeed: function(controller) {
      this.setProperties({
        instagram: App.Instagram.getStuff(this.get('username'))
      });//setProperties()
    },//getInstagramFeed()


  instagramtoken: localStorage.instagramtoken,
  instagramtokenChanged: function() {
    localStorage.instagramtoken = this.get('instagramtoken');
  }.observes('instagramtoken'),
  
  username: localStorage.instagram_username,
  usernameChanged: function() {
    localStorage.instagram_username = this.get('username');
  }.observes('username'),

  userid: localStorage.instagram_userid,
  useridChanged: function() {
    localStorage.instagram_userid = this.get('userid');
  }.observes('userid'),
});


App.Instagram = Ember.Object.extend();

App.Instagram.reopenClass({
  getFakeUserid: function(username) {
    console.log(username);
    return 44037631;
    // return promise = new Ember.RSVP.Promise(function(resolve, reject){
    //   resolve(44037631);
    // });
  },
  
  getAss: function(username) {
    $.ajax({
      url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
      type: 'GET',
      dataType: 'JSONP',
    }).then(function(json) {
      var userid = json.data[0].id;
      console.log('userid: ' + userid);
      // Save user to localStorage
      localStorage.instagram_userid = userid;
      var feed = Em.A();
      $.ajax({
        url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
        type: 'GET',
        dataType: 'JSONP',
      }).then(function(json) {
        // console.log("data: " + JSON.stringify( json.data));
        json.data.forEach(function(entry) {
          var entry = App.Instagramactivity.create(entry);
          feed.addObject(entry);
        });
        console.log("feed: " + feed[0].created_time);
        return feed;
      }); // .ajax

    }) //ajax()
  },

  getStuff: function(username) {
    console.log('getting feed');
    return App.Instagram.getUseridPromise(username).then(function(userid) {
      var feed = Em.A();
        $.ajax({
          url:'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
          type:'GET',
          dataType:'JSONP',
        }).then(function(json){
          json.data.forEach(function(entry){
           var entry = App.Instagramactivity.create(entry);
           feed.addObject(entry); 
          });
        }); // .ajax
      return feed;
    }); // getUserid()
  }, //getStuff()

  getUseridPromise: function(username, access_token) {
    console.log('getUserid()');
    return promise = new Ember.RSVP.Promise(function(resolve, reject) {
      console.log('userid not in localstorage');
      resolve($.ajax({
        url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
        type: 'GET',
        dataType: 'JSONP',
      }).then(function(json) {
          var userid = json.data[0].id;
          console.log('userid: ' + userid);
          // Save user to localStorage
          localStorage.instagram_userid = userid;
          return userid;
      }) //ajax()
      ); //resolve
    }) // promise
  },//getUseridPromise
});

App.Instagramactivity = Em.Object.extend({
  createdTime: function() {
    return moment.unix(this.get('created_time')).fromNow();
  }.property('created_time'),
  caption: function() {
    return this.get('caption.text');
  }.property('caption.text'),

});


App.Tits = Em.Object.extend({});
App.Tits.reopenClass({
  getTitsPromise: function(username) {
   App.Tits.getTitsid(username).then(function(userid) {
      console.log('titsId: ' + userid);
      var feed = Em.A();
      setTimeout(function() {
        console.log('returning titsPromise');
        return ["big", "ol", "titties"];
      }, 1000);
    });
  },
  getTitsid: function() {
    return promise = new Ember.RSVP.Promise(function(resolve, reject){
      setTimeout(function() {
        resolve(30662803);
      }, 1000);
      
    });
  },
  getTitsDelay: function() {
    setTimeout(function() {
        console.log('returning tits');
        return ["big", "ol", "titties"];
    }, 2000);
  },
  getTitsNow: function() {
    return ["big", "ol", "titties"];
  },

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

App.LoadingRoute = Ember.Route.extend({});
