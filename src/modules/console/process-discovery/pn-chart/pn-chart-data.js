{
	// Petri Net information from pnml file
  "pn": { 
    "connections": [{
      "id": "arc1",
      "source": "n1", // ID of place or transition
      "target": "n4"
    }, {
      "id": "arc1",
      "source": "n4", // ID of place or transition
      "target": "n2"
    }, {
      "id": "arc1",
      "source": "n4", // ID of place or transition
      "target": "n3"
    }],
    "transitions": [{
      "id": "n1",
      "name": "Posting Work Queue"
    }, {
    	"id": "n2",
    	"name": "Messaging Work Queue"
    }, {
    	"id": "n3",
    	"name": "Fallout Work Queue"
    }],
    "places": [{
      "id": "n4",
      "name": "Place 1",
      "token": 1 // The value can be retrieved from the place.initialMarking, if no this field defined in pnml, pass null
    }]
  },
  // Other information to indicate transition count, duration and so on
  "addon": {
  	"transition": [{
  		"start": "n1", // Will be mapped to the transition ID in petri net information
  		"end": "n3", // Will be mapped to the transition ID in petri net information
  		"count": 200, // Count of cases which went from "Posting Work Queue" to "Messaging Work Queue"
  		"duration": 3600000 // milliseconds
  	}]
  }
}
