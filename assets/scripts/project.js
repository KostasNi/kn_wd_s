'use strict';

/**
 * File js-enabled.js
 *
 * If Javascript is enabled, replace the <body> class "no-js".
 */
document.body.className = document.body.className.replace('no-js', 'js');
'use strict';

/**
 * File modal.js
 *
 * Deal with multiple modals and their media.
 */
window.wdsModal = {};

(function (window, $, app) {
	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			'body': $('body')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return $('.modal-trigger').length;
	};

	// Combine all events.
	app.bindEvents = function () {
		// Trigger a modal to open.
		app.$c.body.on('click touchstart', '.modal-trigger', app.openModal);

		// Trigger the close button to close the modal.
		app.$c.body.on('click touchstart', '.close', app.closeModal);

		// Allow the user to close the modal by hitting the esc key.
		app.$c.body.on('keydown', app.escKeyClose);

		// Allow the user to close the modal by clicking outside of the modal.
		app.$c.body.on('click touchstart', 'div.modal-open', app.closeModalByClick);
	};

	// Open the modal.
	app.openModal = function () {
		// Figure out which modal we're opening and store the object.
		var $modal = $($(this).data('target'));

		// Display the modal.
		$modal.addClass('modal-open');

		// Add body class.
		app.$c.body.addClass('modal-open');
	};

	// Close the modal.
	app.closeModal = function () {
		// Figure the opened modal we're closing and store the object.
		var $modal = $($('div.modal-open .close').data('target'));

		// Find the iframe in the $modal object.
		var $iframe = $modal.find('iframe');

		// Get the iframe src URL.
		var url = $iframe.attr('src');

		// Remove the source URL, then add it back, so the video can be played again later.
		$iframe.attr('src', '').attr('src', url);

		// Finally, hide the modal.
		$modal.removeClass('modal-open');

		// Remove the body class.
		app.$c.body.removeClass('modal-open');
	};

	// Close if "esc" key is pressed.
	app.escKeyClose = function (event) {
		if (27 === event.keyCode) {
			app.closeModal();
		}
	};

	// Close if the user clicks outside of the modal
	app.closeModalByClick = function (event) {
		// If the parent container is NOT the modal dialog container, close the modal
		if (!$(event.target).parents('div').hasClass('modal-dialog')) {
			app.closeModal();
		}
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsModal);
'use strict';

/* global screenReaderText */
/**
 * Theme functions file.
 *
 * Contains handlers for navigation and widget area.
 */

(function ($) {
    var body, masthead, menuToggle, siteNavigation, socialNavigation, siteHeaderMenu, resizeTimer;

    function initMainNavigation(container) {

        // Add dropdown toggle that displays child menu items.
        var dropdownToggle = $('<button />', {
            'class': 'dropdown-toggle',
            'aria-expanded': false
        }).append($('<span />', {
            'class': 'screen-reader-text',
            text: screenReaderText.expand
        }));

        container.find('.menu-item-has-children > a').after(dropdownToggle);

        // Toggle buttons and submenu items with active children menu items.
        container.find('.current-menu-ancestor > button').addClass('toggled-on');
        container.find('.current-menu-ancestor > .sub-menu').addClass('toggled-on');

        // Add menu items with submenus to aria-haspopup="true".
        container.find('.menu-item-has-children').attr('aria-haspopup', 'true');

        container.find('.dropdown-toggle').click(function (e) {
            var _this = $(this),
                screenReaderSpan = _this.find('.screen-reader-text');

            e.preventDefault();
            _this.toggleClass('toggled-on');
            _this.next('.children, .sub-menu').toggleClass('toggled-on');

            // jscs:disable
            _this.attr('aria-expanded', _this.attr('aria-expanded') === 'false' ? 'true' : 'false');
            // jscs:enable
            screenReaderSpan.text(screenReaderSpan.text() === screenReaderText.expand ? screenReaderText.collapse : screenReaderText.expand);
        });
    }
    initMainNavigation($('.main-navigation'));

    masthead = $('#masthead');
    menuToggle = masthead.find('#menu-toggle');
    siteHeaderMenu = masthead.find('#site-header-menu');
    siteNavigation = masthead.find('#site-navigation');
    socialNavigation = masthead.find('#social-navigation');

    // Enable menuToggle.
    (function () {

        // Return early if menuToggle is missing.
        if (!menuToggle.length) {
            return;
        }

        // Add an initial values for the attribute.
        menuToggle.add(siteNavigation).add(socialNavigation).attr('aria-expanded', 'false');

        menuToggle.on('click', function () {
            $(this).add(siteHeaderMenu).toggleClass('toggled-on');

            // jscs:disable
            $(this).add(siteNavigation).add(socialNavigation).attr('aria-expanded', $(this).add(siteNavigation).add(socialNavigation).attr('aria-expanded') === 'false' ? 'true' : 'false');
            // jscs:enable
        });
    })();

    // Fix sub-menus for touch devices and better focus for hidden submenu items for accessibility.
    (function () {
        if (!siteNavigation.length || !siteNavigation.children().length) {
            return;
        }

        // Toggle `focus` class to allow submenu access on tablets.
        function toggleFocusClassTouchScreen() {
            if (window.innerWidth >= 910) {
                $(document.body).on('touchstart', function (e) {
                    if (!$(e.target).closest('.main-navigation li').length) {
                        $('.main-navigation li').removeClass('focus');
                    }
                });
                siteNavigation.find('.menu-item-has-children > a').on('touchstart', function (e) {
                    var el = $(this).parent('li');

                    if (!el.hasClass('focus')) {
                        e.preventDefault();
                        el.toggleClass('focus');
                        el.siblings('.focus').removeClass('focus');
                    }
                });
            } else {
                siteNavigation.find('.menu-item-has-children > a').unbind('touchstart');
            }
        }

        if ('ontouchstart' in window) {
            $(window).on('resize', toggleFocusClassTouchScreen);
            toggleFocusClassTouchScreen();
        }

        siteNavigation.find('a').on('focus blur', function () {
            $(this).parents('.menu-item').toggleClass('focus');
        });
    })();

    // Add the default ARIA attributes for the menu toggle and the navigations.
    function onResizeARIA() {
        if (window.innerWidth < 910) {
            if (menuToggle.hasClass('toggled-on')) {
                menuToggle.attr('aria-expanded', 'true');
            } else {
                menuToggle.attr('aria-expanded', 'false');
            }

            if (siteHeaderMenu.hasClass('toggled-on')) {
                siteNavigation.attr('aria-expanded', 'true');
                socialNavigation.attr('aria-expanded', 'true');
            } else {
                siteNavigation.attr('aria-expanded', 'false');
                socialNavigation.attr('aria-expanded', 'false');
            }

            menuToggle.attr('aria-controls', 'site-navigation social-navigation');
        } else {
            menuToggle.removeAttr('aria-expanded');
            siteNavigation.removeAttr('aria-expanded');
            socialNavigation.removeAttr('aria-expanded');
            menuToggle.removeAttr('aria-controls');
        }
    }

    $(document).ready(function () {
        body = $(document.body);

        $(window).on('load', onResizeARIA).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {}, 300);
            onResizeARIA();
        });
    });
})(jQuery);
'use strict';

/**
 * File search.js
 *
 * Deal with the search form.
 */
window.wdsSearch = {};

(function (window, $, app) {
	// Constructor.
	app.init = function () {
		app.cache();

		if (app.meetsRequirements()) {
			app.bindEvents();
		}
	};

	// Cache all the things.
	app.cache = function () {
		app.$c = {
			'body': $('body')
		};
	};

	// Do we meet the requirements?
	app.meetsRequirements = function () {
		return $('.search-field').length;
	};

	// Combine all events.
	app.bindEvents = function () {
		// Remove placeholder text from search field on focus.
		app.$c.body.on('focus', '.search-field', app.removePlaceholderText);

		// Add placeholder text back to search field on blur.
		app.$c.body.on('blur', '.search-field', app.addPlaceholderText);
	};

	// Remove placeholder text from search field.
	app.removePlaceholderText = function () {
		var $search_field = $(this);

		$search_field.data('placeholder', $search_field.attr('placeholder')).attr('placeholder', '');
	};

	// Replace placeholder text from search field.
	app.addPlaceholderText = function () {
		var $search_field = $(this);

		$search_field.attr('placeholder', $search_field.data('placeholder')).data('placeholder', '');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsSearch);
'use strict';

/**
 * File skip-link-focus-fix.js.
 *
 * Helps with accessibility for keyboard only users.
 *
 * Learn more: https://git.io/vWdr2
 */
(function () {
	var isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
	    isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
	    isIe = navigator.userAgent.toLowerCase().indexOf('msie') > -1;

	if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) {
		window.addEventListener('hashchange', function () {
			var id = location.hash.substring(1),
			    element;

			if (!/^[A-z0-9_-]+$/.test(id)) {
				return;
			}

			element = document.getElementById(id);

			if (element) {
				if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
					element.tabIndex = -1;
				}

				element.focus();
			}
		}, false);
	}
})();
'use strict';

/**
 * File window-ready.js
 *
 * Add a "ready" class to <body> when window is ready.
 */
window.wdsWindowReady = {};
(function (window, $, app) {
	// Constructor.
	app.init = function () {
		app.cache();
		app.bindEvents();
	};

	// Cache document elements.
	app.cache = function () {
		app.$c = {
			'window': $(window),
			'body': $(document.body)
		};
	};

	// Combine all events.
	app.bindEvents = function () {
		app.$c.window.load(app.addBodyClass);
	};

	// Add a class to <body>.
	app.addBodyClass = function () {
		app.$c.body.addClass('ready');
	};

	// Engage!
	$(app.init);
})(window, jQuery, window.wdsWindowReady);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzLWVuYWJsZWQuanMiLCJtb2RhbC5qcyIsInNjcmlwdHMuanMiLCJzZWFyY2guanMiLCJza2lwLWxpbmstZm9jdXMtZml4LmpzIiwid2luZG93LXJlYWR5LmpzIl0sIm5hbWVzIjpbImRvY3VtZW50IiwiYm9keSIsImNsYXNzTmFtZSIsInJlcGxhY2UiLCJ3aW5kb3ciLCJ3ZHNNb2RhbCIsIiQiLCJhcHAiLCJpbml0IiwiY2FjaGUiLCJtZWV0c1JlcXVpcmVtZW50cyIsImJpbmRFdmVudHMiLCIkYyIsImxlbmd0aCIsIm9uIiwib3Blbk1vZGFsIiwiY2xvc2VNb2RhbCIsImVzY0tleUNsb3NlIiwiY2xvc2VNb2RhbEJ5Q2xpY2siLCIkbW9kYWwiLCJkYXRhIiwiYWRkQ2xhc3MiLCIkaWZyYW1lIiwiZmluZCIsInVybCIsImF0dHIiLCJyZW1vdmVDbGFzcyIsImV2ZW50Iiwia2V5Q29kZSIsInRhcmdldCIsInBhcmVudHMiLCJoYXNDbGFzcyIsImpRdWVyeSIsIm1hc3RoZWFkIiwibWVudVRvZ2dsZSIsInNpdGVOYXZpZ2F0aW9uIiwic29jaWFsTmF2aWdhdGlvbiIsInNpdGVIZWFkZXJNZW51IiwicmVzaXplVGltZXIiLCJpbml0TWFpbk5hdmlnYXRpb24iLCJjb250YWluZXIiLCJkcm9wZG93blRvZ2dsZSIsImFwcGVuZCIsInRleHQiLCJzY3JlZW5SZWFkZXJUZXh0IiwiZXhwYW5kIiwiYWZ0ZXIiLCJjbGljayIsImUiLCJfdGhpcyIsInNjcmVlblJlYWRlclNwYW4iLCJwcmV2ZW50RGVmYXVsdCIsInRvZ2dsZUNsYXNzIiwibmV4dCIsImNvbGxhcHNlIiwiYWRkIiwiY2hpbGRyZW4iLCJ0b2dnbGVGb2N1c0NsYXNzVG91Y2hTY3JlZW4iLCJpbm5lcldpZHRoIiwiY2xvc2VzdCIsImVsIiwicGFyZW50Iiwic2libGluZ3MiLCJ1bmJpbmQiLCJvblJlc2l6ZUFSSUEiLCJyZW1vdmVBdHRyIiwicmVhZHkiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwid2RzU2VhcmNoIiwicmVtb3ZlUGxhY2Vob2xkZXJUZXh0IiwiYWRkUGxhY2Vob2xkZXJUZXh0IiwiJHNlYXJjaF9maWVsZCIsImlzV2Via2l0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwiaXNPcGVyYSIsImlzSWUiLCJnZXRFbGVtZW50QnlJZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpZCIsImxvY2F0aW9uIiwiaGFzaCIsInN1YnN0cmluZyIsImVsZW1lbnQiLCJ0ZXN0IiwidGFnTmFtZSIsInRhYkluZGV4IiwiZm9jdXMiLCJ3ZHNXaW5kb3dSZWFkeSIsImxvYWQiLCJhZGRCb2R5Q2xhc3MiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7O0FBS0FBLFNBQVNDLElBQVQsQ0FBY0MsU0FBZCxHQUEwQkYsU0FBU0MsSUFBVCxDQUFjQyxTQUFkLENBQXdCQyxPQUF4QixDQUFpQyxPQUFqQyxFQUEwQyxJQUExQyxDQUExQjs7O0FDTEE7Ozs7O0FBS0FDLE9BQU9DLFFBQVAsR0FBa0IsRUFBbEI7O0FBRUEsQ0FBRSxVQUFXRCxNQUFYLEVBQW1CRSxDQUFuQixFQUFzQkMsR0FBdEIsRUFBNEI7QUFDN0I7QUFDQUEsS0FBSUMsSUFBSixHQUFXLFlBQVk7QUFDdEJELE1BQUlFLEtBQUo7O0FBRUEsTUFBS0YsSUFBSUcsaUJBQUosRUFBTCxFQUErQjtBQUM5QkgsT0FBSUksVUFBSjtBQUNBO0FBQ0QsRUFORDs7QUFRQTtBQUNBSixLQUFJRSxLQUFKLEdBQVksWUFBWTtBQUN2QkYsTUFBSUssRUFBSixHQUFTO0FBQ1IsV0FBUU4sRUFBRyxNQUFIO0FBREEsR0FBVDtBQUdBLEVBSkQ7O0FBTUE7QUFDQUMsS0FBSUcsaUJBQUosR0FBd0IsWUFBWTtBQUNuQyxTQUFPSixFQUFHLGdCQUFILEVBQXNCTyxNQUE3QjtBQUNBLEVBRkQ7O0FBSUE7QUFDQU4sS0FBSUksVUFBSixHQUFpQixZQUFZO0FBQzVCO0FBQ0FKLE1BQUlLLEVBQUosQ0FBT1gsSUFBUCxDQUFZYSxFQUFa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S0FBSjtBQUNBRixNQUFJSSxVQUFKO0FBQ0EsRUFIRDs7QUFLQTtBQUNBSixLQUFJRSxLQUFKLEdBQVksWUFBWTtBQUN2QkYsTUFBSUssRUFBSixHQUFTO0FBQ1IsYUFBVU4sRUFBR0YsTUFBSCxDQURGO0FBRVIsV0FBUUUsRUFBR04sU0FBU0MsSUFBWjtBQUZBLEdBQVQ7QUFJQSxFQUxEOztBQU9BO0FBQ0FNLEtBQUlJLFVBQUosR0FBaUIsWUFBWTtBQUM1QkosTUFBSUssRUFBSixDQUFPUixNQUFQLENBQWN3RixJQUFkLENBQW9CckYsSUFBSXNGLFlBQXhCO0FBQ0EsRUFGRDs7QUFJQTtBQUNBdEYsS0FBSXNGLFlBQUosR0FBbUIsWUFBWTtBQUM5QnRGLE1BQUlLLEVBQUosQ0FBT1gsSUFBUCxDQUFZb0IsUUFBWixDQUFzQixPQUF0QjtBQUNBLEVBRkQ7O0FBSUE7QUFDQWYsR0FBR0MsSUFBSUMsSUFBUDtBQUNBLENBM0JELEVBMkJLSixNQTNCTCxFQTJCYTRCLE1BM0JiLEVBMkJxQjVCLE9BQU91RixjQTNCNUIiLCJmaWxlIjoicHJvamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRmlsZSBqcy1lbmFibGVkLmpzXG4gKlxuICogSWYgSmF2YXNjcmlwdCBpcyBlbmFibGVkLCByZXBsYWNlIHRoZSA8Ym9keT4gY2xhc3MgXCJuby1qc1wiLlxuICovXG5kb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoICduby1qcycsICdqcycgKTtcbiIsIi8qKlxuICogRmlsZSBtb2RhbC5qc1xuICpcbiAqIERlYWwgd2l0aCBtdWx0aXBsZSBtb2RhbHMgYW5kIHRoZWlyIG1lZGlhLlxuICovXG53aW5kb3cud2RzTW9kYWwgPSB7fTtcblxuKCBmdW5jdGlvbiAoIHdpbmRvdywgJCwgYXBwICkge1xuXHQvLyBDb25zdHJ1Y3Rvci5cblx0YXBwLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLmNhY2hlKCk7XG5cblx0XHRpZiAoIGFwcC5tZWV0c1JlcXVpcmVtZW50cygpICkge1xuXHRcdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FjaGUgYWxsIHRoZSB0aGluZ3MuXG5cdGFwcC5jYWNoZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuJGMgPSB7XG5cdFx0XHQnYm9keSc6ICQoICdib2R5JyApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBEbyB3ZSBtZWV0IHRoZSByZXF1aXJlbWVudHM/XG5cdGFwcC5tZWV0c1JlcXVpcmVtZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gJCggJy5tb2RhbC10cmlnZ2VyJyApLmxlbmd0aDtcblx0fTtcblxuXHQvLyBDb21iaW5lIGFsbCBldmVudHMuXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuXHRcdC8vIFRyaWdnZXIgYSBtb2RhbCB0byBvcGVuLlxuXHRcdGFwcC4kYy5ib2R5Lm9uKCAnY2xpY2sgdG91Y2hzdGFydCcsICcubW9kYWwtdHJpZ2dlcicsIGFwcC5vcGVuTW9kYWwgKTtcblxuXHRcdC8vIFRyaWdnZXIgdGhlIGNsb3NlIGJ1dHRvbiB0byBjbG9zZSB0aGUgbW9kYWwuXG5cdFx0YXBwLiRjLmJvZHkub24oICdjbGljayB0b3VjaHN0YXJ0JywgJy5jbG9zZScsIGFwcC5jbG9zZU1vZGFsICk7XG5cblx0XHQvLyBBbGxvdyB0aGUgdXNlciB0byBjbG9zZSB0aGUgbW9kYWwgYnkgaGl0dGluZyB0aGUgZXNjIGtleS5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2tleWRvd24nLCBhcHAuZXNjS2V5Q2xvc2UgKTtcblxuXHRcdC8vIEFsbG93IHRoZSB1c2VyIHRvIGNsb3NlIHRoZSBtb2RhbCBieSBjbGlja2luZyBvdXRzaWRlIG9mIHRoZSBtb2RhbC5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2NsaWNrIHRvdWNoc3RhcnQnLCAnZGl2Lm1vZGFsLW9wZW4nLCBhcHAuY2xvc2VNb2RhbEJ5Q2xpY2sgKTtcblx0fTtcblxuXHQvLyBPcGVuIHRoZSBtb2RhbC5cblx0YXBwLm9wZW5Nb2RhbCA9IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBGaWd1cmUgb3V0IHdoaWNoIG1vZGFsIHdlJ3JlIG9wZW5pbmcgYW5kIHN0b3JlIHRoZSBvYmplY3QuXG5cdFx0dmFyICRtb2RhbCA9ICQoICQoIHRoaXMgKS5kYXRhKCAndGFyZ2V0JyApICk7XG5cblx0XHQvLyBEaXNwbGF5IHRoZSBtb2RhbC5cblx0XHQkbW9kYWwuYWRkQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gQWRkIGJvZHkgY2xhc3MuXG5cdFx0YXBwLiRjLmJvZHkuYWRkQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXHR9O1xuXG5cdC8vIENsb3NlIHRoZSBtb2RhbC5cblx0YXBwLmNsb3NlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gRmlndXJlIHRoZSBvcGVuZWQgbW9kYWwgd2UncmUgY2xvc2luZyBhbmQgc3RvcmUgdGhlIG9iamVjdC5cblx0XHR2YXIgJG1vZGFsID0gJCggJCggJ2Rpdi5tb2RhbC1vcGVuIC5jbG9zZScgKS5kYXRhKCAndGFyZ2V0JyApICk7XG5cblx0XHQvLyBGaW5kIHRoZSBpZnJhbWUgaW4gdGhlICRtb2RhbCBvYmplY3QuXG5cdFx0dmFyICRpZnJhbWUgPSAkbW9kYWwuZmluZCggJ2lmcmFtZScgKTtcblxuXHRcdC8vIEdldCB0aGUgaWZyYW1lIHNyYyBVUkwuXG5cdFx0dmFyIHVybCA9ICRpZnJhbWUuYXR0ciggJ3NyYycgKTtcblxuXHRcdC8vIFJlbW92ZSB0aGUgc291cmNlIFVSTCwgdGhlbiBhZGQgaXQgYmFjaywgc28gdGhlIHZpZGVvIGNhbiBiZSBwbGF5ZWQgYWdhaW4gbGF0ZXIuXG5cdFx0JGlmcmFtZS5hdHRyKCAnc3JjJywgJycgKS5hdHRyKCAnc3JjJywgdXJsICk7XG5cblx0XHQvLyBGaW5hbGx5LCBoaWRlIHRoZSBtb2RhbC5cblx0XHQkbW9kYWwucmVtb3ZlQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBib2R5IGNsYXNzLlxuXHRcdGFwcC4kYy5ib2R5LnJlbW92ZUNsYXNzKCAnbW9kYWwtb3BlbicgKTtcblx0fTtcblxuXHQvLyBDbG9zZSBpZiBcImVzY1wiIGtleSBpcyBwcmVzc2VkLlxuXHRhcHAuZXNjS2V5Q2xvc2UgPSBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdGlmICggMjcgPT09IGV2ZW50LmtleUNvZGUgKSB7XG5cdFx0XHRhcHAuY2xvc2VNb2RhbCgpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBDbG9zZSBpZiB0aGUgdXNlciBjbGlja3Mgb3V0c2lkZSBvZiB0aGUgbW9kYWxcblx0YXBwLmNsb3NlTW9kYWxCeUNsaWNrID0gZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHQvLyBJZiB0aGUgcGFyZW50IGNvbnRhaW5lciBpcyBOT1QgdGhlIG1vZGFsIGRpYWxvZyBjb250YWluZXIsIGNsb3NlIHRoZSBtb2RhbFxuXHRcdGlmICggISQoIGV2ZW50LnRhcmdldCApLnBhcmVudHMoICdkaXYnICkuaGFzQ2xhc3MoICdtb2RhbC1kaWFsb2cnICkgKSB7XG5cdFx0XHRhcHAuY2xvc2VNb2RhbCgpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBFbmdhZ2UhXG5cdCQoIGFwcC5pbml0ICk7XG59ICkoIHdpbmRvdywgalF1ZXJ5LCB3aW5kb3cud2RzTW9kYWwgKTtcbiIsIi8qIGdsb2JhbCBzY3JlZW5SZWFkZXJUZXh0ICovXG4vKipcbiAqIFRoZW1lIGZ1bmN0aW9ucyBmaWxlLlxuICpcbiAqIENvbnRhaW5zIGhhbmRsZXJzIGZvciBuYXZpZ2F0aW9uIGFuZCB3aWRnZXQgYXJlYS5cbiAqL1xuXG4oIGZ1bmN0aW9uKCAkICkge1xuICAgIHZhciBib2R5LCBtYXN0aGVhZCwgbWVudVRvZ2dsZSwgc2l0ZU5hdmlnYXRpb24sIHNvY2lhbE5hdmlnYXRpb24sIHNpdGVIZWFkZXJNZW51LCByZXNpemVUaW1lcjtcblxuICAgIGZ1bmN0aW9uIGluaXRNYWluTmF2aWdhdGlvbiggY29udGFpbmVyICkge1xuXG4gICAgICAgIC8vIEFkZCBkcm9wZG93biB0b2dnbGUgdGhhdCBkaXNwbGF5cyBjaGlsZCBtZW51IGl0ZW1zLlxuICAgICAgICB2YXIgZHJvcGRvd25Ub2dnbGUgPSAkKCAnPGJ1dHRvbiAvPicsIHtcbiAgICAgICAgICAgICdjbGFzcyc6ICdkcm9wZG93bi10b2dnbGUnLFxuICAgICAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZVxuICAgICAgICB9ICkuYXBwZW5kKCAkKCAnPHNwYW4gLz4nLCB7XG4gICAgICAgICAgICAnY2xhc3MnOiAnc2NyZWVuLXJlYWRlci10ZXh0JyxcbiAgICAgICAgICAgIHRleHQ6IHNjcmVlblJlYWRlclRleHQuZXhwYW5kXG4gICAgICAgIH0gKSApO1xuXG4gICAgICAgIGNvbnRhaW5lci5maW5kKCAnLm1lbnUtaXRlbS1oYXMtY2hpbGRyZW4gPiBhJyApLmFmdGVyKCBkcm9wZG93blRvZ2dsZSApO1xuXG4gICAgICAgIC8vIFRvZ2dsZSBidXR0b25zIGFuZCBzdWJtZW51IGl0ZW1zIHdpdGggYWN0aXZlIGNoaWxkcmVuIG1lbnUgaXRlbXMuXG4gICAgICAgIGNvbnRhaW5lci5maW5kKCAnLmN1cnJlbnQtbWVudS1hbmNlc3RvciA+IGJ1dHRvbicgKS5hZGRDbGFzcyggJ3RvZ2dsZWQtb24nICk7XG4gICAgICAgIGNvbnRhaW5lci5maW5kKCAnLmN1cnJlbnQtbWVudS1hbmNlc3RvciA+IC5zdWItbWVudScgKS5hZGRDbGFzcyggJ3RvZ2dsZWQtb24nICk7XG5cbiAgICAgICAgLy8gQWRkIG1lbnUgaXRlbXMgd2l0aCBzdWJtZW51cyB0byBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiLlxuICAgICAgICBjb250YWluZXIuZmluZCggJy5tZW51LWl0ZW0taGFzLWNoaWxkcmVuJyApLmF0dHIoICdhcmlhLWhhc3BvcHVwJywgJ3RydWUnICk7XG5cbiAgICAgICAgY29udGFpbmVyLmZpbmQoICcuZHJvcGRvd24tdG9nZ2xlJyApLmNsaWNrKCBmdW5jdGlvbiggZSApIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyAgICAgICAgICAgID0gJCggdGhpcyApLFxuICAgICAgICAgICAgICAgIHNjcmVlblJlYWRlclNwYW4gPSBfdGhpcy5maW5kKCAnLnNjcmVlbi1yZWFkZXItdGV4dCcgKTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMudG9nZ2xlQ2xhc3MoICd0b2dnbGVkLW9uJyApO1xuICAgICAgICAgICAgX3RoaXMubmV4dCggJy5jaGlsZHJlbiwgLnN1Yi1tZW51JyApLnRvZ2dsZUNsYXNzKCAndG9nZ2xlZC1vbicgKTtcblxuICAgICAgICAgICAgLy8ganNjczpkaXNhYmxlXG4gICAgICAgICAgICBfdGhpcy5hdHRyKCAnYXJpYS1leHBhbmRlZCcsIF90aGlzLmF0dHIoICdhcmlhLWV4cGFuZGVkJyApID09PSAnZmFsc2UnID8gJ3RydWUnIDogJ2ZhbHNlJyApO1xuICAgICAgICAgICAgLy8ganNjczplbmFibGVcbiAgICAgICAgICAgIHNjcmVlblJlYWRlclNwYW4udGV4dCggc2NyZWVuUmVhZGVyU3Bhbi50ZXh0KCkgPT09IHNjcmVlblJlYWRlclRleHQuZXhwYW5kID8gc2NyZWVuUmVhZGVyVGV4dC5jb2xsYXBzZSA6IHNjcmVlblJlYWRlclRleHQuZXhwYW5kICk7XG4gICAgICAgIH0gKTtcbiAgICB9XG4gICAgaW5pdE1haW5OYXZpZ2F0aW9uKCAkKCAnLm1haW4tbmF2aWdhdGlvbicgKSApO1xuXG4gICAgbWFzdGhlYWQgICAgICAgICA9ICQoICcjbWFzdGhlYWQnICk7XG4gICAgbWVudVRvZ2dsZSAgICAgICA9IG1hc3RoZWFkLmZpbmQoICcjbWVudS10b2dnbGUnICk7XG4gICAgc2l0ZUhlYWRlck1lbnUgICA9IG1hc3RoZWFkLmZpbmQoICcjc2l0ZS1oZWFkZXItbWVudScgKTtcbiAgICBzaXRlTmF2aWdhdGlvbiAgID0gbWFzdGhlYWQuZmluZCggJyNzaXRlLW5hdmlnYXRpb24nICk7XG4gICAgc29jaWFsTmF2aWdhdGlvbiA9IG1hc3RoZWFkLmZpbmQoICcjc29jaWFsLW5hdmlnYXRpb24nICk7XG5cbiAgICAvLyBFbmFibGUgbWVudVRvZ2dsZS5cbiAgICAoIGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIFJldHVybiBlYXJseSBpZiBtZW51VG9nZ2xlIGlzIG1pc3NpbmcuXG4gICAgICAgIGlmICggISBtZW51VG9nZ2xlLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCBhbiBpbml0aWFsIHZhbHVlcyBmb3IgdGhlIGF0dHJpYnV0ZS5cbiAgICAgICAgbWVudVRvZ2dsZS5hZGQoIHNpdGVOYXZpZ2F0aW9uICkuYWRkKCBzb2NpYWxOYXZpZ2F0aW9uICkuYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnICk7XG5cbiAgICAgICAgbWVudVRvZ2dsZS5vbiggJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkKCB0aGlzICkuYWRkKCBzaXRlSGVhZGVyTWVudSApLnRvZ2dsZUNsYXNzKCAndG9nZ2xlZC1vbicgKTtcblxuICAgICAgICAgICAgLy8ganNjczpkaXNhYmxlXG4gICAgICAgICAgICAkKCB0aGlzICkuYWRkKCBzaXRlTmF2aWdhdGlvbiApLmFkZCggc29jaWFsTmF2aWdhdGlvbiApLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgJCggdGhpcyApLmFkZCggc2l0ZU5hdmlnYXRpb24gKS5hZGQoIHNvY2lhbE5hdmlnYXRpb24gKS5hdHRyKCAnYXJpYS1leHBhbmRlZCcgKSA9PT0gJ2ZhbHNlJyA/ICd0cnVlJyA6ICdmYWxzZScgKTtcbiAgICAgICAgICAgIC8vIGpzY3M6ZW5hYmxlXG4gICAgICAgIH0gKTtcbiAgICB9ICkoKTtcblxuICAgIC8vIEZpeCBzdWItbWVudXMgZm9yIHRvdWNoIGRldmljZXMgYW5kIGJldHRlciBmb2N1cyBmb3IgaGlkZGVuIHN1Ym1lbnUgaXRlbXMgZm9yIGFjY2Vzc2liaWxpdHkuXG4gICAgKCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCAhIHNpdGVOYXZpZ2F0aW9uLmxlbmd0aCB8fCAhIHNpdGVOYXZpZ2F0aW9uLmNoaWxkcmVuKCkubGVuZ3RoICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVG9nZ2xlIGBmb2N1c2AgY2xhc3MgdG8gYWxsb3cgc3VibWVudSBhY2Nlc3Mgb24gdGFibGV0cy5cbiAgICAgICAgZnVuY3Rpb24gdG9nZ2xlRm9jdXNDbGFzc1RvdWNoU2NyZWVuKCkge1xuICAgICAgICAgICAgaWYgKCB3aW5kb3cuaW5uZXJXaWR0aCA+PSA5MTAgKSB7XG4gICAgICAgICAgICAgICAgJCggZG9jdW1lbnQuYm9keSApLm9uKCAndG91Y2hzdGFydCcsIGZ1bmN0aW9uKCBlICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoICEgJCggZS50YXJnZXQgKS5jbG9zZXN0KCAnLm1haW4tbmF2aWdhdGlvbiBsaScgKS5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCAnLm1haW4tbmF2aWdhdGlvbiBsaScgKS5yZW1vdmVDbGFzcyggJ2ZvY3VzJyApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIHNpdGVOYXZpZ2F0aW9uLmZpbmQoICcubWVudS1pdGVtLWhhcy1jaGlsZHJlbiA+IGEnICkub24oICd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oIGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbCA9ICQoIHRoaXMgKS5wYXJlbnQoICdsaScgKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoICEgZWwuaGFzQ2xhc3MoICdmb2N1cycgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLnRvZ2dsZUNsYXNzKCAnZm9jdXMnICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5zaWJsaW5ncyggJy5mb2N1cycgKS5yZW1vdmVDbGFzcyggJ2ZvY3VzJyApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaXRlTmF2aWdhdGlvbi5maW5kKCAnLm1lbnUtaXRlbS1oYXMtY2hpbGRyZW4gPiBhJyApLnVuYmluZCggJ3RvdWNoc3RhcnQnICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoICdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyApIHtcbiAgICAgICAgICAgICQoIHdpbmRvdyApLm9uKCAncmVzaXplJywgdG9nZ2xlRm9jdXNDbGFzc1RvdWNoU2NyZWVuICk7XG4gICAgICAgICAgICB0b2dnbGVGb2N1c0NsYXNzVG91Y2hTY3JlZW4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNpdGVOYXZpZ2F0aW9uLmZpbmQoICdhJyApLm9uKCAnZm9jdXMgYmx1cicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCggdGhpcyApLnBhcmVudHMoICcubWVudS1pdGVtJyApLnRvZ2dsZUNsYXNzKCAnZm9jdXMnICk7XG4gICAgICAgIH0gKTtcbiAgICB9ICkoKTtcblxuICAgIC8vIEFkZCB0aGUgZGVmYXVsdCBBUklBIGF0dHJpYnV0ZXMgZm9yIHRoZSBtZW51IHRvZ2dsZSBhbmQgdGhlIG5hdmlnYXRpb25zLlxuICAgIGZ1bmN0aW9uIG9uUmVzaXplQVJJQSgpIHtcbiAgICAgICAgaWYgKCB3aW5kb3cuaW5uZXJXaWR0aCA8IDkxMCApIHtcbiAgICAgICAgICAgIGlmICggbWVudVRvZ2dsZS5oYXNDbGFzcyggJ3RvZ2dsZWQtb24nICkgKSB7XG4gICAgICAgICAgICAgICAgbWVudVRvZ2dsZS5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICd0cnVlJyApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtZW51VG9nZ2xlLmF0dHIoICdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIHNpdGVIZWFkZXJNZW51Lmhhc0NsYXNzKCAndG9nZ2xlZC1vbicgKSApIHtcbiAgICAgICAgICAgICAgICBzaXRlTmF2aWdhdGlvbi5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICd0cnVlJyApO1xuICAgICAgICAgICAgICAgIHNvY2lhbE5hdmlnYXRpb24uYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2l0ZU5hdmlnYXRpb24uYXR0ciggJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnICk7XG4gICAgICAgICAgICAgICAgc29jaWFsTmF2aWdhdGlvbi5hdHRyKCAnYXJpYS1leHBhbmRlZCcsICdmYWxzZScgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWVudVRvZ2dsZS5hdHRyKCAnYXJpYS1jb250cm9scycsICdzaXRlLW5hdmlnYXRpb24gc29jaWFsLW5hdmlnYXRpb24nICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW51VG9nZ2xlLnJlbW92ZUF0dHIoICdhcmlhLWV4cGFuZGVkJyApO1xuICAgICAgICAgICAgc2l0ZU5hdmlnYXRpb24ucmVtb3ZlQXR0ciggJ2FyaWEtZXhwYW5kZWQnICk7XG4gICAgICAgICAgICBzb2NpYWxOYXZpZ2F0aW9uLnJlbW92ZUF0dHIoICdhcmlhLWV4cGFuZGVkJyApO1xuICAgICAgICAgICAgbWVudVRvZ2dsZS5yZW1vdmVBdHRyKCAnYXJpYS1jb250cm9scycgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICQoIGRvY3VtZW50ICkucmVhZHkoIGZ1bmN0aW9uKCkge1xuICAgICAgICBib2R5ID0gJCggZG9jdW1lbnQuYm9keSApO1xuXG4gICAgICAgICQoIHdpbmRvdyApXG4gICAgICAgICAgICAub24oICdsb2FkJywgb25SZXNpemVBUklBIClcbiAgICAgICAgICAgIC5vbiggJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCggcmVzaXplVGltZXIgKTtcbiAgICAgICAgICAgICAgICByZXNpemVUaW1lciA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB9LCAzMDAgKTtcbiAgICAgICAgICAgICAgICBvblJlc2l6ZUFSSUEoKTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgIH0gKTtcblxufSApKCBqUXVlcnkgKTsiLCIvKipcbiAqIEZpbGUgc2VhcmNoLmpzXG4gKlxuICogRGVhbCB3aXRoIHRoZSBzZWFyY2ggZm9ybS5cbiAqL1xud2luZG93Lndkc1NlYXJjaCA9IHt9O1xuXG4oIGZ1bmN0aW9uICggd2luZG93LCAkLCBhcHAgKSB7XG5cdC8vIENvbnN0cnVjdG9yLlxuXHRhcHAuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuY2FjaGUoKTtcblxuXHRcdGlmICggYXBwLm1lZXRzUmVxdWlyZW1lbnRzKCkgKSB7XG5cdFx0XHRhcHAuYmluZEV2ZW50cygpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBDYWNoZSBhbGwgdGhlIHRoaW5ncy5cblx0YXBwLmNhY2hlID0gZnVuY3Rpb24gKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdCdib2R5JzogJCggJ2JvZHknIClcblx0XHR9O1xuXHR9O1xuXG5cdC8vIERvIHdlIG1lZXQgdGhlIHJlcXVpcmVtZW50cz9cblx0YXBwLm1lZXRzUmVxdWlyZW1lbnRzID0gZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiAkKCAnLnNlYXJjaC1maWVsZCcgKS5sZW5ndGg7XG5cdH07XG5cblx0Ly8gQ29tYmluZSBhbGwgZXZlbnRzLlxuXHRhcHAuYmluZEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBSZW1vdmUgcGxhY2Vob2xkZXIgdGV4dCBmcm9tIHNlYXJjaCBmaWVsZCBvbiBmb2N1cy5cblx0XHRhcHAuJGMuYm9keS5vbiggJ2ZvY3VzJywgJy5zZWFyY2gtZmllbGQnLCBhcHAucmVtb3ZlUGxhY2Vob2xkZXJUZXh0ICk7XG5cblx0XHQvLyBBZGQgcGxhY2Vob2xkZXIgdGV4dCBiYWNrIHRvIHNlYXJjaCBmaWVsZCBvbiBibHVyLlxuXHRcdGFwcC4kYy5ib2R5Lm9uKCAnYmx1cicsICcuc2VhcmNoLWZpZWxkJywgYXBwLmFkZFBsYWNlaG9sZGVyVGV4dCApO1xuXHR9O1xuXG5cdC8vIFJlbW92ZSBwbGFjZWhvbGRlciB0ZXh0IGZyb20gc2VhcmNoIGZpZWxkLlxuXHRhcHAucmVtb3ZlUGxhY2Vob2xkZXJUZXh0ID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciAkc2VhcmNoX2ZpZWxkID0gJCggdGhpcyApO1xuXG5cdFx0JHNlYXJjaF9maWVsZC5kYXRhKCAncGxhY2Vob2xkZXInLCAkc2VhcmNoX2ZpZWxkLmF0dHIoICdwbGFjZWhvbGRlcicgKSApLmF0dHIoICdwbGFjZWhvbGRlcicsICcnICk7XG5cdH07XG5cblx0Ly8gUmVwbGFjZSBwbGFjZWhvbGRlciB0ZXh0IGZyb20gc2VhcmNoIGZpZWxkLlxuXHRhcHAuYWRkUGxhY2Vob2xkZXJUZXh0ID0gZnVuY3Rpb24gKCkge1xuXHRcdHZhciAkc2VhcmNoX2ZpZWxkID0gJCggdGhpcyApO1xuXG5cdFx0JHNlYXJjaF9maWVsZC5hdHRyKCAncGxhY2Vob2xkZXInLCAkc2VhcmNoX2ZpZWxkLmRhdGEoICdwbGFjZWhvbGRlcicgKSApLmRhdGEoICdwbGFjZWhvbGRlcicsICcnICk7XG5cdH07XG5cblx0Ly8gRW5nYWdlIVxuXHQkKCBhcHAuaW5pdCApO1xufSApKCB3aW5kb3csIGpRdWVyeSwgd2luZG93Lndkc1NlYXJjaCApO1xuIiwiLyoqXG4gKiBGaWxlIHNraXAtbGluay1mb2N1cy1maXguanMuXG4gKlxuICogSGVscHMgd2l0aCBhY2Nlc3NpYmlsaXR5IGZvciBrZXlib2FyZCBvbmx5IHVzZXJzLlxuICpcbiAqIExlYXJuIG1vcmU6IGh0dHBzOi8vZ2l0LmlvL3ZXZHIyXG4gKi9cbiggZnVuY3Rpb24gKCkge1xuXHR2YXIgaXNXZWJraXQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ3dlYmtpdCcgKSA+IC0xLFxuXHRcdGlzT3BlcmEgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggJ29wZXJhJyApID4gLTEsXG5cdFx0aXNJZSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnbXNpZScgKSA+IC0xO1xuXG5cdGlmICggKCBpc1dlYmtpdCB8fCBpc09wZXJhIHx8IGlzSWUgKSAmJiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciApIHtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgaWQgPSBsb2NhdGlvbi5oYXNoLnN1YnN0cmluZyggMSApLFxuXHRcdFx0XHRlbGVtZW50O1xuXG5cdFx0XHRpZiAoICEoIC9eW0EtejAtOV8tXSskLyApLnRlc3QoIGlkICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBpZCApO1xuXG5cdFx0XHRpZiAoIGVsZW1lbnQgKSB7XG5cdFx0XHRcdGlmICggISggL14oPzphfHNlbGVjdHxpbnB1dHxidXR0b258dGV4dGFyZWEpJC9pICkudGVzdCggZWxlbWVudC50YWdOYW1lICkgKSB7XG5cdFx0XHRcdFx0ZWxlbWVudC50YWJJbmRleCA9IC0xO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZWxlbWVudC5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH0sIGZhbHNlICk7XG5cdH1cbn0gKSgpO1xuIiwiLyoqXG4gKiBGaWxlIHdpbmRvdy1yZWFkeS5qc1xuICpcbiAqIEFkZCBhIFwicmVhZHlcIiBjbGFzcyB0byA8Ym9keT4gd2hlbiB3aW5kb3cgaXMgcmVhZHkuXG4gKi9cbndpbmRvdy53ZHNXaW5kb3dSZWFkeSA9IHt9O1xuKCBmdW5jdGlvbiAoIHdpbmRvdywgJCwgYXBwICkge1xuXHQvLyBDb25zdHJ1Y3Rvci5cblx0YXBwLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLmNhY2hlKCk7XG5cdFx0YXBwLmJpbmRFdmVudHMoKTtcblx0fTtcblxuXHQvLyBDYWNoZSBkb2N1bWVudCBlbGVtZW50cy5cblx0YXBwLmNhY2hlID0gZnVuY3Rpb24gKCkge1xuXHRcdGFwcC4kYyA9IHtcblx0XHRcdCd3aW5kb3cnOiAkKCB3aW5kb3cgKSxcblx0XHRcdCdib2R5JzogJCggZG9jdW1lbnQuYm9keSApXG5cdFx0fTtcblx0fTtcblxuXHQvLyBDb21iaW5lIGFsbCBldmVudHMuXG5cdGFwcC5iaW5kRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuXHRcdGFwcC4kYy53aW5kb3cubG9hZCggYXBwLmFkZEJvZHlDbGFzcyApO1xuXHR9O1xuXG5cdC8vIEFkZCBhIGNsYXNzIHRvIDxib2R5Pi5cblx0YXBwLmFkZEJvZHlDbGFzcyA9IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuJGMuYm9keS5hZGRDbGFzcyggJ3JlYWR5JyApO1xuXHR9O1xuXG5cdC8vIEVuZ2FnZSFcblx0JCggYXBwLmluaXQgKTtcbn0gKSggd2luZG93LCBqUXVlcnksIHdpbmRvdy53ZHNXaW5kb3dSZWFkeSApO1xuIl19
