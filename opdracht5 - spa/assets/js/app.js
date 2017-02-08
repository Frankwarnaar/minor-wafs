/*jshint esversion: 6 */
'use strict';
(function() {
    const config = {
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

            this.handleHashChange();

            if (hashLocation) {
                sections.setActive(hashLocation);
            } else {
                document.getElementById('frontendBestPractices').classList.add('hidden');
            }
        },
        handleHashChange: () => {
            window.addEventListener('hashchange', (e) => {
                const hashLocation = document.location.hash;

                if ((config.routes).includes(hashLocation)) {
                    sections.setActive(hashLocation);
                }
            });
        }
    };

    const sections = {
        setActive: (route) => {
            const sections = Array.from(document.getElementsByTagName('section'));

            sections.forEach(section => {
                section.classList.add('hidden');
            });

            document.querySelector(route).classList.remove('hidden');
        }
    };

    app.init();
}());
