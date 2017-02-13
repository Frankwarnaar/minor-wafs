/*jshint esversion: 6 */
(function() {
    'use strict';
    const config = {
        startRoute: '#start',
        routes: (function(){
            const sections = Array.from(document.querySelectorAll('[data-route]'));
            return sections.map(section => section.getAttribute('data-route'));
        }())
    };

    console.log(config.routes);

    const app = {
        init() {
            routes.init();
        }
    };

    const routes = {
        init() {
            const hashLocation = document.location.hash;

            if (hashLocation && (config.routes).includes(hashLocation)) {
                sections.setActive(hashLocation);
            } else {
                sections.setActive(config.startRoute);
            }

            this.handleHashChange();
        },
        handleHashChange() {
            window.addEventListener('hashchange', () => {
                const hashLocation = document.location.hash;

                if ((config.routes).includes(hashLocation)) {
                    sections.setActive(hashLocation);
                }
            });
        }
    };

    const sections = {
        setActive(route) {
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
