# Advantages SPA

+ Makes user load sources (like css, header and footer) once, instead of at every page refresh.
+ It's easy to hand over the state to another page.
+ Lighter for the server, as the client renders the front-end instead of the server when using php or jade.
+ When sending over data as JSON in stead of html, you might be able to reduce data traffic between the client and server

# Disadvantages

+ Bad SEO / hard to have good SEO
+ Javascript is required
+ Easier to hack, while the user can easily inspect structure of a website.
+ Memory leaks. Because the page never reloads, memory leaks have a huge impact on the application's speed when happening.
+ If a request takes a while and the user keeps on clicking a button, the app keeps on requesting data from the server.
+ Analytics might be hard to implement in a SPA

## Sources: 
+ http://stackoverflow.com/questions/21862054/single-page-application-advantages-and-disadvantages
+ https://www.quora.com/What-are-the-advantages-of-SPA-single-page-application-over-a-normal-web-application
+ http://www.zymphonies.com/blog/single-page-application-advantages-and-disadvantages
+ http://adamsilver.io/articles/the-disadvantages-of-single-page-applications/
