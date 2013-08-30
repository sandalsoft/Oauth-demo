App = Ember.Application.create({
    //  LOG_STACKTRACE_ON_DEPRECATION : true,
    // LOG_BINDINGS                  : true,
    // LOG_TRANSITIONS               : true,
    // LOG_TRANSITIONS_INTERNAL      : true,
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
  events: {
    error: function(reason, transition) {
      if (reason.code === 200) {
        console.log('AUTH ERROR: ' + JSON.stringify(reason));
        this.transitionTo('instagramauth');
      } else {
        console.log('UNKOWN ERROR: ' + JSON.stringify(reason));
      }
    }
  },
  model: function() {
    // App.Instagram.getUserid('lisallamontenegro').then(function(userid) {
      return App.Instagram.getFakeUserid('f').then(function(userid) {
        console.log('feefuserid: ' + userid);
        return Ember.RSVP.Promise(function(resolve, reject){
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
              console.log('%%# in feed: ' + json.data.length);
              resolve (json.data);
              // return json.data;
            } // else 
          }); //then()
        }); //var promise
      });
      // var userid = 44037631;
      
    // });//App.Instagram.getUserid()
  }
});

App.Instagram = Ember.Object.extend({
  loadedFeed: false,

  init: function() {
    var myfeed = this;
    console.log('init()');
    $.ajax({
      url:'https://api.instagram.com/v1/users/' + this.userid + '/media/recent?access_token=' + localStorage.instagramtoken,
      type:'GET',
      dataType:'JSONP',
    }).then(function(json){
      if (json.meta.code !== 200) {
        console.log("reject json: " + JSON.stringify(json));
          // reject(json.meta);
        } // if
        else {
          console.log('# in feed: ' + json.data.length);
          myfeed.setProperties({model: json.data});
        } // else 
    }); // .ajax
  },//init()
});

App.Instagram.reopenClass({
   getFakeUserid: function(username) {
    var promise = new Ember.RSVP.Promise(function(resolve, reject){
      resolve(44037631);
    });
    return promise;
  },
  getFeed: function(userid) {
    console.log('getFeed()');
    $.ajax({
      url:'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
      type:'GET',
      dataType:'JSONP',
    }).then(function(json){
      if (json.meta.code !== 200) {
        console.log("reject json: " + JSON.stringify(json));
          // reject(json.meta);
        } // if
        else {
          console.log('# in feed: ' + json.data.length);
          return json.data;
        } // else 
    }); // .ajax
  },//getFeed()


  getUserid: function(username) {
    var promise = new Ember.RSVP.Promise(function(resolve, reject){
          console.log('userid not in localstorage');
          $.ajax({
            url:'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
            type:'GET',
            dataType:'JSONP',
          }).then(function(json){
              // Something went wrong.
              if (json.meta.code !==200) {
                console.log("reject json: " + JSON.stringify(json));
                    // reject(json.meta);
                  }
                // Got a result back with no errors
                else {
                  var userid = json.data[0].id;
                    // resolve the userid to be returned by the promise
                    resolve(userid);
                    // return userid;
                  }   
                });
        // } // else
    }) // promise
return promise;
  } //App.Instagram.getUserid()
});

App.InstagramController = Em.ArrayController.extend({
  actions: {
    getInstagramFeed: function(controller) {
        // var thefeed = App.Instagram.create({username: this.get('username')});
        App.Instagram.getUserid(this.get('username')).then(function(theuserid) {
          console.log('FUCK: ' + theuserid);
          var thefeed = Em.A();
          thefeed = App.Instagram.getFeed(userid);
          console.log("thefeed: " + JSON.stringify(thefeed));
          this.setProperties({model: App.Instagram.getFeed(userid)});
          Ember.debugObj(this.get('model'));
        });
      },
    },


    instagramtoken: localStorage.instagramtoken,
    instagramtokenChanged: function() {
      localStorage.instagramtoken = this.get('instagramtoken');
    }.observes('instagramtoken'),
    content: [],
  });






// App.Instagram = Ember.Object.extend({
//   loadedFeed: false,

//   init: function() {
//     // if the input is a username and not userid, which will always be the case i suppose
//     // var isUserid = /^\d+$/.test(this.username);

//     // get the userid from the username 
//     App.Instagram.getUserid(this.username).then(function(userid) {
//       // dummy object to store username into localStorage
//       var instLS = {'username': this.username, 'userid': userid};
//       localStorage.setItem('instagram', JSON.stringify(instLS));

//       // Promise to get the users feed
//       // var promise = new Ember.RSVP.Promise(function(resolve, reject){
//         $.ajax({
//           url:'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
//           type:'GET',
//           dataType:'JSONP',
//           }).then(function(json){
//             if (json.meta.code ===400) {
//               console.log("reject json: " + JSON.stringify(json));
//               // reject(json.meta);
//             } // if
//             else {
//               console.log("RESOLVE json: " + json.data.length); 
//               // resolve(json.data);
//               return "hehehfehfe";
//             } // else 
//           }); // .ajax
//       // }) //promise
//         // return the feed inside the promise
//       // return promise;
//     }); //App.Instagram.getUserid promise()

//   },
// });


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