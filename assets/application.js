// Put your application javascript here

// Adds an attribute to the body tag, if the user is logged in as an admin
setTimeout(function(){
  if (document.getElementById('admin-bar-iframe')) document.body.setAttribute('data-admin','true');
}, 2000);
