var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var slider = document.getElementById("myRange");
let currentAlgorithm;

slider.oninput = function() {

  //Clear previous graph and table
  currentAlgorithm = undefined;
  cy.$().removeClass('highlighted highlightedOrange highlightedRed');
  cy.$().unselect();
  
  let table = document.getElementById("table");
  table.innerHTML = '';

  var oldNodes = cy.nodes();
  cy.remove(oldNodes);
  
  const newElements = [];

  //creates n nodes where n=slider value (for simplicty nodes are labelled as 0 to n-1)
  for (let i = 0; i < this.value; i++) {
    newElements.push(
        { 
          group: 'nodes',
          data: { id: i.toString() }
        }
      );
  }

  var nodesCount = parseInt(this.value);
  
  //range of edges for simple connted graph
  var max = nodesCount*(nodesCount-1)/2;
  var min = nodesCount - 1;
  var numEdges = Math.floor(Math.random() * (max - min + 1) + min); //picks random number of edges in possible range

  //Generate required number of edges
  for(let j = 0; j < numEdges; j++){
    var source = Math.floor(Math.random() * nodesCount);
    var target = source;
    while(target === source){
      source = Math.floor(Math.random() * nodesCount);
      target = Math.floor(Math.random() * nodesCount);
    }

    //Edges given id with convention: 'srcId'+'destId' where srcId = smallest id of edge nodes
    var srcString = source.toString();
    var destString = target.toString();
    var edgeID;
    if(source > target){
      edgeID = srcString + destString;
    }
    else{
      edgeID = destString + srcString;
    }
    
    var myWeight = Math.floor(Math.random() * (100 - 1 + 1) + 1);
    newElements.push(
      { group: 'edges', data: {id:edgeID, source: srcString, target: destString,weight: myWeight},selectable: false }
    );
  }

  cy.add(newElements);
  
  var layout = cy.layout({
    name: 'cose'
  });
  
  layout.run();//rerun graph as new nodes


  /*Ensures we get a connected graph by joining random nodes from connected components together*/
  const connectedGraph = [];
  var cc = cy.$().components();
  
  if(cc.length > 1){
    var newCC = [];
  for (var i = 0; i < cc.length; i++) {
    var aCC = [];
    for(var j=0;j<cc[i].length; j++){
      if(cc[i][j].isNode()){
        aCC.push(cc[i][j]);
      }
    }
    newCC.push(aCC);
  }

  //generate edges between connected components
  for (var i = 0; i < cc.length-1; i++) {

    var len1 = newCC[i].length;
    var len2 = newCC[i+1].length;

    source = Math.floor(Math.random() * len1);
    target = Math.floor(Math.random() * len2);


      var src = newCC[i][source].id();
      var dest = newCC[i+1][target].id();

      var edgeID;
      if(parseInt(src) > parseInt(dest)){
        edgeID = src + dest;
      }
      else{
        edgeID = dest + src;
      }
      
      var myWeight = Math.floor(Math.random() * (100 - 1 + 1) + 1);
      connectedGraph.push(
        { group: 'edges', data: {id:edgeID, source: src, target: dest,weight: myWeight},selectable: false }
      );
  }
    cy.add(connectedGraph);
  
    var layout = cy.layout({
      name: 'cose'
    });
    
    layout.run();
  }
}

/**
 * Function runs approarpite algorithm to users choice
 * 
 * @param  items algortihm type and source node
 * @returns promise of running approparite algorithm
 */
let getAlgorithm = (items) => {
  var name = items.alg;
  var src = items.src;

  let table = document.getElementById("table");
  table.innerHTML = '';

  switch (name) {
    case 'bfs': return Promise.resolve(BFS(src));
    case 'dfs': return Promise.resolve(DFS(src));
    case 'kruskal': return Promise.resolve(kruskalsMST());
    case 'prim': return Promise.resolve(primsMST(src));
    case 'djikstra': return Promise.resolve(dijkstra(src));
    case 'bellFord': return Promise.resolve(bellmanFord(src));
    default: return Promise.resolve(undefined);
  }
}

let animateAlgorithm = (algResults) => {
  // clear old algorithm results
  cy.$().removeClass('highlighted highlightedOrange highlightedRed');
  cy.$().unselect();

  currentAlgorithm = algResults;
  if (algResults === undefined) {
    return Promise.resolve();
  }
  else {
    let i = 0;
    
    return new Promise(resolve => {
      let highlightNext = () => {
        if (currentAlgorithm === algResults && i < algResults.length) {
          if(algResults[i].func === 'orange'){
            cy.$('#' + algResults[i].data.toString()).removeClass('highlightedRed highlighted');
            cy.$('#' + algResults[i].data.toString()).addClass('highlightedOrange');
            
          }
          else if(algResults[i].func === 'red'){
            cy.$('#' + algResults[i].data.toString()).removeClass('highlightedOrange highlighted');
            cy.$('#' + algResults[i].data.toString()).addClass('highlightedRed');
          }
          else if(algResults[i].func === 'blue'){
            cy.$('#' + algResults[i].data.toString()).removeClass('highlightedOrange highlightedRed');
            cy.$('#' + algResults[i].data.toString()).addClass('highlighted');
            
          }
          else if(algResults[i].func === 'blank'){
            cy.$('#' + algResults[i].data.toString()).removeClass('highlightedOrange highlightedRed highlighted');
            
          }
          else if(algResults[i].func === 'table'){
            let data = algResults[i].data;
            let table = document.getElementById("table");
            let nodeID = parseInt(data.neighbour) + 1;

            table.rows[nodeID].cells[1].innerHTML = '<tr>'+data.dist+'</tr>';
            table.rows[nodeID].cells[2].innerHTML = '<tr>'+data.vertex+'</tr>';
            
          }
          else if(algResults[i].func === 'tableOrange'){
            let data = algResults[i].data;
            let table = document.getElementById("table");
            let nodeID = parseInt(data) + 1;

            table.rows[nodeID].cells[1].style.backgroundColor = "orange"; 
            
          }
          else if(algResults[i].func === 'tableBlank'){
            let data = algResults[i].data;
            let table = document.getElementById("table");
            let nodeID = parseInt(data) + 1;

            table.rows[nodeID].cells[1].style.backgroundColor = "white";   
          }
          else if(algResults[i].func === 'tableBlue'){
            let data = algResults[i].data;
            let table = document.getElementById("table");
            let nodeID = parseInt(data) + 1;

            table.rows[nodeID].cells[0].style.backgroundColor = "#AAD8FF";
            table.rows[nodeID].cells[1].style.backgroundColor = "#AAD8FF";  
            table.rows[nodeID].cells[2].style.backgroundColor = "#AAD8FF";     
          }
          else if(algResults[i].func === 'fordRow'){
            var html = $('#table tr:last').html();
            $('#table tr:last').after("<tr>" + html + "</tr>");
          } 
          else if(algResults[i].func === 'fordUpdate'){
            let data = algResults[i].data;
            let table = document.getElementById("table");

            let nodeID = parseInt(data.src);
            table.rows[table.rows.length - 1].cells[nodeID].innerHTML = '<tr>'+data.dist+'</tr>';
          }
          else if(algResults[i].func === 'tableFordOrange'){
            let data = algResults[i].data;
            let table = document.getElementById("table");

            let nodeID = parseInt(data);
            table.rows[table.rows.length - 1].cells[nodeID].style.backgroundColor = "orange"; 
            
          }
          else if(algResults[i].func === 'tableFordBlank'){
            let data = algResults[i].data;
            let table = document.getElementById("table");

            let nodeID = parseInt(data);
            table.rows[table.rows.length - 1].cells[nodeID].style.backgroundColor = "white";   
          }
          i++;
          setTimeout(highlightNext, 1000);
        } else {
          // resolve when finished or when a new algorithm has started visualization
          resolve();
        }
      }
      highlightNext();
    });
  }
};

const runAlg = document.querySelector('#runAlg');
const algorithm = document.querySelector('#algorithm');

/**
 * When uesrs clicks run button this function follows the step of running and animating the alogrithm selected
 * 
 * @param event the event of user clicking button associated with runAlg variable
 */
runAlg.onclick = (event) => {
  event.preventDefault();

  var selectedNodes = cy.nodes(':selected');
  var src = '0';
  if(selectedNodes.length !== 0){
    src = selectedNodes[0].id();
  }

  var items = {};
  items.alg = algorithm.value;
  items.src = src;
  Promise.resolve(items).then(getAlgorithm).then(animateAlgorithm); 
};

const resetGraph = document.querySelector('#resetGraph');

/**
 * Reset graph and table when user clicks reset button
 * @param event varaible asscoited with the reset button
 */
resetGraph.onclick = (event) => {
  event.preventDefault();
  currentAlgorithm = undefined;
  cy.$().removeClass('highlighted highlightedOrange highlightedRed');
  cy.$().unselect();
  let table = document.getElementById("table");
  table.innerHTML = '';
};

var cy = cytoscape({

  container: document.getElementById('cy'), // container to render in

  elements: [ // list of graph elements to start with
    { 
      data: { id: '0' }
    },
    { 
      data: { id: '1' }
    },
    { 
      data: { id: '2' }
    },
    { 
      data: { id: '3' }
    },
    { 
      data: { id: '4' }
    },
    { 
      data: { id: '40', source: '4', target: '0', weight:'6' },
      selectable: false
    },
    { 
      data: { id: '20', source: '0', target: '2', weight:'91' },
      selectable: false
    },
    { 
      data: { id: '41', source: '1', target: '4',weight:'3'},
      selectable: false
    },
    { 
      data: { id: '43', source: '3', target: '4',weight:'22'},
      selectable: false
    },
    { 
      data: { id: '32', source: '2', target: '3',weight:'17'},
      selectable: false
    }
  ],

  style: [
    //  the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'text-wrap': 'wrap',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-max-width': '100px',
        'label': 'data(id)',
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'curve-style': 'bezier',
        'label': 'data(weight)'
      }
    },
    {
      "selector": "node.unhighlighted",
      "style": {
        "opacity": "0.2"
      }
    },
    {
      "selector": "edge.unhighlighted",
      "style": {
        "opacity": "0.05"
      }
    },
    {
      "selector": ".highlighted",
      "style": {
        "z-index": "999999",
        "transition-duration": "0.5s"
      }
    },
    {
      "selector": "node.highlighted",
      "style": {
        "border-width": "8px",
        "border-color": "#AAD8FF",
        "border-opacity": "0.85",
        "background-color": "#394855",
        "text-outline-color": "#394855",
        "transition-property": "border-width, border-color, border-opacity, background-color, text-outline-color"
      }
    },
    {
      "selector": "edge.highlighted",
      "style": {
        "line-color": "#AAD8FF",
        "width": "10px"
      }
    },
    {
      "selector": ".highlightedRed",
      "style": {
        "z-index": "999999",
        "transition-duration": "0.5s"
      }
    },
    {
      "selector": "edge.highlightedRed",
      "style": {
        "line-color": "red",
        "width": "10px"
      }
    },
    {
      "selector": "node.highlightedRed",
      "style": {
        "border-width": "8px",
        "border-color": "red",
        "border-opacity": "0.85",
        "background-color": "red",
        "text-outline-color": "#394855",
        "transition-property": "border-width, border-color, border-opacity, background-color, text-outline-color"
      }
    },
    {
      "selector": ".highlightedOrange",
      "style": {
        "z-index": "999999",
        "transition-duration": "0.5s"
      }
    },
    {
      "selector": "edge.highlightedOrange",
      "style": {
        "line-color": "orange",
        "width": "10px"
      }
    },
    {
      "selector": "node.highlightedOrange",
      "style": {
        "border-width": "8px",
        "border-color": "orange",
        "border-opacity": "0.85",
        "background-color": "orange",
        "text-outline-color": "#394855",
        "transition-property": "border-width, border-color, border-opacity, background-color, text-outline-color"
      }
    }

  ],

  layout: {
    name: 'cose',
  }

});


class QueueNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }

  //newnode goes to back of the line/end of the queue
  enqueue(value) {
    const newNode = new QueueNode(value);
    //if queue is empty
    if (this.size === 0) {
      this.first = newNode;
      this.last = newNode;
      // add current first pointer to new first(new node), and make new node new first
    } else {
      this.last.next = newNode;
      this.last = newNode;
    }
    //add 1 to size
    this.size++;

    return this;
  }
  // dequeue nodes off the front of the line
  dequeue() {
    //if queue is empty return false
    if (this.size === 0) return false;
    //get dequeuedNode
    const dequeuedNode = this.first;
    //get new first (could be NULL if stack is length 1)
    const newFirst = this.first.next;
    //if newFirst is null, reassign last to newFirst(null)
    if (!newFirst) {
      this.last = newFirst;
    }
    //assign new first
    this.first = newFirst;
    //remove refernce to list
    dequeuedNode.next = null;
    //remove 1 from size
    this.size--;
    //return dequeuednode
    return dequeuedNode;
  }
}

/**
 * Function to genreate an edge ID based on src and dest nodes
 * 
 * @param  node1 one endpoint of edge
 * @param {*} node2 second endpoint of edge
 * @returns id of edge
 */
function makeEdgeID(node1, node2){
  if(parseInt(node1) > parseInt(node2)){
    edgeID =node1.toString() + node2.toString();
  }
  else{
    edgeID =node2.toString() + node1.toString()
  }

  return edgeID;
}

/**
 * Genereates data strucutre for 1 step of the animation of the graph
 * 
 * @param {*} data data needed for an animation function 
 * @param {*} aniFunc the animation function for this data
 * @returns data strucutre for animation
 */
function makeStepElement(data,aniFunc){
  // var pathItem = [];
  // pathItem.push(data);
  // pathItem.push(aniFunc);
  var pathItem = {};
  pathItem.data = data;
  pathItem.func = aniFunc;
  return pathItem;
  
}

function BFS(src) {
    //start a new Queue
  const queue = new Queue();
  const allNodes = cy.nodes();

  visited = new Array(allNodes.length).fill(false);
  visited[parseInt(src)] = true;

  var path = [];//path for animation
  
  queue.enqueue(src);
  var rootNode =true;
  while (queue.size !== 0) {
    var queueVal = queue.first.value;

    var queueItem = queueVal.split("="); //data format in queue: 'nodeID=srcEdgeID'
    var root = queueItem[0];
    var edge = queueItem[1];
    var rootID = '#' + root.toString();

    var myNodes = cy.$(rootID).neighborhood("node[id >= 0]");//gets nodes connected to root

    for(let i = 0; i < myNodes.length; i++){
      var nodeID = myNodes[i].id();
      if (!visited[nodeID]){
        visited[nodeID] = true;
        var edgeID = makeEdgeID(nodeID,root);
        var queueData = nodeID.toString() + '=' + edgeID; //stores next node for BFS and edge it came from
        queue.enqueue(queueData);
      }
    }

    //root didn't come from any edge so don't color parent edge
    if(rootNode !== true){
      path.push(makeStepElement(edge,'blue'));
    }
   
    path.push(makeStepElement(root,'blue'));
    
    rootNode=false;
    queue.dequeue();
  }
  return path;
}

function DFSUtil(v, visited,path)
    {
          
        // Mark the current node as visited
        visited[v] = true;
        path.push(makeStepElement(v,'blue'));
        // Recur for all the vertices adjacent to this vertex
        var rootID = '#' + v.toString();

        var myNodes = cy.$(rootID).neighborhood("node[id >= 0]");

        for(let i = 0; i < myNodes.length; i++){
          var nodeID = myNodes[i].id();
          if (!visited[nodeID]){
            var edgeID = makeEdgeID(nodeID,v);
            path.push(makeStepElement(edgeID,'blue'));

            this.DFSUtil(parseInt(nodeID), visited,path);
          }
        }

    }

function DFS(src)
    {

        const allNodes = cy.nodes();
        var visited = new Array(allNodes.length).fill(false);
        var v = parseInt(src);

        var path = new Array();
        this.DFSUtil(v, visited,path);
        return path;
    }


class UnionFind {
  constructor(elements) {
    // Number of disconnected components
    this.count = elements.length;

    // Keep Track of connected components
    this.parent = {};

    // Initialize the data structure such that all
    // elements have themselves as parents
    elements.forEach(e => (this.parent[e] = e));
  }

  union(a, b) {
    let rootA = this.find(a);
    let rootB = this.find(b);

    // Roots are same so these are already connected.
    if (rootA === rootB) return;

    // Always make the element with smaller root the parent.
    if (rootA < rootB) {
      if (this.parent[b] != b) this.union(this.parent[b], a);
      this.parent[b] = this.parent[a];
    } else {
      if (this.parent[a] != a) this.union(this.parent[a], b);
      this.parent[a] = this.parent[b];
    }
  }

  // Returns final parent of a node
  find(a) {
    while (this.parent[a] !== a) {
      a = this.parent[a];
    }
    return a;
  }

  // Checks connectivity of the 2 nodes
  connected(a, b) {
    return this.find(a) === this.find(b);
  }
}

class PriorityQueue {
  constructor(maxSize) {
     // Set default max size if not provided
     if (isNaN(maxSize)) {
        maxSize = 10;
      }
     this.maxSize = maxSize;
     // Init an array that'll contain the queue values.
     this.container = [];
  }
  // Helper function to display all values while developing
  display() {
     console.log(this.container);
  }
  // Checks if queue is empty
  isEmpty() {
     return this.container.length === 0;
  }
  // checks if queue is full
  isFull() {
     return this.container.length >= this.maxSize;
  }
  enqueue(data, priority) {
     // Check if Queue is full
     if (this.isFull()) {
        return;
     }
     let currElem = new this.Element(data, priority);
     let addedFlag = false;
     // Since we want to add elements to end, we'll just push them.
     for (let i = 0; i < this.container.length; i++) {
        if (currElem.priority > this.container[i].priority) {
           this.container.splice(i, 0, currElem);
           addedFlag = true; break;
        }
     }
     if (!addedFlag) {
        this.container.push(currElem);
     }
  }
  dequeue() {
  // Check if empty
  if (this.isEmpty()) {
     return;
  }
  return this.container.pop();
}
peek() {
  if (isEmpty()) {
     return;
  }
  return this.container[this.container.length - 1];
}
clear() {
  this.container = [];
  }

}
// Create an inner class that we'll use to create new nodes in the queue
// Each element has some data and a priority
PriorityQueue.prototype.Element = class {
  constructor(data, priority) {
     this.data = data;
     this.priority = priority;
  }
};

function kruskalsMST() {
  // Initialize graph that'll contain the MST
  //const MST = new Graph();
  const MST = [];

  const allNodes = cy.nodes();
  var listOfNodes = [];
  for(let i=0;i<allNodes.length;i++){
    listOfNodes.push(i);
  }

  // // Create a Priority Queue
  edgeQueue = new PriorityQueue(listOfNodes.length * listOfNodes.length);

  const alledges = cy.edges();
  for(let j=0;j<alledges.length;j++){
    
    var src = alledges[j].data('source');
    var target = alledges[j].data('target');
    var edgeID = alledges[j].id();
    var edge = [];
    edge.push(src);
    edge.push(target);
    edge.push(edgeID);
    var weight = parseInt(alledges[j].data('weight'));
    edgeQueue.enqueue(edge, weight);
  }

  let uf = new UnionFind(listOfNodes);

  // // // Loop until either we explore all nodes or queue is empty
  var edgesCount =0;
  while (!edgeQueue.isEmpty() && edgesCount !== allNodes.length - 1) {
     // Get the edge data using destructuring
    let nextEdge = edgeQueue.dequeue();
    let edgeData = nextEdge.data;
    let src = edgeData[0];
    let dest = edgeData[1];
    let edgeID = edgeData[2];

    MST.push(makeStepElement(edgeID,'orange'));

     if (!uf.connected(src, dest)) {      
      MST.push(makeStepElement(edgeID,'blue'));
      uf.union(src, dest);
      edgesCount += 1;
     }
     else{
      MST.push(makeStepElement(edgeID,'red'));
     }
  }
  return MST;
}

function primsMST(userSrc) {
  // Initialize graph that'll contain the MST
  const MST = [];

  // Select first node as starting node
  let s = userSrc;

  const allNodes = cy.nodes();

  visited = [];
  for(let i=0;i<allNodes.length;i++){
    visited[i] = false;
  }
  const edgesMap = new Map();
  const myEdges = cy.edges();
  for(let i=0;i<myEdges.length;i++){
    edgesMap.set(myEdges[i].id(), false);
  }
  // Create a Priority Queue and explored set
  edgeQueue = new PriorityQueue(allNodes.length * allNodes.length);

  let explored = new Set();
  explored.add(s);

  visited[parseInt(s)] = true;
  MST.push(makeStepElement(s,'blue'));

  var rootID = '#' + s;
  const alledges =cy.$(rootID).neighborhood("edge[source >= 0]");
  for(let j=0;j<alledges.length;j++){
    var src = alledges[j].data('source');
    var target = alledges[j].data('target');
    if(target === s){
      var temp = src;
      src = target;
      target = temp;
    }
    var edgeID = alledges[j].id();
    var edge = [];
    edge.push(src);
    edge.push(target);
    edge.push(edgeID);
    var weight = parseInt(alledges[j].data('weight'));
    edgeQueue.enqueue(edge, weight);

    MST.push(makeStepElement(edgeID,'orange'));

    if(visited[parseInt(target)] === false){
      visited[parseInt(target)] = true;
      MST.push(makeStepElement(target,'orange'));
    }
    if(edgesMap.get(edgeID) === true){
      MST.push(makeStepElement(edgeID,'blue'));
    }
    else{
      MST.push(makeStepElement(edgeID,'blank'));
    }
  }

  // // Take the smallest edge and add that to the new graph
  let currentMinEdge;

  var edgesCount =0;
  while (!edgeQueue.isEmpty() && edgesCount !== allNodes.length -1) {
    currentMinEdge = edgeQueue.dequeue();

     // Continue removing edges till we get an edge with an unexplored node
     while (!edgeQueue.isEmpty() && explored.has(currentMinEdge.data[1])) {
        currentMinEdge = edgeQueue.dequeue();
     }
     let nextNode = currentMinEdge.data[1];


     // Check again as queue might get empty without giving back unexplored element
     if (!explored.has(nextNode)) {
        edgesMap.set(currentMinEdge.data[2],true);
        edgesCount += 1;
        MST.push(makeStepElement(currentMinEdge.data[2],'blue'));

        MST.push(makeStepElement(nextNode,'blue'));
        visited[parseInt(nextNode)] = true;
        
        // Again add all edges to the PQ
        var myRoot = '#' + nextNode;
        const newEdges =cy.$(myRoot).neighborhood("edge[source >= 0]");

        for(let j=0;j<newEdges.length;j++){
          
          var src = newEdges[j].data('source');
          var target = newEdges[j].data('target');
          if(target === nextNode){
            var temp = src;
            src = target;
            target = temp;
          }
          var edgeID = newEdges[j].id();
          var edge = [];
          edge.push(src);
          edge.push(target);
          edge.push(edgeID);
          var weight = parseInt(newEdges[j].data('weight'));
          edgeQueue.enqueue(edge, weight);

          MST.push(makeStepElement(edgeID,'orange'));

          if(visited[parseInt(target)] === false){
            visited[parseInt(target)] = true;
 
            MST.push(makeStepElement(target,'orange'));
          }
          if(edgesMap.get(edgeID) === true){
            MST.push(makeStepElement(edgeID,'blue'));
          }
          else{
            MST.push(makeStepElement(edgeID,'blank'));
          }
          
        }
        // Mark this node as explored explored.add(nextNode);
        s = nextNode;
        explored.add(nextNode);
     }
  }
  return MST;
}

function  vertexWithMinDistance(distances, visited) {
  let minDistance = Infinity,
      minVertex = null;
  for (let vertex in distances) {
      let distance = distances[vertex];
      if (distance < minDistance && !visited.has(vertex)) {
          minDistance = distance;
          minVertex = vertex;
      }
  }
  return minVertex;
}

function dijkstra(source) {

  let nodeTable = [];

  const path = [];
  let distances = {},
      parents = {},
      visited = new Set();
      const allNodes = cy.nodes();
  for (let i = 0; i < allNodes.length; i++) {
      if (allNodes[i].id() === source) {
          distances[source] = 0;
      } else {
          distances[i] = Infinity;
      }
      parents[i] = null;
      let nodeData = {nodeID:i,dist: distances[i], parent:parents[i]};
      nodeTable.push(nodeData);
  }

  generateTable(table, nodeTable);
  let tableHeaders = ["Node ID","Distance from src", "Previous Vertex"];
  generateTableHead(table,tableHeaders);

  let currVertex = vertexWithMinDistance(distances, visited);  
  
  while (currVertex !== null) {

    path.push(makeStepElement(currVertex,'orange'));

    let distance = distances[currVertex];
    let nodeId = '#' + currVertex;
    let neighbors = cy.$(nodeId).neighborhood("node[id >= 0]");
    for (let i=0;i<neighbors.length;i++) {
      let neighbour = neighbors[i].id();
      let edgeID;
      if(neighbour > currVertex){
        edgeID = neighbour + currVertex;
      }
      else{
        edgeID = currVertex + neighbour;
      }

      path.push(makeStepElement(edgeID,'orange'));

      let newDistance = parseInt(distance) + parseInt(cy.$('#' +edgeID).data('weight'));      

        if (distances[neighbour] > newDistance) {
            distances[neighbour] = newDistance;
            parents[neighbour] = currVertex;
            // let data =[];
            // data.push(neighbour);
            // data.push(newDistance);
            // data.push(currVertex);
            let data ={};
            data.neighbour = neighbour;
            data.dist = newDistance;
            data.vertex = currVertex;

            path.push(makeStepElement(neighbour,'tableOrange'));
            path.push(makeStepElement(data,'table'));
            path.push(makeStepElement(neighbour,'tableBlank'));
        }
        
        path.push(makeStepElement(edgeID,'blank'));
    }

    path.push(makeStepElement(currVertex,'blue'));
    path.push(makeStepElement(currVertex,'tableBlue'));

    visited.add(currVertex);
    currVertex = vertexWithMinDistance(distances, visited);
}

  return path;
}

function bellmanFord(source) {
  const path = [];
  let nodeTable = [];

  let distances = {};
  let parents = {};

  const allNodes = cy.nodes();
  const allEdges = cy.edges();

  let tableItm = {};
  for (let i = 0; i < allNodes.length; i++) {
    let myKey = 'node' + i;
    if (allNodes[i].id() === source) {
        distances[source] = 0;
        tableItm[myKey] = 0;
    } else {
        distances[i] = Infinity;
        tableItm[myKey] = Infinity;
    }
    parents[i] = null;
    
  }

  nodeTable = [];
  nodeTable.push(tableItm);
  generateTable(table, nodeTable);
  let tableHeaders = [];
  for (let i = 0; i < allNodes.length; i++) {
    tableHeaders.push(i);
  }
  generateTableHead(table,tableHeaders);

  for (let i = 0; i < allNodes.length; i++) {
    let distChanges = 0;

    let data =null;
    path.push(makeStepElement(data,'fordRow'));

    for (let u=0;u<allEdges.length;u++) {

      let edgeWeight = parseInt(allEdges[u].data('weight'));
      let src = allEdges[u].data('source');
      let dest = allEdges[u].data('target');
      path.push(makeStepElement(allEdges[u].id(),'orange'));

      let tempDist = distances[dest] + edgeWeight;
      if(tempDist < distances[src]){
        distances[src] = tempDist;

        let data ={};
        data.dist = tempDist;
        data.src = src;

        path.push(makeStepElement(src,'tableFordOrange'));
        path.push(makeStepElement(data,'fordUpdate'));
        path.push(makeStepElement(src,'tableFordBlank'));
        
        distChanges++;
      }

      tempDist = distances[src] + edgeWeight;
      if(tempDist < distances[dest]){
        distances[dest] = tempDist;

        let data ={};
        data.dist = tempDist;
        data.src = dest;

        path.push(makeStepElement(dest,'tableFordOrange'));
        path.push(makeStepElement(data,'fordUpdate'));
        path.push(makeStepElement(dest,'tableFordBlank'));
        distChanges++;
      }
      path.push(makeStepElement(allEdges[u].id(),'blank'));
    }
    if(distChanges === 0){
      break;
    }
  }
  return path;

}

function generateTableHead(table, data) {
  let thead = table.createTHead();
  let row = thead.insertRow();

  for (let item of data) {
    let th = document.createElement("th");
    let text = document.createTextNode(item);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}



