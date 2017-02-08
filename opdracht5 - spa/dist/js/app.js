'use strict';
/*jshint esversion: 6 */

(function () {

    var app = {
        init: function init() {
            routes.init();
        }
    };

    var routes = {
        init: function init() {
            this.bindEvents();
        },
        bindEvents: function bindEvents() {
            window.addEventListener('hashchange', function () {
                sections.toggle(document.location.hash);
            });
        }
    };

    var sections = {
        toggle: function toggle(route) {
            var sections = Array.from(document.getElementsByTagName('section'));

            sections.forEach(function (section) {
                section.classList.add('hidden');
            });
            document.querySelector(route).classList.remove('hidden');
        }
    };

    app.init();
})();