/*jshint esversion: 6 */
'use strict';
(function() {

    const app = {
        init: () => {
            routes.init();
            document.getElementById('frontendBestPractices').classList.add('hidden');
        }
    };

    const routes = {
        init: function() {
            this.bindEvents();
        },
        bindEvents: () => {
            window.addEventListener('hashchange', () => {
                sections.toggle(document.location.hash);
            });
        }
    };

    const sections = {
        toggle: (route) => {
            const sections = Array.from(document.getElementsByTagName('section'));

            sections.forEach((section) => {
                section.classList.add('hidden');
            });
            document.querySelector(route).classList.remove('hidden');
        }
    };

    app.init();
}());
