// Data model
// TODO: Add more locations

var Model = {
  activeMarker: ko.observable(null),
  markers: [
    {
      title: 'de Young Museum',
      lat: 37.771723,
      lng: -122.468633,
      url: 'http://www.deyoung.famsf.org',
      highlight: ko.observable(false)
    },
    {
      title: 'San Francisco Museum of Modern Art',
      lat: 37.785938,
      lng: -122.401040,
      url: 'http://www.sfmoma.org',
      highlight: ko.observable(false)
    },
    {
      title: 'Computer History Museum',
      lat: 37.415497,
      lng: -122.077373,
      url: 'http://www.computerhistory.org',
      highlight: ko.observable(false)
    },
    {
      title: 'Oakland Museum of California',
      lat: 37.798967,
      lng: -122.264151,
      url: 'http://www.museumca.org',
      highlight: ko.observable(false)
    },
     {
      title: 'Children Discovery Museum of San Jose',
      lat: 37.333897,
      lng: -121.892468,
      url: 'http://www.cdm.org',
      highlight: ko.observable(false)
    }
  ]
};

// View model
var ViewModel = function() {
  var self = this;
  var map, geocoder, bounds, infowindow;

  self.mapUnavailable = ko.observable(false);
  self.query = ko.observable('');
  self.showList = ko.observable(true);
  self.currentPictures = ko.observableArray();
  self.lightboxUrl = ko.observable('');
  self.lightboxVisible = ko.observable(false);
  self.markerArray = ko.observableArray();
  self.rightArrowVisible = ko.observable(true);
  self.leftArrowVisible = ko.observable(true);


// Initialize the map by creating map markers from the data.
// Use Immediately-Invoked Function Expression to kick off immediately.
  var initializeMap = function() {
// Create map if google maps object exists.
    if(typeof window.google === 'object' && typeof window.google.maps === 'object') {
      var mapOptions = {
        disableDefaultUI: true,
        zoomControl: false,
        panControl: false,
        streetViewControl: false,
        mapTypeControl: true
      };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      geocoder = new google.maps.Geocoder();
      bounds = new google.maps.LatLngBounds();
      infowindow = new google.maps.InfoWindow({
        content: null
      });
      var markerList = Model.markers;
      for(var x = 0; x < markerList.length; x++) {
        var markPos = new google.maps.LatLng(
          markerList[x].lat,
          markerList[x].lng
        );
        var marker = new google.maps.Marker({
          position: markPos,
          map: map,
          title: markerList[x].title,
          url: markerList[x].url,
          highlight: markerList[x].highlight
        });

// Click event listener creates infowindow for each marker object.
// Google geocoder pulls physical address from position data.
// If valid data returned, set infowindow with formatted address. If not, use default "unable to pull address" message.
        google.maps.event.addListener(marker, 'click', function() {
          var clickedEl = this;
          geocoder.geocode({'latLng': clickedEl.position}, function(results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
              if (results[0]){
                var address = results[0].formatted_address;
                var split = address.indexOf(',');
                infowindow.setContent("<span class='title'>" + clickedEl.title +
                  "</span><br>" + address.slice(0,split) + "<br>" +
                  (address.slice(split+1).replace(', USA','')) +
                  "<br><a href=" + clickedEl.url + ">" + clickedEl.url + "</a><br>");
              }
            } else {
              infowindow.setContent("<span class='title'>" + clickedEl.title +
                "</span><br><<Unable to pull address at this time>><br><a href=" +
                clickedEl.url + ">" + clickedEl.url + "</a><br>");
            }
          });
          infowindow.open(map, clickedEl);
          clearMarkers();
// Change the marker (and list) to show selected status.
//          clickedEl.setIcon(MarkerOpt.image2);
//          clickedEl.setShape(MarkerOpt.shape2);
          clickedEl.highlight(true);
// Move the map viewport to center selected item.
          map.panTo(clickedEl.position);
          Model.activeMarker(clickedEl);
        });

// Click event enables closing infowindow with X in top right of box.
// The function will clear any selected markers, and recenter the map to show all markers on the map.
        google.maps.event.addListener(infowindow, 'closeclick', function() {
          clearMarkers();
          map.panTo(bounds.getCenter());
          map.fitBounds(bounds);
        });

// Change the map viewport to include new map marker
        bounds.extend(markPos);

// Append the marker to array
        self.markerArray.push(marker);
      }
// Change the size map to fit all markers, then center map
      map.fitBounds(bounds);
      map.setCenter(bounds.getCenter());

// Check size of window
      checkWindowSize();
    } else {
// If no google object found, display error div
      self.mapUnavailable(true);
    }

  }();

// TODO: Pass "toggleBounce" into above function so that clicking on the marker will toggle the animation between a BOUNCE animation and no animation.
function toggleBounce() {

  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}


// Knockout calculated observable filters and returns items that match the query string input by the user.
// The items will be used to update the list of locations shown.

  self.filteredArray = ko.computed(function() {
    return ko.utils.arrayFilter(self.markerArray(), function(marker) {
      return marker.title.toLowerCase().indexOf(self.query().toLowerCase()) !== -1;
    });
  }, self);

// The filteredArray changes will show or hide the associated markers on the map.

  self.filteredArray.subscribe(function() {
    var diffArray = ko.utils.compareArrays(self.markerArray(), self.filteredArray());
    ko.utils.arrayForEach(diffArray, function(marker) {
      if (marker.status === 'deleted') {
        marker.value.setMap(null);
      } else {
        marker.value.setMap(map);
      }
    });
  });

// Highlight map marker if list item is clicked.
  self.selectItem = function(listItem) {
    google.maps.event.trigger(listItem, 'click');
  };

// Toggle showing marker list when up/down arrow above list is clicked.
  self.toggleList = function() {
    self.showList(!self.showList());
  };

// Get Flickr photos to match location of selected marker.
  self.getPictures = function() {
    var marker = Model.activeMarker();
    if(marker !== null) {
      var textSearch = marker.title.replace(' ','+');

// Create search URL using marker title as text search, and marker position for lat/lng geolocation match of photos within 1 km of position.
//Returns up to 10 photos clickedEl match criteria.
// REST Request Format: https://api.flickr.com/services/rest/?method=flickr.test.echo&name=value API Method: flickr.photos.search

      var searchUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search' +
        '&api_key=c7c4bc67a7a0727c5bffc2aebd2687d0&text=' + textSearch +
        '&license=1%2C2%2C3%2C4%2C5%2C6%2C7&content_type=1&lat=' + marker.position.lat() +
        '&lon=' + marker.position.lng() + '&radius=1&radius_units=km&per_page=10&page=1' +
        '&format=json&nojsoncallback=1';

// Use async call to get flickr data.
// If successful, call function to parse results, then display first photo.
// If failed, alert user.
      $.getJSON(searchUrl)
        .done(function(data) {
          parseSearchResults(data);
          self.lightboxUrl(self.currentPictures()[0]);
          self.lightboxVisible(true);
        })
        .fail(function(jqxhr, textStatus, error) {
          alert("Unable to get photos from Flickr at this time.");
        });
    } else {
      // If no marker chosen when trying to retrieve photos, alert user.
      alert("Select a map marker before trying to get more infos.");
    }
  };


 // TODO (Placeholder): Add other feeds, e.g. Yelp, Wikipedia etc. reviews to match location of selected marker.



// Close the lightbox when clicking the 'x' above.
// Clear the currentPictures array the photo is clicked.
  self.closeLightbox = function() {
    self.currentPictures.removeAll();
    self.lightboxVisible(false);
    self.lightboxUrl('');
  };

// Select the next photo in the currentPictures array to be displayed when the right arrow is clicked. If at the end of the currentPictures array, the following photo will loop to the start of the array
  self.nextPhoto = function() {
    var i = self.currentPictures.indexOf(self.lightboxUrl());
    if(i !== self.currentPictures().length-1){
      self.lightboxUrl(self.currentPictures()[i+1]);
    }else{
      self.lightboxUrl(self.currentPictures()[0]);
    }
  };

// Select the previous photo in the currentPictures array, to be displayed when the left arrow is clicked. If at the beginning of the currentPictures array, the new photo will loop to the end of the array

  self.prevPhoto = function() {
    var i = self.currentPictures.indexOf(self.lightboxUrl());
    if(i !== 0) {
      self.lightboxUrl(self.currentPictures()[i-1]);
    }else{
      self.lightboxUrl(self.currentPictures()[self.currentPictures().length-1]);
    }
  };

  //Helper function to take data from flickr JSON call, and form valid JPG links to show photos when the user clicks on the flickr button at the bottom of the web page.
  function parseSearchResults(data) {
    ko.utils.arrayForEach(data.photos.photo, function(photo) {
      var photoLink = 'https://farm' + photo.farm + '.staticflickr.com/'
        + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
      self.currentPictures.push(photoLink);
    });
  }

  // Helper function used to reset all markers to default image, clear color highlight from the list of locations, and reset the activeMarker variable.
  function clearMarkers() {
    for(var x = 0; x < self.markerArray().length; x++){
//      self.markerArray()[x].setIcon(MarkerOpt.image);
//      self.markerArray()[x].setShape(MarkerOpt.shape);
      self.markerArray()[x].highlight(false);
    }
    Model.activeMarker(null);
  }

//Check viewport width, called only on initialization of map.
//If lower than 400px (mobile browser), toggle list to collapsed view.

  function checkWindowSize() {
    if($(window).width() < 400){
      self.showList(false);
    }
  }
};

//check if website if offline
window.addEventListener('load', function() {
  var status = document.getElementById("status");

  function updateOnlineStatus(event) {
    var condition = navigator.onLine ? "online" : "offline";

    status.className = condition;
    status.innerHTML = condition.toUpperCase();

    log.insertAdjacentHTML("beforeend", "Event: " + event.type + "; Status: " + condition);
  }

  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});


ko.applyBindings(new ViewModel());
