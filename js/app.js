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
<<<<<<< HEAD
<<<<<<< HEAD
        instagram: App.Instagram.getAss(localStorage.instagram_username),
=======
        // instagram: App.Instagram.getStuff(localStorage.instagram_username),
>>>>>>> 69c7b7a
        // tits: App.Tits.getTitsNow(),
=======
        instagram: App.Instagram.getStuff(localStorage.instagram_username),
        tits: App.Tits.getTitsNow(),
>>>>>>> master
      });
    return multiModel;
    // return App.Instagram.getUserid(localStorage.instagram_username).then(function(userid) {
    //   return App.Instagram.getStuff(userid);
    // });
  },
  setupController: function(controller, model) {

    var useridPromise = App.Instagram.getUseridPromise(localStorage.instagram_username);
    useridPromise.then(function(userid) {
        controller.set('instagram', App.Instagram.getStuff(userid));
    });

    // controller.set('instagram', model.instagram);
    // controller.set('tits', model.tits);
    // controller.getInstagramFeed();
  }

});


App.InstagramController = Em.ArrayController.extend({
  content: [],
  actions: {
    getInstagramFeed: function(controller) {
      this.setProperties({
        instagram: App.Instagram.getFeed(this.get('username'))
      });//setProperties()
    },//getInstagramFeed()
  },
  getInstagramFeed: function(controller) {
    this.setProperties({
      instagram: App.Instagram.getFeed(this.get('username'), this.get('instagramtoken'))
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
<<<<<<< HEAD
<<<<<<< HEAD
  getFakeUserid: function(username) {
    console.log(username);
    return 44037631;
    // return promise = new Ember.RSVP.Promise(function(resolve, reject){
    //   resolve(44037631);
    // });
=======
  getRealid: function(username) {
    $.ajax({
          url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
          type: 'GET',
          dataType: 'JSONP',
        }).then(function(json) {
          var userid = json.data[0].id;
          return userid;
        });
>>>>>>> 69c7b7a
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

<<<<<<< HEAD
  getStuff: function(username) {
=======
  // getFakeUserid: function(username) {
  //   console.log(username);
  //   return 44037631;
  //   // return promise = new Ember.RSVP.Promise(function(resolve, reject){
  //   //   resolve(44037631);
  //   // });
  // },
  getFeed: function(username, access_token) {
    var promise = new RSVP.Promise(function(resolve, reject){
      // succeed
      resolve(value);
      // or reject
      reject(error);
    });

>>>>>>> master
=======
  getStuff: function(userid) {
>>>>>>> 69c7b7a
    console.log('getting feed');
    var feed = Em.A();
    $.ajax({
      url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
      type: 'GET',
      dataType: 'JSONP',
    }).then(function(json) {
      json.data.forEach(function(entry) {
        var entry = App.Instagramactivity.create(entry);
        feed.addObject(entry);
      });
    }); // .ajax
    return feed;
  }, //getStuff()
<<<<<<< HEAD
=======
 getUserid: function(username, access_token) {
  // Check local storage for userid.  Always lookup userid for when username changes it refreshes.  
  // This async .ajax() call breaks my shit now
  // if (/^\d+$/.test(localStorage.instagram_userid)) {
  if (false) {
    return localStorage.instagram_userid;
  } //if{}

  // not in localStorage, hit the API with the passed in username
  else {
    $.ajax({
      url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + access_token,
      type: 'GET',
      dataType: 'JSONP',
    }).then(
      function(json) {
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
        } // else{} no meta.code 
      }); // $.ajax().then
    } // else{}./d+
  }, // getUserid

>>>>>>> master

  getUseridPromise: function(username, access_token) {
    console.log('getUserid()');
    return promise = new Ember.RSVP.Promise(function(resolve, reject) {
<<<<<<< HEAD
      console.log('userid not in localstorage');
<<<<<<< HEAD
=======
>>>>>>> 69c7b7a
      resolve($.ajax({
        url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
        type: 'GET',
        dataType: 'JSONP',
      }).then(function(json) {
=======
      $.ajax({
        url: 'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + access_token,
        type: 'GET',
        dataType: 'JSONP',
      }).then(function(json) {
        // Userid seach error
        if (json.meta.code !== 200) {
          console.log("reject json: " + JSON.stringify(json));
          reject(json.meta);
        } //if{}

        // else got a result back with no errors
        else {
>>>>>>> master
          var userid = json.data[0].id;
          console.log('userid: ' + userid);
          // Save user to localStorage
          localStorage.instagram_userid = userid;
<<<<<<< HEAD
          return userid;
      }) //ajax()
      ); //resolve
    }) // promise
  },//getUseridPromise
=======
          resolve(userid);
        } //else{}  
      });
    }) // promise
  } //getUseridPromise

>>>>>>> master
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
