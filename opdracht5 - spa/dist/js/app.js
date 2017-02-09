/*jshint esversion: 6 */
'use strict';

(function () {
    var config = {
        startRoute: '#start',
        routes: ['#start', '#frontendBestPractices']
    };

    var app = {
        init: function init() {
            routes.init();
        }
    };

    var routes = {
        init: function init() {
            var hashLocation = document.location.hash;
            sections.setActive(hashLocation ? hashLocation : config.startRoute);

            this.handleHashChange();
        },
        handleHashChange: function handleHashChange() {
            window.addEventListener('hashchange', function (e) {
                var hashLocation = document.location.hash;

                if (config.routes.includes(hashLocation)) {
                    sections.setActive(hashLocation);
                }
            });
        }
    };

    var sections = {
        setActive: function setActive(route) {
            var sections = Array.from(document.getElementsByTagName('section'));
            sections.forEach(function (section) {
                if ('#' + section.getAttribute('id') === route) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        }
    };

    app.init();
})();