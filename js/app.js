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


App.InstagramRoute = Ember.Route.extend({
  // model: function() {
  //   var multiModel = Ember.Object.create(
  //     {
  //       instagram: App.Instagram.getStuff(localStorage.instagram_username),
  //       tits: App.Tits.getTitsNow(),
  //     });
  //   return multiModel;
  //   // return App.Instagram.getUserid(localStorage.instagram_username).then(function(userid) {
  //   //   return App.Instagram.getStuff(userid);
  //   // });
  // },
  setupController: function(controller, model) {
    // controller.set('instagram', App.Instagram.getStuff(localStorage.instagram_username));
    // controller.set('tits', model.tits);
    controller.getInstagramFeed();
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
  getStuff: function(username) {
    console.log('getting feed');
    // return App.Instagram.getBalls(username).then(function(userid) {
      var feed = Em.A();
        $.ajax({
          url:'https://api.instagram.com/v1/users/' + App.Instagram.getBalls(username) + '/media/recent?access_token=' + localStorage.instagramtoken,
          type:'GET',
          dataType:'JSONP',
        }).then(function(json){
          json.data.forEach(function(entry){
           var entry = App.Instagramactivity.create(entry);
           feed.addObject(entry); 
          });
        }); // .ajax
      return feed;
    // }); // getUserid()
  }, //getStuff()
 getBalls: function(username) {
      // Check local storage for userid.
      if (/^\d+$/.test(localStorage.instagram_userid)) {
        return localStorage.instagram_userid;
      } //if{}

      // not in localStorage, hit the API with the passed in username
      else {
        $.ajax({
          url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
          type: 'GET',
          dataType: 'JSONP',
        }).then(function(json) {
          // Userid seach error
          if (json.meta.code !== 200) {
            console.log("reject json: " + JSON.stringify(json));
            return json.meta;
          } //if{}

          // else got a result back with no errors
          else {
            var userid = json.data[0].id;
            console.log('userid: ' + userid);

            // Save user to localStorage
            localStorage.instagram_userid = userid;
            return userid;
          } // else{}  
        }); // $.ajax().then
      } // else{}
    }, // getUserid
  getUserid: function(username) {
    console.log('getUserid()');
    return promise = new Ember.RSVP.Promise(function(resolve, reject){
      // Check local storage for userid.
      var tempArray = JSON.parse(localStorage.Instagram);

      // 1 if userObj.username exists in tempArray , 0 if it doesn't
      if ($.grep(tempArray, function(e){ return e.username === username; }).length === 1) {
        
        // [0] returns the object with that username, return the userid.
        resolve($.grep(tempArray, function(e){ return e.username === username; })[0].userid);
        
      }//if{}

      // not in localStorage, hit the API with the passed in username
      else {
        console.log('userid not in localstorage');
        $.ajax({
          url:'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
          type:'GET',
          dataType:'JSONP',
          }).then(function(json){
            // Userid seach error
            if (json.meta.code !==200) {
                console.log("reject json: " + JSON.stringify(json));
                reject(json.meta);
            } //if{}

            // else got a result back with no errors
            else {
                var userid = json.data[0].id;
                console.log('userid: ' + userid);

                // Save user to localStorage
                App.Instagram.saveUser({'username': username, 'userid': userid});
                resolve(userid);
            } //else{}  
          });
      } // else{}
    }) // promise
  } //getUserid
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
  getTitsPromise: function() {
    return promise = new Ember.RSVP.Promise(function(resolve, reject){
      resolve(["big", "ol", "titties"]);
    });
  },
  getTits: function() {
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
