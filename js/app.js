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
  model: function() {
    var multiModel = Ember.Object.create(
      {
        instagram: App.Instagram.getStuff(),
        tits: App.Tits.getTitsNow(),
      });
    return multiModel;
    // return App.Instagram.getUserid(localStorage.instagram_username).then(function(userid) {
    //   return App.Instagram.getStuff(userid);
    // });
  },
  setupController: function(controller, model) {
    controller.set('instagram', model.instagram);
    controller.set('tits', model.tits);
  }

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

App.InstagramController = Em.ArrayController.extend({
  content: [],

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

  actions: {
    getInstagramFeed: function(controller) {
      console.log('gettingController');
      return App.Instagram.getUserid(this.get('username')).then(function(userid) {
        this.setProperties({model:  App.Instagram.getFeed(userid)});
      });  
    },
  },
});


App.Instagram = Ember.Object.extend();

App.Instagram.reopenClass({
  getFakeUserid: function(username) {
    console.log(username);
    return promise = new Ember.RSVP.Promise(function(resolve, reject){
      resolve(44037631);
    });
  },
  getStuff: function(userid) {
    console.log('getting feed');
    var feed = Em.A();
      $.ajax({
        url:'https://api.instagram.com/v1/users/' + 44037631 + '/media/recent?access_token=' + localStorage.instagramtoken,
        type:'GET',
        dataType:'JSONP',
      }).then(function(json){
        json.data.forEach(function(entry){
         var entry = App.Instagramactivity.create(entry);
         feed.addObject(entry); 
        });
      }); // .ajax
    return feed;
  },//getFeed()
  getFeed: function(userid) {
    console.log('getting feed');
    return promise = new Ember.RSVP.Promise(function(resolve, reject){
      $.ajax({
        url:'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
        type:'GET',
        dataType:'JSONP',
      }).then(function(json){
        if (json.meta.code !== 200) {
          console.log("reject json: " + JSON.stringify(json));
            reject(json.meta);
          } // if
          else {
            console.log('feed data: ' + json.data[0].id);
            resolve(json.data);
          } // else 
      }); // .ajax
    });
  },//getFeed()
  saveUser: function(userObj) {
    // Pull localStorage array of users into local var
    var tempArray = JSON.parse(localStorage.Instagram);

    // 1 if userObj.username exists in tempArray , 0 if it doesn't
    if ($.grep(tempArray, function(e){ return e.username === userObj.username; }).length === 0) {
      
      //add new userObj to existing array of users
      tempArray.push(userObj);

      // Set localStorage.Instagram to array containing new userObj
      localStorage.setItem('Instagram',JSON.stringify(tempArray));
    }//if{}
  },//saveUser()
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
