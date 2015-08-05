P5: Neighborhood Map Project 
============================
The requirement for this project was to develop a single page application featuring a map of a neighborhood. Additional required functionality includes highlighted locations, third-party data about those locations and various ways to browse the content.

Goal of the project is to combine all previous lessons learned during the Front End Web Development Nanodegree into one complex project.


Usage Instructions
==================
Download or clone files from: http://vonderheiden.github.io/FEND-neigborhood-map-v6

The browser shows a Google Map of Bay Area, with several museum locations as markers on the map. 

At the left of the screen the Google Map includes pan, street view and zoom functionality.

Locations can be chosen by clicking on a marker directly or on an item in the list on the bottom left of the screen.

A box will pop up over the chosen marker, giving some information about the location.

The user can also filter the number of displayed markers by typing letters or a word into the Filter List box above the list. This will narrow the markers down to display matching titles only.

The user can click on the down arrow icon above the list to hide it or on the up arrow will display the list.

At the left of the screen (below the map zoom slider is a Flickr icon. When clicking it, pictures related to the location are pulled from Flickr photo feeds and displayed for the user in a lightbox format. 

The user can navigate through these photos using the arrow buttons.

The application is using the built in navigator online property to graciously manage API errors when the internet connection is lost. It inform the user when your application is offline and when has returned to an 'online' status again.


## Resources Used For This Project
===================================
- Knockout web framework (knockoutjs.com)
- Google Maps Javascript and Geocoding API
- Flickr API

Knockout web framework tutorial
http://learn.knockoutjs.com/

Google Maps API -
https://developers.google.com/maps/documentation/javascript/tutorial

Online and offline events
https://developer.mozilla.org/en-US/docs/Online_and_offline_events

Multiple markers, multiple InfoWindow solution -
http://you.arenot.me/2010/06/29/google-maps-api-v3-0-multiple-markers-multiple-infowindows/

InfoWindow not displaying entire content -
http://stackoverflow.com/questions/1554893/google-maps-api-v3-infowindow-not-sizing-correctly

Add lightbox using KnockoutJS -
http://tech.pro/tutorial/1575/knockoutjs-lesson-14-adding-a-lightbox

KO Utils (filter) -
http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html

List CSS -
http://www.marcofolio.net/css/8_different_ways_to_beautifully_style_your_lists.html

How to use Flickr API (basics) -
http://kylerush.net/blog/flickr-api/

