//
// JavaScript code for the Dijkstra's Algorithm Demonstrator
//
function generateGraph()
{
  // create an array with nodes
  var nodes = new vis.DataSet([
    { id: 1, label: " A " },
    { id: 2, label: " B " },
    { id: 3, label: " C " },
    { id: 4, label: " D " },
    { id: 5, label: " E " },
    { id: 6, label: " F " },
    { id: 7, label: " G " },
    { id: 8, label: " H " },
  ]);

  // create an array with edges
  var edges = new vis.DataSet([
    { from: 1, to: 2, label: "8" },
    { from: 1, to: 3, label: "5" },
    { from: 2, to: 4, label: "14" },
    { from: 2, to: 5, label: "3" },
    { from: 3, to: 5, label: "10" },
    { from: 4, to: 5, label: "3" },
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

  var network = new vis.Network(container, data, options);
}
