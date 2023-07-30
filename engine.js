//
// JavaScript code for the Dijkstra's Algorithm Demonstrator
//
var nodes, edges, network;

//
// Create a graph to be analysed
// Currently hard-coded, should be randomised with some degree
// of design, e.g., min/max edges per node, work from one node
// 'outwards' to get some degree of 'flow'.
//
function generateGraph()
{
  // Populate the nodes array with nodes
  nodes = new vis.DataSet([
    { id: 1, label: " A ", group: 0 },
    { id: 2, label: " B ", group: 0 },
    { id: 3, label: " C ", group: 0 },
    { id: 4, label: " D ", group: 0 },
    { id: 5, label: " E ", group: 0 },
    { id: 6, label: " F ", group: 0 },
    { id: 7, label: " G ", group: 0 },
    { id: 8, label: " H ", group: 0 },
  ]);

  // Populate the edges array with edges
  edges = new vis.DataSet([
    { from: 1, to: 2, label: "8" },
    { from: 1, to: 3, label: "5" },
    { from: 2, to: 3, label: "2" },
    { from: 2, to: 4, label: "14" },
    { from: 2, to: 5, label: "3" },
    { from: 3, to: 5, label: "10" },
    { from: 4, to: 5, label: "3" },
    { from: 4, to: 6, label: "7" },
    { from: 5, to: 6, label: "1" },
    { from: 5, to: 7, label: "6" },
    { from: 6, to: 8, label: "4" },
    { from: 7, to: 8, label: "9" },
  ]);

  // create a network
  var container = document.getElementById("mynetwork");

  var data = {
    nodes: nodes,
    edges: edges,
  };

  var options = {
    nodes: {
      shape: "circle",
      size: 60,
      font: {
        size: 32,
      },
      borderWidth: 2,
      shadow: true,
    },
    edges: {
      width: 2,
      shadow: true,
    },
  };

  network = new vis.Network(container, data, options);

  //
  // Finally, build the adjacency list for the graph
  //
  buildAdjacencyList();
}

//
// Change the 'group' attribute of a node to show that it has
// been visited, or is the currentnode:
//
// group 0 == initial state
// group 1 == current node
// group 2 == visited
//
function markNode(thisId, thisGroup)
{
  thisNode = nodes.get(parseInt(thisId));
  thisNode['group'] = thisGroup;
  nodes.update(thisNode);
}

//
// TEMP - for GUI testing only
//
function markNodeVisited(thisGroup)
{
  thisId = document.getElementById("visited-node-id").value;
  thisNode = nodes.get(parseInt(thisId));
  thisNode['group'] = thisGroup;
  nodes.update(thisNode);
}

//
// adjacencyList is an array containing arrays; one per node
// each node array consists of a node label, followed by an
// object which holds the edges from that node.
// E.g.,
// aL = [["A", {"B": 5, "C": 8}], ...]
var adjacencyList = [];

function buildAdjacencyList()
{
  //
  // Reset the list
  //
  ajacencyList = [];
  
  nodeList = nodes.get({fields: ['id', 'label', 'group']});
  edgeList = edges.get({fields: ['from', 'to', 'label']});

  for (let node of nodeList) {
    newEntry = [];
    nodeLabel = node['label'];

    let adjacencies = {}
    for (let edge of edgeList) {
      if (edge['from'] == node['id']) {
        var thisLabel = mapNodeIdToLabel(edge['to']);
        adjacencies[thisLabel] = edge['label'];
      }

      if (edge['to'] == node['id']) {
        var thisLabel = mapNodeIdToLabel(edge['from']);
        adjacencies[thisLabel] = edge['label'];
      }
    }

    newEntry.push(nodeLabel);
    newEntry.push(adjacencies);
    adjacencyList.push(newEntry)
  }
  console.log(adjacencyList);
}

function mapNodeIdToLabel(thisId) {
  nodeList = nodes.get({fields: ['id', 'label', 'group']});
  let retval = "None";
  
  for (let node of nodeList) {
    if (node['id'] == thisId) {
      retval = node['label'];
      break;
    }
  }
  return retval ;
}

function mapNodeLabelToId(thisLabel) {
  nodeList = nodes.get({fields: ['id', 'label', 'group']});
  let retval = -1;
  
  for (let node of nodeList) {
    if (node['label'] == thisLabel) {
      retval = node['id'];
      break;
    }
  }
  return retval ;
}

var distances = [];
var visitedVertices = [];

function solveDijkstra()
{
  //
  // "Step 1a - Select a vertex as the starting point, ..."
  //
  var sourceVertex = " A ";
  var destinationVertex = " H ";

  console.log("Finding a route from %s to %s", sourceVertex, destinationVertex);

  var stillSearching = true;
  var passNumber = 1;
  var route = [];

  //
  // The distances list contains an entry (itself a list) for each vertex,
  // these entries show how much it 'costs' to get from the source vertex
  // to the named vertex, and also the route to use to get to that vertex.
  // A distance value of -1 is used as a substitute for infinity.
  //
  // We create the distances list automatically, from the adjacencyList.
  //
  // "Step 1a - ... and set the costs to all other vertices as infinite."
  //

  distances = [];
  var emptyRoute = [];
  var infiniteCost = -1;

  for (adjacency of adjacencyList) {
    dEntry = [adjacency[0], infiniteCost, emptyRoute];
    distances.push(dEntry);
  }
  
  //
  // Step 1b - "Mark all vertices as unvisited."
  //
  visitedVertices = [];

  //
  // Step 1c - "Set the starting point as the current vertex."
  //
  var currentVertex = sourceVertex;
  
  //
  // "Step 1d - Set the cost from the starting point to the current vertex as zero."
  //
  // Leave all other distance as 'infinite' (represented by -1 in this program)
  //
  for (d of distances) {
    if (d[0] == sourceVertex) {
      d[1] = 0;
    }
  }
  
  while (stillSearching) {
    //
    // Show some tracing information...
    //
    console.log("--------------------------------------");
    console.log("Pass: %d - Current Vertex: %s", passNumber, currentVertex);
    
    //
    // Find our currently recorded cost for getting to currentVertex from the
    // starting point.
    //
    //  Use the spread operator (...) to make a copy
    //
    found = false;
    currentDistance = 0;
    for (d of distances) {
      if (d[0] == currentVertex) {
        found = true;
        currentDistance = d[1];
        route = [...d[2]];
      }
    }

    if (found == false) {
      console.log("Error - could not find %s in distances array.", currentVertex);
      return;
    }
    console.log("Cost from %s to %s is %d", sourceVertex,
                                        currentVertex,
                                        currentDistance);

    //
    // Step 2a - Consider all of the unvisited neighbours for the current vertex...
    //
    for (adjacency of adjacencyList) {
      if (adjacency[0] == currentVertex) {
        neighbourDict = adjacency[1];
        
        for (connection in neighbourDict) {
          neighbour = connection;
          neighbourCost = parseInt(neighbourDict[connection]);

          if (visitedVertices.includes(neighbour)) {
            console.log("Already visited %s", neighbour);
            continue;
          }
          console.log("Considering %s", neighbour);
          for (vertexDist of distances) {
            if (vertexDist[0] == neighbour) {
              //
              // Step 2b - If this cost is less than the value
              // currently in the table, update the table with the
              // new cost and route
              //
              // Use the spread operator (...) to make a copy
              //
              if (vertexDist[1] == infiniteCost) {
                vertexDist[1] = neighbourCost + currentDistance
                vertexDist[2] = [...route];
                vertexDist[2].push(currentVertex);
                console.log("Found a new route: %s", vertexDist[2]);
                console.log("Cost: %d", vertexDist[1]);
              }
              else if (vertexDist[1] > neighbourCost + currentDistance) {
                oldCost = vertexDist[1];
                vertexDist[1] = neighbourCost + currentDistance;
                vertexDist[2] = [...route];
                vertexDist[2].push(currentVertex);
                console.log("Found a better route %s", vertexDist[2]);
                console.log("New cost: %d", vertexDist[1]);
                console.log("Old cost: %d", oldCost);
              }
            }
          }
        }
      }
    }
    //
    // Step 2c - When all of the unvisited neighbours have been considered, mark
    // the current vertex as visited.
    //
    visitedVertices.push(currentVertex);

    //
    // Step 3 - If all of the vertices have been visited, then stop.
    //
    if (visitedVertices.length == adjacencyList.length) {
      stillSearching = false;
    }
      
    //
    // Step 4 - Otherwise, look at the unvisited vertices, and select the vertex with
    // the lowest cost, set this as the current vertex and go back to step 2.
    //
    candidateVertex = "Z";
    lowestCost = 999;

    for (vertexDistance of distances) {
      if (visitedVertices.includes(vertexDistance[0])) {
        ;
      }
      else if (vertexDistance[1] == infiniteCost) {
        ;
      }
      else {
        if (vertexDistance[1] < lowestCost) {
          lowestCost = vertexDistance[1]
          candidateVertex = vertexDistance[0]
        }
      }
    }
    currentVertex = candidateVertex;

    passNumber = passNumber + 1;
  }
  
  //
  // Show the full distances and routes list
  //
  console.log("--------------------------------------");
  console.log("\nResults:");
  for (d of distances) {
      console.log(d);
  }
  console.log("Complete");
}

var step = -1;

function stepRoute()
{
  //
  // Check if we are just beginning the route steps, if so, wipe the table
  //
  if (step == -1) {
    step = 0;
  }

  //
  // Update the table with the next step
  //
  var displayString = "distances" + distances[step]+ "   visitedVertices" + visitedVertices[step];
  document.getElementById("show-distances").innerHTML = displayString;
  markNode(mapNodeLabelToId(distances[step][0]), 1);

  if (step > 0) {
    markNode(mapNodeLabelToId(distances[step-1][0]), 2);
  }

  //
  // Increment
  //
  step += 1;

  //
  // If we have reached the end, reset the step counter to -1
  //
  if (step == distances.length) {
    step = -1;
  }
}
