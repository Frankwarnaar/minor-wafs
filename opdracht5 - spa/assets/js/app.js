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
            sections.setActive((hashLocation) ? hashLocation : config.startRoute);

            this.handleHashChange();
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
        setActive: function(route) {
            this.hideAllSections();
            this.showSection(route);
        },
        hideAllSections: () => {
            const sections = Array.from(document.getElementsByTagName('section'));

            sections.forEach(section => {
                section.classList.add('hidden');
            });
        },
        showSection: (route) => {
            document.querySelector(route).classList.remove('hidden');
        }
    };

    app.init();
}());
