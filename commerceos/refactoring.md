# Client

Builder Client is standalone Angular Universal application
to serve published themes. Using server-side rendering (SSR) 
application generally renders more quickly, giving users 
a chance to view the application layout before it becomes 
fully interactive. SSR provides Search engines crawlers may understand 
JavaScript, but there are often limitations how they render.

General idea of SSR client implementation is the next:\
• client server gets request, extract host name from request url
and request backend to get application id, using app id it
requests active theme.
• parse request url to get page seo url, then try to get page id
from theme routing using that. If not exist return 404 page.
• if page id is found, request api for page cached status.
• if page cached status is true serve pre-rendered page
from azure blob storage.
• if page cached status is false render page using angular universal,
serve rendered html to client using transfer state.
Then upload rendered html to azure and dispatch rbmq event like
'page.cache.created' with rendered page id. Then API should update
page cached status to true, so next time requesting same page
it will always be served from azure blob storage.

### Versioning

Pages and elements will have version stored within. 
That version is set on any changes as last published version + 1,
so when theme is loaded in builder, elements queried by max version
but in the client, elements selected by version that is less or equal 
to the current published version. It allows to easy find changed
pages and invalidate caches. For example, new theme have last published
version set to 0, so all new pages and elements will have version 1
(last published + 1). When publishing, theme published version becomes 1,
then we can select page ids from pages and elements collections using that.
As theme wasn't published at all yet, all pages will be selected and
cached for all of them in sitemap will be set to false. 
Publishing next time, assuming only some elements on one single page
are changed, they will have version 2 set (current published version 
is now one, plus one), so selecting pages having version 2 will give
a list of changed pages we need to set cached status to false.

In turn, when some integrations are updated or deleted (e.g. products),


### Recursive templates rendering

Add custom directive for rendering theme

Using angular templates recursive using *ngFor triggers
too many change detection what makes rendering time unacceptable.
Would be nice if directive syntax mimic *ngFor, but for now seems 
it's hard or impossible to get done due how angular views works.
In worst case can use same approach as used in the current builder 
renderer implementation - render all elements in a row and then
append to proper parents using angular renderer2, also possible
to try @angular/cdk DomPortals, but they by default supports only
one element per portal, might be promising solution but still
needs custom portal directive. When directive done, current
builder renderer implementation should be replaced.  

### Elements ordering

Before render need to sort elements positions.

In builder elements are using absolute positioning and also  
there no guarantee in which order elements will be selected 
from database, so elements at the bottom can be rendered before
elements above. Also, in case css not loaded yet, or failed
to load at all, page becomes unreadable mess where content rendered
in random order. Also, it has impact on SEO because search engines
do not care about css layout, they need to have content rendered 
in the logic sequence reading from top and from left to the right.

### CSS grid layout

Make page layout using CSS grid.

Absolute positioning overrides the default flow layout of browsers
and so will reduce accessibility for many users. Font size in
browser settings will break page layout, hard to implement
responsive design (currently in builder is available only adaptive
design with 3 screen sizes - desktop, tablet and mobile, but some
elements becomes too big or too small between predefined screens,
so here already are implemented some tweaks to rescale whole page).

### Links

Links should not be implemented using only JavaScript.

All links to other pages should be implemented using angular
routerLink directive (and rendered with full url href attribute 
inside quill text), this allows crawlers to follow links 
and also allows user to navigate even if script still loading
on slow networks. Otherwise, user must wait for the full client 
application to bootstrap and run.

### Using RTree

Use RTree for finding appropriate event target.

Considering all links to other resources will be replaced 
by angular routerLink directive, still needs to have other user
interactions working (open in popup, add to cart, scroll etc.).
When user interacts with page, need to know active element and 
what to do next. In theory, can set id attribute on all elements,
inside event handler retrieve attribute from event target, then
find element in page data and check if there are some attached 
interaction or integration. But based on experience using r-tree 
in builder, seems more clean and more ideologically close to MVC
pattern to use same approach in client, footprint of RBush
(r-tree implementation used in builder) is only 2.9KB, also,
as r-trees usually intended to use with millions of objects,
to load into tree few thousands elements in builder takes just
a few milliseconds. As additional pros, elements can be rendered
on &lt;canvas&gt; or using flutter or react native or ionic framework
without changing source code.

### interactions

Move all interactions to integrations, unify interactions interface.

Current implementation of interaction service has hardcoded
functionality per interaction type. Should be indifferent to 
interaction type, partially is shared with animations implementation,
cos animations can be triggered by interactions.
(animations interactions should be implemented like in the old denis
branch, if not deleted yet).

### loading integrations

Move integrations loading to backend.

Create unified interface for integrations. Implement proxy
on the backend and use single endpoint for loading data.
Remove context service also from builder and use same approach.

### checkout integration

Lazy load checkout web component.

Checkout is pretty hefty (~500KB, 2x as whole client) and needed 
only in shop application, should be removed from client bundle
and loaded as lazy module only when user proceeds to checkout.
Petar already should be testing how to implement that using 
module federation feature coming with angular 12 (webpack 5).

### Fonts

Move collect page fonts to client

Currently, fonts are collected per screen and language 
when theme is published. 

### Sitemap

In theory sitemap should be updated when some pages added or deleted,
or page route changed. Also, it should be updated when any of integrations
affecting routing changed (e.g. product details page). 

Current implementation of integrations does not have any indications
if integration is changing theme routing. Links to the product details 
page are implemented as special case for an implementation of products
integration only. So, there no clear way to know if some product added,
removed, or it's slug changed and need to regenerate sitemap. 

Considering refactoring of integrations needs some R&D and can take
quite a lot of time, and needs to make a lot of changes in builder and
might be even on the backend, for now sitemaps will be generated 
only when theme published. Generating sitemap can be quite slow process, 
because to get all product pages for sitemap need to fetch all pages, 
find all integrations on the page, load them, collect products ids 
and slugs. In case of having performance issues with sitemap,
possible to move generator to separate process.

Product context added to the document element in the client app when
fetching page data, instead should be added in the builder 
when changing page type to `products`.

### Caching pre-rendered pages

After page is rendered and uploaded to azure, client dispatches
RBMQ event to set page cached status. While rendering, all ids
of loaded context items should be collected. Event payload contains
page id, md5 hash of full url including query string params and
array of collected ids.

Pages are rendered using screen styles based on user-agent string.

As currently languages implemented only as separate integration 
not using any routing (can't set language in url) and 
only switching using JavaScript, there are two options:

• Use default theme language with SSR
or
• add current language to query string parameters, in this case 
pages also can be pre-rendered in different languages.

When a client receives a request, the following actions are performed:

1. To the cached pages API endpoint send request containing
md5 hash of request url.
 
2. If backend found any records in the cached table containing that hash,
it sends back HTTP 304 Not Modified response. That means pre-rendered 
page already exists in azure blob storage and is up-to-date. In this
case client just should serve cached html from azure.

3. If backend did not find any records by provided hash, it should
return HTTP 404 Not Found. Client getting 404 should render requested
page using @angular/universal server side rendering update caches and
serve rendered html to the customer.

• request application id by domain\
• request active theme by app id\
• retrieve last published version of theme\
• then using received version load page data\
• find any context integrations attached to elements\
• load context update using query string params when fetch integration\
• render page and serve to client\
• upload rendered html to azure blob storage\
• dispatch rabbitMQ event `{ pageId, hash, context }`
where context is array of loaded context items

###  Pre-rendered pages Cache invalidation

When theme is published, if particular page has any changes,
backend delete all records from caches table containing that page id.
(see [_Versioning_](#Versioning)).

When any of integrations changed (e.g. product title updated 
or product added), backend find all hashes from records having
that context item id (in this case product id) and delete all 
records by these hashes.

In terms of common sense, probably these products 
or other integrations changes should not be propagated
to the client until user publishes theme. 
This should simplify caches invalidation and sitemap generation,
but it's separated complicate topic and will be not included 
in the first version of client.

### Dynamic pages

Some integrations can have dedicated pages, for example 
product details page. 

(see problems described in the [_Sitemap_](#Sitemap) section).

### Protected pages

Protected pages always rendered using SSR, no caching

### SEO

SEO data like meta keywords description, canonical pages 

### Pagination

Follow official google documentation
https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading

### Devices - Desktop/Tablet/Mobile

User-agent string

### Deployment

Currently, client switches applications and APIs based on special
request headers like `x-forwarded-host`, `app-type`, `app-host` and
`app-url`. Instead, should be deployed separate client for each 
application type. Environment variables like app type, api endpoints,
rabbitMQ and elastic urls, azure account setting etc. should be passed
into container.
 
