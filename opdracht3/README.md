# Advantages SPA

+ Makes user load sources (like css, header and footer) once, instead of at every page refresh.
With a Multi page application (MPA), the user requests static files and parts for every page, while they don't change. A SPA doesn't do this.
+ It's easy to hand over the state to another page.
Because you don't actually change from page, the state doesn't reset when navigating to another page.
+ Lighter for the server, as the client renders the front-end instead of the server when using php or jade.
On an MPA the server does all the templating and rendering. This takes a lot of processing on the server. With an SPA the client does all this work, taking away server load.
+ When sending over data as JSON in stead of html, you might be able to reduce data traffic between the client and server
With JSON you just have to send over the data from the server to the client. Not the markup the data is being wrapped in. This way you can reduce traffic between both.

# Disadvantages

+ Bad SEO / hard to have good SEO
Because everything is on one page or nothing is on the page initially, search engines might have a hard time scraping your page.
+ Javascript is required
Without javascript, there won't be rendered anything. The user is stuck on a blank page.
+ Easier to hack, while the user can easily inspect structure of a website.
By moving logic from the server to the client, you move it towards the user. The serverside code is not available for the user, while the clientside code is. You have to be cautious what you place in your clientside code.
+ Memory leaks. Because the page never reloads, memory leaks have a huge impact on the application's speed when happening.
+ If a request takes a while and the user keeps on clicking a button, the app keeps on requesting data from the server.
+ Analytics might be hard to implement in a SPA
Analytics often work with page urls and counting the times a page is loaded. In an SPA is just one pageload.

## Sources: 
+ http://stackoverflow.com/questions/21862054/single-page-application-advantages-and-disadvantages
+ https://www.quora.com/What-are-the-advantages-of-SPA-single-page-application-over-a-normal-web-application
+ http://www.zymphonies.com/blog/single-page-application-advantages-and-disadvantages
+ http://adamsilver.io/articles/the-disadvantages-of-single-page-applications/
