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
  actions: {
    error: function(reason, transition) {
      console.log('ERROR: ' + reason);
      // FIXME error handling codes
      if (reason.code === 200) {
        console.log('AUTH ERROR: ' + JSON.stringify(reason));
        this.transitionTo('instagramauth');
      } else {
        
      }
    }
  },

  model: function() {

    if (localStorage.instagram_userid) {
      var userid = localStorage.instagram_userid;
      console.log('userid from LS: ' + userid);
      this.setProperties({userid: userid});
    }

    if (localStorage.instagram_username) {
      console.log('instagram_username is: ' + localStorage.instagram_username);
      this.setProperties({username: localStorage.instagram_username});
    }

    return App.Instagram.getUserid(localStorage.instagram_username).then(function(userid) {
      return App.Instagram.getFeed(userid);
    });
  }
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
