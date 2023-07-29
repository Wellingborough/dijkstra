//
// JavaScript code for the Dijkstra's Algorithm Demonstrator
//
var nodes, edges, network;

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
}

function markNodeVisited()
{
  thisId = document.getElementById("visited-node-id").value;
  thisNode = nodes.get(parseInt(thisId));
  thisNode['group'] = 1
  nodes.update(thisNode);
  buildAdjacencyList();
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
  nodeList = nodes.get({fields: ['id', 'label', 'group']});
  edgeList = edges.get({fields: ['from', 'to', 'label']});

  for (let node of nodeList) {
    newEntry = [];
    nodeLabel = node['label'];

    let adjacencies = {}
    for (let edge of edgeList) {
      if (edge['from'] == node['id']) {
        adjacencies[edge['to']] = edge['label'];
      }

      if (edge['to'] == node['id']) {
        adjacencies[edge['from']] = edge['label'];
      }
    }

    newEntry.append(nodeLabel);
    newEntry.append(adjacencies);
    adjacencyList.append(newEntry)
  }
  console.log(adjacencyList);
}

function solveDijkstra()
{
  ;
}
