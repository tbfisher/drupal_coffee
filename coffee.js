(function ($) {

  Drupal.coffee = Drupal.coffee || {};

  Drupal.behaviors.coffee = {
    attach: function () {
      $('body').once('coffee', function () {

        var body = $(this);

        Drupal.coffee.bg.appendTo(body).hide();

        Drupal.coffee.label.appendTo(Drupal.coffee.form);
        Drupal.coffee.field.appendTo(Drupal.coffee.form);
        Drupal.coffee.results.appendTo(Drupal.coffee.form);
        Drupal.coffee.form.wrapInner('<div id="coffee-form-inner" />').appendTo(body).hide();

        $(document).keydown(function (event) {

          // Show the form with alt + D. Use 2 keycodes as 'D' can be uppercase or lowercase
          if ( !Drupal.coffee.form.is(':visible') && event.altKey === true && (event.keyCode === 68 || event.keyCode === 206) ) {
            Drupal.coffee.open();
            event.preventDefault();
          }

          // Close the form with esc or alt + D
          else if ( Drupal.coffee.form.is(':visible') && (event.keyCode === 27 || (event.altKey === true && (event.keyCode === 68 || event.keyCode === 206))) ) {
            Drupal.coffee.close();
            event.preventDefault();
          }

          // Use the arrow up/down keys to navigate trough the results
          else if ( Drupal.coffee.form.is(':visible') && Drupal.coffee.results.children().length && (event.keyCode === 38 || event.keyCode === 40) ) {
            Drupal.coffee.move(event.keyCode === 38 ? 'up' : 'down');
            event.preventDefault();
          }

          // Enter key handling for the search field: redirect to the first result if there are any
          else if (Drupal.coffee.form.is(':visible') && event.keyCode === 13 && $(document.activeElement)[0] === Drupal.coffee.field[0]) {
            if (Drupal.coffee.results.children().length) {
              Drupal.coffee.redirect(Drupal.coffee.results.find('a:first').attr('href'));
            }
            event.preventDefault();
          }

        });

        // Prevent multiple highlighted results with :hover and :focus ==>> Temporarily disabled because of Firefox issues (http://drupal.org/node/1400852)
        // .live() is deprecated ==>> convert to .on() when Drupal gets jQuery 1.7+
        // http://api.jquery.com/live/
        $('#coffee-results a')// .live('hover', function () {
          // $(this).focus();
        // })
        // Remove the fake focus class once actual focus is used
        .live('focus', function () {
          Drupal.coffee.results.find('.focus').removeClass('focus');
        // We close the form explicitly after following a link as pages aren't reloaded when the overlay module is used
        }).live('click', function () {
          Drupal.coffee.close();
        });
      });
    }
  };

  Drupal.coffee.open = function () {
    Drupal.coffee.form.show();
    Drupal.coffee.bg.show();
    Drupal.coffee.field.focus();
  };

  Drupal.coffee.close = function () {
    Drupal.coffee.field.val('');
    Drupal.coffee.results.empty();
    Drupal.coffee.form.hide();
    Drupal.coffee.bg.hide();
  };

  Drupal.coffee.move = function (direction) {

    var activeElement = $(document.activeElement);

    // Jump to the last result if 'up' is used at the first, and to the first result if 'down' is used on the last.
    // From the search field: skip the first result if it already has the fake focus class.
    if (activeElement[0] === Drupal.coffee.results.find('a:' + (direction === 'up' ? 'first' : 'last'))[0] || activeElement[0] === Drupal.coffee.field[0]) {
      Drupal.coffee.results.find((direction === 'down' && Drupal.coffee.results.find('.focus').length ? 'li:nth-child(2) ' : '') + 'a:' + (direction === 'up' ? 'last' : 'first')).focus();
    }
    else if (direction === 'up') {
      activeElement.parent().prev().find('a').focus();
    }
    else {
      activeElement.parent().next().find('a').focus();
    }
  };

  Drupal.coffee.redirect = function (path) {
    Drupal.coffee.close();
    document.location = path;
  };

  // The elements

  Drupal.coffee.label = $('<label for="coffee-q" class="element-invisible" />').text(Drupal.t('Query'));

  Drupal.coffee.results = $('<ol id="coffee-results" />');

  // Instead of appending results one by one, we put them in a placeholder element
  // first and then append them all at once to prevent flickering while typing.
  Drupal.coffee.resultsPlaceholder = $('<ol />');

  Drupal.coffee.form = $('<form id="coffee-form" />');

  Drupal.coffee.bg = $('<div id="coffee-bg" />').click(function () {
    Drupal.coffee.close();
  });

  Drupal.coffee.field = $('<input id="coffee-q" type="text" autocomplete="off" />').keyup(function () {
    Drupal.coffee.resultsPlaceholder.empty();

    $.getJSON(Drupal.settings.basePath + 'admin/coffee/result/' + Drupal.coffee.field.val(), function (data) {
      if (data) {
        $.each(data, function (key, value) {
          var description = $('<small class="description" />').text(value.path);
          $('<a />').text(value.title)
            .attr('href', Drupal.settings.basePath + value.path)
            .append(description)
            .appendTo(Drupal.coffee.resultsPlaceholder)
            .wrap('<li />');
        });

        // Highlight the first result as if it were focused, as a visual hint for
        // what will happen when the enter key is used in the search field.
        Drupal.coffee.results.html(Drupal.coffee.resultsPlaceholder.children()).find('a:first').addClass('focus');
      }
    });
  });

}(jQuery));
