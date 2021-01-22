(function () {
  // Updating an <output> with the value of a linked input range element
  (function () {
    var linkedOutputs = document.querySelectorAll('output[for]');
    // Do we have any output elements on the page which are attached to form elements?
    if (linkedOutputs) {
      // Loop through the output elements on the page
      for (var i = 0; i < linkedOutputs.length; i += 1) {
        // IIFE added to scope variables
        (function () {
          var thisOutput = linkedOutputs[i];
          var targetID = thisOutput.getAttribute('for');
          // Do we have a valid input attached?
          if (document.getElementById(targetID)) {
            var targetElement = document.getElementById(targetID);
            // Update the output with the current value
            thisOutput.innerHTML = targetElement.value;
            targetElement.addEventListener('input', function () {
              thisOutput.innerHTML = targetElement.value;
              minMaxCheck(targetID);
            });
            // For IE11
            targetElement.addEventListener('change', function () {
              thisOutput.innerHTML = targetElement.value;
              minMaxCheck(targetID);
            });
          }
        })();
      }
    }
  })();

  // This ensures that if the minimum and maximum values overlap, they are adjusted to match.
  // HARD-CODED ID ALERT!
  function minMaxCheck(userElID) {
    var elMinID = 'price-range-min';
    var elMaxID = 'price-range-max';
    var elMin = document.getElementById(elMinID);
    var elMax = document.getElementById(elMaxID);
    var inputEvent = document.createEvent('Event');
    inputEvent.initEvent('input', true, true);
    // If the user has changes the minimum slider, and it's now higher than the maximum slider
    if (userElID == elMinID && parseInt(elMin.value) > parseInt(elMax.value)) {
      elMax.value = elMin.value;
      elMax.dispatchEvent(inputEvent);
    }
    // If the user has changed the maximum slider, and it's now lower than the minimum slider
    else if (userElID == elMaxID && parseInt(elMax.value) < parseInt(elMin.value)) {
      elMin.value = elMax.value;
      elMin.dispatchEvent(inputEvent);
    }
  }

  // Rebuilds the product results, based on user's choices
  function refreshProducts() {
    var userMinPrice = parseInt(document.getElementById('price-range-min').value) * 100;
    var userMaxPrice = parseInt(document.getElementById('price-range-max').value) * 100;
    var userChoices = document.querySelectorAll('[data-js="filter"] input:checked');
    var productsString = '';
    // A running count of products which match the user's search configuration
    var matchingProductCount = 0;

    // Product loop
    for (var i = 0; i < objProducts.length; i++) {
      var product = objProducts[i];
      var matchesUserChoices = true;
      // Has the user made any choices?
      if (userChoices.length > 0) {
        // Loop through all of the checked inputs in the filter
        for (var j = 0; j < userChoices.length; j++) {
          var choice = userChoices[j];
          var method = choice.getAttribute('data-js');
          var name   = choice.getAttribute('name');
          var id     = choice.getAttribute('id');

          switch (method) {
            case 'tag':
              matchesUserChoices = matchesProductTag(product,collectIDs(name));
              break;
            case 'choice':
              matchesUserChoices = matchesChoice(product,name,id);
              break;
            case 'metafield':
              matchesUserChoices = matchesMetafield(product,name,id);
              break;
          }
          // Break out early as soon as false is found
          if (!matchesUserChoices) break;
        }
      }

      var stockCheck = true;
      // Only show products which are in stock
      if (document.getElementById('inStock').checked && !product.inStock) stockCheck = false;

      // Does this product match the user's criteria?
      if (
        product.intPrice >= userMinPrice &&
        product.intPrice <= userMaxPrice &&
        matchesUserChoices &&
        stockCheck
      ) {
        matchingProductCount++;
        productsString += '<section aria-label="' + product.title + '" itemscope="" itemtype="http://schema.org/Product">' +
          '<p><img src="' + product.image + '" alt="' + product.imageAlt + '" itemprop="image" loading="lazy"></p>' +
          '<h3 itemprop="name">' + product.title + '</h3>' +
          '<p>' + product.description + '</p>' +
          '<div itemprop="offers" itemscope="" itemtype="http://schema.org/Offer">';
        if (product.highPrice) {
          productsString += '<p>Retail: <del itemprop="highPrice">' + product.highPrice + '</del></p>';
        }
        productsString += '<p itemprop="price">' + product.lowPrice + '</p></div>';
        if (product.saving) {
          productsString += '<p>Saving ' + product.saving + '</p>';
        }
        if (product.inStock) {
          productsString += '<p><a href="/cart/add?id=' + product.id + '">Order now</a></p>';
        } else {
          productsString += '<p><strong>Sorry - this product is sold out</strong></p>';
        }
        productsString += '<p><a href="' + product.url + '">More information about ' + product.title + '</a></p></section>';
      }
    }
    if (productsString === '') {
      productsString = '<p>No products found. Please try widening your search.</p>';
    }
    // We have at least one product and need to add the count to the top of the results.
    else {
      var plural = '';
      if (matchingProductCount > 1) plural = 's';
      productsString = '<h2>We have found ' + matchingProductCount + ' product' + plural + '</h2>' + productsString;
    }
    document.querySelector('[data-js="products"]').innerHTML = productsString;
  }

  // Listens for changes inside the filter panel
  (function () {
    var filterDad = document.querySelector('[data-js="filter"]');
    var inputs = filterDad.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', refreshProducts);
    }
    filterDad.addEventListener('reset', function() {
      window.setTimeout(refreshProducts, 500);
    });
  })();

  // This function is passed a name attribute. It loops throught the document
  // finding matches. It takes the ID attributes for the matches and returns them as an Array.
  function collectIDs(name) {
    var elements = document.querySelectorAll('[name="' + name + '"]:checked');
    var ids = [];
    for (var i = 0; i < elements.length; i++) ids.push(elements[i].getAttribute('id'));
    return ids;
  }

  // This function is passed a product object and an array of IDs, representing the selected
  // tags. It compares the selected tags to the current product's tags and if any match, it
  // returns true.
  function matchesProductTag(product, userTags) {
    // If no tags are specified, they don't end up in the JSON
    if (!product.tags) {
      return false;
    } else {
      var arProductTags = product.tags;
    }
    if (typeof userTags === 'object') {
      // The user has not selected any tags
      if (userTags.length === 0) return true;
      for (i = 0; i < arProductTags.length; i++) {
        // At least one of the user's chosen tags are present in the current product
        if (userTags.indexOf(arProductTags[i]) >= 0) return true;
      }
      // Looped through all the product tags: no matches found
      return false;
    }
  }

  // This function is passed a product object, a metadata field filter name and the user's choice.
  // It compares the type to each item in the metafield array then returns a boolean.
  function matchesMetafield(product,metafield,userChoice) {
    // Does this product have a match with the user's chosen product type?
    if (userChoice === undefined) { // No type chosen
      return true;
    }
    // This particular product might have no stored data for this user's choice
    else if (!product[metafield]) {
      return false;
    } else {
      var arTypes = product[metafield].split('|');
      // The last item is just filler
      arTypes.length = (arTypes.length - 1);
      // Loop through the array of product types associated with this product, to find a match
      for (var i = 0; i < arTypes.length; i++) {
        if(arTypes[i] === userChoice) return true;
      }
      return false;
    }
  }

  // This is similar to matchesMetafield(), but for simple name / value string pairs on the product object.
  function matchesChoice(product,name,userChoice) {
    var productValue = product[name];
    if (userChoice === undefined) return true; // User has not made a choice
    else if (productValue === userChoice) return true;
    else return false;
  }

  // Allows radiobuttons to be deselected with a second click on the label
  document.addEventListener('click', function (e) {
    var tag = e.target, target;
    if (tag.tagName === 'LABEL') {
      // Does a valid target for the label tag exist?
      if (document.getElementById(tag.getAttribute('for'))) {
        target = document.getElementById(tag.getAttribute('for'));
      }
      // Is the input tag nested inside?
      else if (tag.querySelector('input')) {
        target = tag.querySelector('input');
      }
      if (target.checked) {
        target.checked = false;
        // Trigger a change event, so the results will refresh
        var inputEvent = document.createEvent('Event');
        inputEvent.initEvent('change', true, true);
        target.dispatchEvent(inputEvent);
        e.preventDefault();
      }
    }
  }, false);

  // Initial page load product population
  refreshProducts();
})();
