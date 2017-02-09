/*jshint esversion: 6 */
'use strict';
(function() {
    const config = {
        startRoute: '#start',
        routes: ['#start', '#frontendBestPractices']
    };

    const app = {
        init: () => {
            routes.init();
        }
    };

    const routes = {
        init: function() {
            const hashLocation = document.location.hash;

            if (hashLocation && (config.routes).includes(hashLocation)) {
                section.setActive(hashLocation)
            } else {
                sections.setActive(config.startRoute));
            }

            this.handleHashChange();
        },
        handleHashChange: () => {
            window.addEventListener('hashchange', () => {
                const hashLocation = document.location.hash;

                if ((config.routes).includes(hashLocation)) {
                    sections.setActive(hashLocation);
                }
            });
        }
    };

    const sections = {
        setActive: function(route) {
            const sections = Array.from(document.getElementsByTagName('section'));
            sections.forEach(section => {
                if (`#${section.getAttribute('id')}` === route) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        }
    };

    app.init();
}());
