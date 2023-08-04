//
// JavaScript code for the Dijkstra's Algorithm Demonstrator
//
var nodes, edges, network;

//
// Create a graph to be analysed
// Randomised with some design; min/max edges per node, work from one node
// 'outwards' to get some degree of 'flow'.
//
// 'Orphaned' (i.e., unconnected) vertices are detected and connected to
// other vertices.
//
// Currently, unconnected graphs can be created - I plan to check for this
// situation by doing a DFS starting from an arbitrary vertex and checking
// that all vertices are reached.  If no, I think the simplest solution
// may be to connected one of the vertices in the unconnected group to one
// in the DFS'ed group, but we would then have to retest, in case there are
// more than two unconnected groups.  An alternative would be to junk the
// graph and regenerate, but that is not very elegant.
//
function generateGraph()
{
  const minVertices = 6;
  const maxVertices = 12;
  const minEdgesPerVertex = 1;
  const maxEdgesPerVertex = 4;
  const minEdgeWeight = 1;
  const maxEdgeWeight = 20;
  const vertexLabels = [" A ", " B ", " C ", " D ", " E ", " F ", " G ", " H ", " I ", " J ", " K ", " L "];
  
  let numVertices = Math.floor(Math.random() * (maxVertices - minVertices)) + minVertices;

  let nodeSource = [];
  for (let i = 0; i < numVertices; i++) {
    let newNode = {};
    newNode['id'] = i+1;
    newNode['label'] = vertexLabels[i];
    newNode['group'] = 0;
    nodeSource.push(newNode);
  }

  // Populate the nodes array with nodes
  nodes = new vis.DataSet(nodeSource);

  let edgeSource = [];
  let unconnectedVertices = [];
  
  for (let i = 0; i < numVertices; i++) {
    //
    // For each vertex, create a number of edges, with connections to other vertices up to
    // four positions 'away' from the current vertex (working from the first vertex to the
    // last.  This gives the graph a natural flow.
    //
    let numEdges = Math.floor(Math.random() * (maxEdgesPerVertex - minEdgesPerVertex)) + minEdgesPerVertex;
    let alreadyConnected = [];
    let unconnected = true;
    
    for (let j = 0; j < numEdges; j++) {
      let candidateVertex = i + 2 + Math.floor(Math.random() * 4);
      if ((candidateVertex <= numVertices) && !(alreadyConnected.includes(candidateVertex))) {
        let newEdge = {};
        newEdge['from'] = i+1;
        newEdge['to'] = candidateVertex;
        let weight = Math.floor(Math.random() * (maxEdgeWeight - minEdgeWeight)) + minEdgeWeight;
        newEdge['label'] = weight.toString();
        edgeSource.push(newEdge);
        alreadyConnected.push(candidateVertex);
        unconnected = false;
      }
    }

    //
    // Deal with any unconnected vertices - force a connection to their neighbour
    //
    if (unconnected) {
      unconnectedVertices.push(i);
    }
  }

  for (let orphan of unconnectedVertices) {
    //
    // Is this really an orphan?  Check for incoming edges
    //
    let reallyAnOrphan = true;
    for (let sibling of edgeSource) {
      if (sibling['to'] == orphan+1) {
        reallyAnOrphan = false;
        break;
      }
    }

    if (!reallyAnOrphan) {
      continue;
    }
    
    let newEdge = {};
    newEdge['from'] = orphan+1;
    let weight = Math.floor(Math.random() * (maxEdgeWeight - minEdgeWeight)) + minEdgeWeight;
    newEdge['label'] = "Orphan";
    if (orphan == numVertices -1) {
      newEdge['to'] = orphan-2;
    } else {
      newEdge['to'] = orphan+2;
    }
    edgeSource.push(newEdge);
  }

  // Populate the edges array with edges
  edges = new vis.DataSet(edgeSource);

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
  adjacencyList = [];
  
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

function breadthFirstSearch()
{
  // Maintain a list of exploredVertices
  // Maintain a new list of verticesToExplore
  // Take the first entry from the adjacencyList, and place it in the verticesToExplore
  let exploredVertices = [];
  let verticesToExplore = [];
  
  let currentVertex = adjacencyList[0];
  verticesToExplore.push(currentVertex[0]);

  // As long as verticesToExplore.length > 0, keep going
  // Take the first item from vertices to explore, check whether it has already been explored, if so continue
  // If not, get the connections, and add them.
  while (verticesToExplore.length > 0) {
    console.log("exploredVertices:");
    console.log(exploredVertices);
    console.log("verticesToExplore:");
    console.log(verticesToExplore);
    let currentVertex = verticesToExplore.shift();
    if (exploredVertices.includes(currentVertex)) {
      continue;
    }
    exploredVertices.push(currentVertex);

    for (let adjacencyListEntry of adjacencyList) {
      if (adjacencyListEntry[0] == currentVertex) {
        let neighbours = Object.keys(adjacencyListEntry[1]);
        verticesToExplore = verticesToExplore.concat(neighbours);
        break;
      }
    }
  }
  return exploredVertices.length;
}


//
// These variables at global level to be used by results display
//
var distances = [];
var visitedVertices = [];
var tableUpdates = [];

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

  // For convenience of GUI only
  tableUpdates = [];
  
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

    var tableUpdate = {};
    
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
                tableUpdate[neighbour] = vertexDist[1];
              }
              else if (vertexDist[1] > neighbourCost + currentDistance) {
                oldCost = vertexDist[1];
                vertexDist[1] = neighbourCost + currentDistance;
                vertexDist[2] = [...route];
                vertexDist[2].push(currentVertex);
                console.log("Found a better route %s", vertexDist[2]);
                console.log("New cost: %d", vertexDist[1]);
                console.log("Old cost: %d", oldCost);
                tableUpdate[neighbour] = vertexDist[1];
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
    tableUpdates.push(tableUpdate);
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
    nodeList = nodes.get({fields: ['id', 'label', 'group']});
  
    for (let node of nodeList) {
      nodeId = node['id'];
      markNode(nodeId, 0);
    }
    step = 0;
  }

  //
  // Update the table with the next step
  //
  var displayString = "visitedVertices" + visitedVertices[step] + "   Table updates: " + JSON.stringify(tableUpdates[step]);
  document.getElementById("show-distances").innerHTML = displayString;
  markNode(mapNodeLabelToId(visitedVertices[step]), 1);

  addRow();
  
  if (step > 0) {
    markNode(mapNodeLabelToId(visitedVertices[step-1]), 2);
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

function copyRow()
{
  var tableRows = document.getElementById("dijkstra-table-body").rows;
  var numRows = tableRows.length;
  var rowCells = tableRows[numRows-1].cells;
  var numCells = rowCells.length;

  for (let i = 0; i < numCells; i++) {
    alert(rowCells[i].innerText);
  }
}

function addRow()
{
  //
  // Grab the content of the last row in the table
  //
  var tableRows = document.getElementById("dijkstra-table-body").rows;
  var numRows = tableRows.length;
  var rowCells = tableRows[numRows-1].cells;

  //
  // Get the table updates for this pass
  //
  var rowUpdates = tableUpdates[step];
  //
  // Now create the new row
  //
  var x = document.createElement("tr");

  //
  // Step 0 is the initialisation phase for the table
  // so we need to add one to the actual step for display
  // purposes...
  //

  //  Cell 0 - Pass
  var a = document.createElement("th");
  var anode = document.createTextNode(step+1);
  var attr = document.createAttribute("scope");
  attr.value = "row";
  a.setAttributeNode(attr);
  a.appendChild(anode);
  x.appendChild(a);

  // Cell 1 - Current Vertex
  var b = document.createElement("td");
  var bnode = document.createTextNode(visitedVertices[step]);
  b.appendChild(bnode);
  x.appendChild(b);

  //
  // Cells 2 to end - distances
  // Default to contents of previous row, but check for updates
  //
  for (let i = 0; i < 8; i++) {
    b = document.createElement("td");
    var newText = rowCells[i+2].innerText;

    for (const property in rowUpdates) {
      var vertexLabel = property;
      var vertexId = mapNodeLabelToId(vertexLabel);
      if (vertexId == i+1) {
        newText = rowUpdates[property];
      }
    }
    bnode = document.createTextNode(newText);
    b.appendChild(bnode);
    x.appendChild(b);
  }
  document.getElementById("dijkstra-table-body").appendChild(x);
}



//
// Respond to file load
//
function handleFile() {
  let newData=[];

  let codeReader = new FileReader();

  codeReader.onload = function(event) {
    let obj = {};

    // 
    // Attempt to parse the selected file as JSON
    //
    try {
      obj = JSON.parse(event.target.result);
    } catch (error) {
      console.log(error);
      alert("Hmmm.  That file does not appear to contain a graph definition...");
      return;
    }

    //
    // Now we have a JSON object containing the adjacency list
    //
    let nodeSource = [];
    let edgeSource = [];
    let nodeId = 1;

    //
    // This has to be a 2 pass operation, as the edges refer to nodeIds,
    // rather than labels, so we need to build the list of nodes first in
    // nodeSource, then we can do the label-to-Id mapping when we create
    // the edges.
    //
    for (let node of obj) {
      let newNode = {};
      newNode['id'] = nodeId;
      newNode['label'] = node[0];
      newNode['group'] = 0;
      nodeSource.push(newNode);
      nodeId++;
    }

    for (let node of obj) {
      let neighbours = Object.keys(node[1]);

      for (let neighbour of neighbours) {
        let newEdge = {};
        //
        // Look up the the current node label and map to nodeId
        //
        let nodeId = 0;
        for (let n of nodeSource) {
          if (n['label'] == node[0]) {
            nodeId = n['id'];
          }
        }
        newEdge['from'] = nodeId;
        
        //
        // Look up the neighbour label and map to nodeId
        //
        let neighbourId = 0;
        for (let n of nodeSource) {
          if (n['label'] == neighbour) {
            neighbourId = n['id'];
          }
        }
        newEdge['to'] = neighbourId;
        newEdge['label'] = node[1][neighbour].toString();
        edgeSource.push(newEdge);
      }
    }
  
    // Populate the nodes array with nodes
    nodes = new vis.DataSet(nodeSource);
    
    // Populate the edges array with edges
    edges = new vis.DataSet(edgeSource);
  
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
  
    // Finally, we need to change the value of the load button here, so that we can reload 
    // the same file BUT we don't want to refire the change event!
    //
    document.getElementById("load-btn").removeEventListener('change', handleFile, false);
    document.getElementById("load-btn").value = null;
    document.getElementById("load-btn").addEventListener('change', handleFile, false);
  }

  codeReader.readAsText(this.files[0]);
}

//
// Setup - called on body load...
//
function setupDemonstrator() {
  //
  // Set up file handler
  //
  document.getElementById("load-btn").addEventListener('change', handleFile, false);
}
