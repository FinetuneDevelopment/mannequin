(function () {
  // Show content JSON, select boxes
  var btnView = document.getElementById('view-json');
  btnView.addEventListener('click', function () {
    // Uo to five select boxes, letting you choose the content
    var id, selectBoxes = document.querySelectorAll('[data-js="auto"]');
    for (var i = 0; i < selectBoxes.length; i++) {
      // Content item ID
      id = selectBoxes[i].value;
      // Used for blog articles and product variations
      parentID = selectBoxes[i].options[selectBoxes[i].selectedIndex].getAttribute('data-parentid');
      // This will follow the first valid link found, then stop.
      if (parentID && id !== '') {
        bounce(id, selectBoxes[i].getAttribute('id'), parentID);
        break;
      } else if (id !== '') {
        bounce(id, selectBoxes[i].getAttribute('id'));
        break;
      }
    }
  });

  // "Bounces" the user to the correct URL to view their JSON
  function bounce(id, contentType, parentID) {
    var URL = '';
    // shopify.dev/docs/admin-api/rest/reference/metafield
    switch (contentType) {
      case 'variants':
        URL = '/admin/products/' + parentID + '/' + contentType + '/' + id + '/metafields.json';
        break;
      case 'articles':
        URL = '/admin/blogs/' + parentID + '/' + contentType + '/' + id + '/metafields.json';
        break;
      default:
        URL = '/admin/' + contentType + '/' + id + '/metafields.json';
    }
    document.location.href = '//' + document.location.hostname + URL;
  }
})();