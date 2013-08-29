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
  model: function(params, transition) {
    if (this.get('username')) {
      console.log('tthis.get.username: ' + this.get('username'));
      return App.Instagram.create({username: this.get('username')});
    }
      // var promise = new Ember.RSVP.Promise(function(resolve, reject){
      //   console.log("token: " + localStorage.instagramtoken);
      //     $.ajax({
      //       url:'https://api.instagram.com/v1/users/' +  '/media/recent?access_token=' + localStorage.instagramtoken,
      //       // url:"https://api.instagram.com/v1/media/popular?client_id=0bc1b880b6934131be1aba1d76423980",
      //       type:'GET',
      //       dataType:'JSONP',
      //       }).then(function(json){
      //           if (json.meta.code ===400) {
      //               console.log("reject json: " + JSON.stringify(json));
      //               reject(json.meta);
      //           }
      //           else {
      //               // console.log("RESOLVE json: " + JSON.stringify(json)); 
      //               resolve(json.data);
      //           }   
      //   });
      // })
      // return promise;
  }
});

App.InstagramController = Em.ArrayController.extend({
  getInstagramFeed: function(controller) {
    console.log('text entry sybmit: ' + this.get('username'));
    var thefeed = App.Instagram.create({username: this.get('username')});
    this.setProperties({model: thefeed});
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
    // if the input is a username and not userid, which will always be the case i suppose
    // var isUserid = /^\d+$/.test(this.username);

    // get the userid from the username 
    App.Instagram.getUserid(this.username).then(function(userid) {
      console.log("~~userid: " + userid);
      // dummy object to store username into localStorage
      var instLS = {'username': this.username, 'userid': userid};
      localStorage.setItem('instagram', JSON.stringify(instLS));

      // Promise to get the users feed
      var promise = new Ember.RSVP.Promise(function(resolve, reject){
        $.ajax({
          url:'https://api.instagram.com/v1/users/' + userid + '/media/recent?access_token=' + localStorage.instagramtoken,
          type:'GET',
          dataType:'JSONP',
          }).then(function(json){
            if (json.meta.code ===400) {
              console.log("reject json: " + JSON.stringify(json));
              reject(json.meta);
            } // if
            else {
              // console.log("RESOLVE json: " + JSON.stringify(json)); 
              resolve(json.data);
            }  // else 
          }); // .ajax\
      }) //promise
        // return the feed inside the promise
      return promise;
    }); //App.Instagram.getUserid promise()
  },
});

App.Instagram.reopenClass({
  getUserid: function(username) {
    var promise = new Ember.RSVP.Promise(function(resolve, reject){
        // Check local storage for userid.
        if (JSON.parse(localStorage.instagram).userid) {
          console.log("LSuserid: " + JSON.parse(localStorage.instagram).userid);
            resolve(JSON.parse(localStorage.instagram).userid);
        }
        // IF not in localStorage, hit the API with the passed in username
        else {
          console.log('userid not in localstorage');
          $.ajax({
            url:'https://api.instagram.com/v1/users/search?q=' + username + '&access_token=' + localStorage.instagramtoken,
            type:'GET',
            dataType:'JSONP',
            }).then(function(json){
              // Something went wrong.
                if (json.meta.code !==200) {
                    console.log("reject json: " + JSON.stringify(json));
                    reject(json.meta);
                }
                // Got a result back with no errors
                else {
                    var userid = json.data[0].id;
                    console.log("RESOLVE json: " + JSON.stringify(json.data.id)); 
                    // Create dummy object to hold username and newly retrieved 
                    console.log("~~json.data.id: " + JSON.stringify(userid));
                    var instLS = {'username': username, 'userid': userid};
                    // set localStorage to username and userid
                    localStorage.setItem('instagram',JSON.stringify(instLS))
                    // resolve the userid to be returned by the promise
                    console.log("returning: " + userid);
                    resolve(userid);
                }   
            });
        } // else
    }) // promise
    return promise;
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