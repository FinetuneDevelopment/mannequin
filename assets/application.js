// Put your application javascript here

// An array of CSS selectors, which represent elements which might appear in the DOM,
// to indicate that the user is logged in as an admin.
var adminSelectors = ['#admin-bar-iframe'];

// Because some of the elements take a while to arrive in the DOM, this gives them a couple of seconds grace.
setTimeout(function(){
  if (domCheck(adminSelectors)) document.body.setAttribute('data-admin','true');
}, 2000);

// Takes an Array as a param, which is a list of CSS selectors. Checks to see if any of them
// exist in the DOM. If any do, it returns true. If none of them do (or it is called
// incorrectly), it returns false.
function domCheck(list) {
  if (!Array.isArray(list)) return false;
  for (var i = 0; i < list.length; i++) {
    var currentSelector = list[i];
    if(document.querySelector(currentSelector)) return true;
  }
  return false;
}
