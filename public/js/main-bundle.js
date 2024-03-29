(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function validateVectorString(vectorString) {
  // console.log(vectorString)
  var base10Array = vectorStringToBase10Array(vectorString);
  var base2Array = base10ArrayToBase2Array(base10Array, 0);
  // console.log('base2Array', base2Array)
  //  each vector still in reverse order and still a string base 2
  var vectors = base2Array.map(function (vectorString) {
    var inGraphOrderArray = vectorString.split('').reverse();
    inGraphOrderArray.unshift('0');
    return inGraphOrderArray.join('');
  });
  // console.log('vectors', vectors) // example  [ "01100", "00001", "01100", "00001", "01100", "00001", "01100", "00001", "01100", "00001", … ]
  var resultsArray = [];
  for (var j = 0; j < vectors.length; j++) {
    // j is the "row" or number of vector
    var count = 0;
    // console.log('j', j)
    for (var i = 0; i < vectors[j].length; i++) {
      if (vectors[j][i] === '1') count++;
      // console.log('rightwardVectorIndes',j,i)
      var leftwardVectorIndex = (vectors.length + j - i) % vectors.length;
      // console.log('leftwardVectorIndeces', leftwardVector, i)
      if (vectors[leftwardVectorIndex][i] === '1') count++;
    }
    resultsArray.push(count === 3);
  }
  // console.log('resultsArray', resultsArray)
  return resultsArray;
}
exports.validateVectorString = validateVectorString;
function makeSparseMatrix(vectorString) {
  var base10Array = vectorStringToBase10Array(vectorString);
  var base2Array = base10ArrayToBase2Array(base10Array, 0);
  // console.log('base2Array', base2Array)
  //  each vector still in reverse order and still a string base 2
  var vectors = base2Array.map(function (vectorString) {
    var inGraphOrderArray = vectorString.split('').reverse();
    inGraphOrderArray.unshift('0');
    return inGraphOrderArray.join('');
  });

  // console.log('vectors in makeSparseMatrix', vectors)
  var sparseMatrix = [];
  for (var m = 0; m < vectors.length; m++) {
    // make l x l matrix
    var row = new Array(vectors.length).fill('0'); // recursive fills leaves behind pointers apparently!
    sparseMatrix.push(row);
  }
  // console.log('sparseMatrix', sparseMatrix)
  for (var j = 0; j < vectors.length; j++) {
    // j is the "row" or number of vector
    for (var i = 0; i < vectors[j].length; i++) {
      // i is the index of the vector, with origin
      if (vectors[j][i] === '1') {
        // this is a 'dot' on the interactive view, regarding element j
        var rightwardVectorIndex = (j + i) % vectors.length;
        // console.log('(j, rightwardVectorIndex)', j, rightwardVectorIndex)
        sparseMatrix[j][rightwardVectorIndex] = '1';
        sparseMatrix[rightwardVectorIndex][j] = '1';
      }
    }
  }
  // console.log('sparseMatrix', sparseMatrix)
  return sparseMatrix;
}
exports.makeSparseMatrix = makeSparseMatrix;

// function findAdjascentElements (matrix, j) {
//   const results = []
//   for (let i = 0; i < matrix[j].length; i ++) {
//     if (matrix [j][i] === '1') results.push(i)
//   }
//   return results
// }

// exports.findAdjascentElements = findAdjascentElements

function vectorStringToBase10Array(nums) {
  if (typeof nums !== 'string') {
    console.log('array of input numbers should be a string');
    return;
  }
  var b10Array = [];
  nums.split(',').forEach(function (num) {
    try {
      var b10num = parseInt(num, 10);
      // console.log(b10num)
      if (isNaN(b10num)) throw new Error('not a number=' + num);
      b10Array.push(b10num);
    } catch (e) {
      console.error(e);
    }
  });
  // console.log('b10Array', b10Array)
  return b10Array;
}
exports.vectorStringToBase10Array = vectorStringToBase10Array;
function createRelationsObjectFromSparseMatrix(matrix) {
  /*
   { 0 : {
           1 : true,
           4: true,
           5: true
         },
     1: {
           0: true,
           7: true,
           9:true
         }
     ...
   }
   */
  var relations = {};
  for (var j = 0; j < matrix.length; j++) {
    for (var i = 0; i < matrix[j].length; i++) {
      if (matrix[j][i] === '1') {
        if (_typeof(relations[j]) !== 'object') {
          relations[j] = {};
        }
        relations[j][i] = true;
      }
    }
  }
  return relations;
}
exports.createRelationsObjectFromSparseMatrix = createRelationsObjectFromSparseMatrix;
function base10ArrayToBase2Array(b10Array, padding) {
  var maxScale = 0;
  var b2Array = b10Array.map(function (num) {
    var binaryString = num.toString(2);
    // console.log(num, binaryString)
    if (binaryString.length > maxScale) maxScale = binaryString.length;
    return binaryString;
  });
  // console.log('maxScale', maxScale)
  b2Array = b2Array.map(function (b2numString) {
    return b2numString.padStart(maxScale + padding, '0');
  });
  return b2Array;
}
exports.base10ArrayToBase2Array = base10ArrayToBase2Array;
function allWorldpathsFromRelationsObject(relationsObject, startingIndex, maxDepth) {
  var worldPaths = [[startingIndex]];
  appendWorldPath(worldPaths[0]);
  function appendWorldPath(pathArray) {
    // start with the array children
    if (pathArray.length >= maxDepth) return;
    var lastElement = pathArray[pathArray.length - 1];
    var connectedElements = Object.keys(relationsObject[lastElement]).map(function (el) {
      return 1 * el;
    });
    // console.log('connectedElements', connectedElements)
    for (var i in connectedElements) {
      var newPathArray = pathArray.map(function (x) {
        return 1 * x;
      });
      var newElement = connectedElements[i];
      if (!pathArray.includes(newElement) && newElement !== 0) {
        // if (newElement !== 0 ) { // don't cross zero, and become and accidentally closed space
        newPathArray.push(newElement);
        worldPaths.push(newPathArray);
        appendWorldPath(newPathArray);
      }
    }
  }
  return worldPaths;
}
exports.allWorldpathsFromRelationsObject = allWorldpathsFromRelationsObject;
function shellsOfDimensionalityFromRelationsObject(relationsObject, startingArray) {
  var shells = [startingArray.map(function (el) {
    return 1 * el;
  })]; // shallow copy
  var uniqueElementsVisited = startingArray;
  findElementsInNextShell();
  function findElementsInNextShell() {
    var shell = shells[shells.length - 1];
    var nextShell = new Array();
    for (var i in shell) {
      var startingElement = shell[i];
      var connectedElements = Object.keys(relationsObject[startingElement]).map(function (el) {
        return 1 * el;
      });
      // console.log('connectedElements', connectedElements)
      for (var j in connectedElements) {
        var connectedElement = connectedElements[j];
        if (connectedElement === 0) {
          shells.pop();
          return;
        }
        if (!uniqueElementsVisited.includes(connectedElement)) {
          // new element, not wrapping back to zero
          uniqueElementsVisited.push(connectedElement);
          nextShell.push(connectedElement);
        }
      }
    }
    // console.log('nextShell', nextShell)
    shells.push(nextShell);
    // console.log('shells ', shells)
    findElementsInNextShell();
    return;
  }
  return shells;
}
exports.shellsOfDimensionalityFromRelationsObject = shellsOfDimensionalityFromRelationsObject;
function shellsFromWorldPaths(worldPaths) {
  var shells = [];
  var maxDepth = 0;
  for (var i = 0; i < worldPaths.length; i++) {
    if (worldPaths[i].length > maxDepth) maxDepth = worldPaths[i].length;
  }
  for (var _i = 0; _i <= maxDepth; _i++) {
    shells.push({
      shellNumber: _i,
      totalWorldPaths: 0,
      endingElements: [],
      endingPathCounts: {},
      deltaEndingElements: 0,
      closedWorldPaths: 0,
      openWorldpaths: 0,
      newElementsVisited: []
    });
  }
  //  console.log('shellsEmpty', shells)
  var elementsVisited = [];
  for (var _i2 in worldPaths) {
    var worldPath = worldPaths[_i2];
    // console.log(worldPath)
    var pathLength = worldPath.length;
    // console.log(pathLength)
    shells[pathLength].totalWorldPaths++;
    var endingElement = worldPath[worldPath.length - 1];
    // console.log({endingElement})
    if (!elementsVisited.includes(endingElement)) {
      // no path has yet to visit this element
      shells[pathLength].newElementsVisited.push(endingElement);
      elementsVisited.push(endingElement);
    }
    if (!shells[pathLength].endingElements.includes(endingElement)) {
      shells[pathLength].endingElements.push(endingElement);
      shells[pathLength].endingPathCounts[endingElement] = 1;
      shells[pathLength].openWorldpaths++;
    } else {
      // element already in list
      if (typeof shells[pathLength].endingPathCounts[endingElement] === 'number') {
        shells[pathLength].endingPathCounts[endingElement]++;
      }
      shells[pathLength].closedWorldPaths++;
    }
  }
  //  console.log('shells', shells)
  for (var _i3 = 0; _i3 < shells.length; _i3++) {
    if (_i3 !== 0) {
      shells[_i3].deltaEndingElements = shells[_i3].endingElements.length - shells[_i3 - 1].endingElements.length;
    }
  }
  return shells;
}
exports.shellsFromWorldPaths = shellsFromWorldPaths;

},{}],2:[function(require,module,exports){
'use strict';

var plankGraph = require('./plankGraph');
document.addEventListener('DOMContentLoaded', function () {
  console.log('Start');
  plankGraph();
});

},{"./plankGraph":3}],3:[function(require,module,exports){
"use strict";

var Library = require('./library');
var excessVectorPadding = 6;
var NS = 'http://www.w3.org/2000/svg';
// const padding = 20
var layout = "\n<div class=\"pg-container\">\n  <form action=\"/graph/save\" method=\"POST\">\n  <h3 class=\"title\">Plank Graph of: <span class=\"vector-string\"></span></h3>\n  <input type=\"text\" value=\"\" name=\"name\" hidden></input>\n  <a href=\"#\" class=\"view-interactive\">Open as Interactive</a>\n  <div class=\"svg-container\"></div>\n  <div class=\"actions\">\n    <input type=\"text\" name=\"startingArray\" value=\"\" placeholder=\"Starting Elements list\"/>\n    <button type=\"button\" class=\"btn btn-primary\" >Calculate Properties</button>\n    <button type=\"submit\" class=\"btn btn-success\" disabled >Save Graph</button>\n  </div>\n  <div class=\"sparse-matrix-container\">\n    <h4>Sparse Matrix Representation</h4>\n    \n  </div>\n  <div class=\"effect-container\">\n    <h4>Shells of Dimensionality</h4>\n    <div class=\"shells-container\"></div>\n  </div>\n  <div class=\"metrics-container\">\n    <h4>Metrics</h4>\n    <div>\n      <h5>Starting Element: <span class=\"startingIndex\"></span></h5>\n    </div>\n    <div>\n      <h5>Shells Computed: <span class=\"maxDepth\"></span></h5>\n    </div>\n    <div>\n      <h5>Calculated Number of Worldpaths: <span class=\"worldpathCount\"></span></h5>\n    </div>\n  </div>\n\n \n  \n  <style>\n\n    .pg-container .svg-container {\n      max-width: 100%;\n      width: 100%;\n      overflow-y: scroll;\n      overflow-y: hidden;\n    }\n    .pg-container svg.plank circle{\n      fill: white;\n      stroke: black;\n      stroke-width: 1px;\n    }\n\n    .pg-container .actions button {\n      display: none;\n    }\n\n    .pg-container .actions input[name=\"startingArray\"] {\n      display: none;\n    }\n\n    .pg-container span.vector-string {\n      word-wrap: break-word;\n    }\n\n    .pg-container h3 {\n      display: inline;\n    }\n\n    .pg-container a.view-interactive {\n      margin-left: 20px;\n    }\n\n    .pg-container svg.plank circle.matrix-element:hover {\n      stroke: red;\n      cursor: pointer;\n    }\n\n    .pg-container svg circle.origin-circle:hover {\n      cursor: pointer;\n    }\n\n    .pg-container svg text.origin-circle:hover {\n      cursor: pointer;\n    }\n\n    .pg-container svg circle.origin-circle.non-compliant {\n      fill: #ff7575;\n    }\n\n    .pg-container svg circle.origin-circle.compliant {\n      fill: #5abf5a;\n    }\n\n    .pg-container svg circle.origin-circle.blink {\n      fill: #741bbd;\n    }\n\n\n    .pg-container svg.plank circle.filled{\n      fill: #7b7b7b;\n    }\n\n    .pg-container svg.plank circle.hightlighted{\n      fill: #ff8300;\n    }\n\n    .pg-container svg.plank circle.hightlighted.filled{\n      fill: #ce6c04;\n    }\n\n    .pg-container .sparse-matrix-container {\n      display: none;\n      width: 33.3%;\n      overflow-y: scroll;\n      overflow-y: hidden;\n      float: left;\n    }\n\n    .pg-container .effect-container {\n      display: none;\n      padding: 5px;\n      float: left;\n      width: 33.3%;\n      overflow-y: scroll;\n      overflow-y: hidden;\n    }\n\n    .pg-container .metrics-container {\n      display: none;\n      width: 33.3%;\n      float: left;\n      overflow-y: scroll;\n      overflow-y: hidden;\n      text-align: center;\n    }\n\n    .pg-container input[name=\"name\"] {\n      width: 84rem;\n      border: none;\n    }\n\n    .pg-container button[type=\"submit\"] {\n      display: none;\n    }\n\n    .pg-container div.shells-container {\n      // height: 300px;\n    }\n\n    .pg-container div.shells-container > div.shell {\n      \n      position: relative;\n    }\n\n    .pg-container div.shells-container .shell-element-container {\n      // margin: auto;\n      height: 100%;\n      border: 0.5px solid black;\n      background-color: lightgrey;\n    }\n    .pg-container div.shells-container div.shell-element {\n      display: inline-block;\n      height: 100%;\n      color: black;\n      text-align: center;\n      margin-bottom:0px;\n      padding-top: 7px;\n      font-size: 12px;\n      border: 0.px solid black;\n    }\n  </style>\n  </form>\n</div>\n";
function init() {
  console.log('init');
  if (document.getElementsByClassName('plank-graph').length > 0) {
    Array.from(document.getElementsByClassName('plank-graph')).forEach(createGraph);
  }
}
function createGraph(graphEl) {
  // in standard cartesian coordinates
  graphEl.innerHTML = layout;
  var circleRadius = graphEl.dataset.radius ? parseInt(graphEl.dataset.radius, 10) : 12; // default to 12
  var increment = circleRadius * 4;
  // console.log('create graph')
  var b10Array = Library.vectorStringToBase10Array(graphEl.dataset.starting);
  var b10ArrayAfter = Object.assign([], b10Array);
  // graphEl.querySelector('span.starting-vectors').innerText = graphEl.dataset.starting
  var inputNameEl = graphEl.querySelector('input[name="name"]');
  inputNameEl.value = graphEl.dataset.starting;
  graphEl.querySelector('span.vector-string').textContent = graphEl.dataset.starting;
  // set up all features for saving

  var href = graphEl.querySelector('a').setAttribute('href', '/graph/byId?name=' + encodeURIComponent(b10Array.join(',')));
  var b2Array = Library.base10ArrayToBase2Array(b10Array, excessVectorPadding);
  var scale = b2Array[0].length;
  // console.log('scale', scale)
  // var matrix = createNewMatrix(scale + b2Array.length)
  // console.log(matrix)
  var vectorCount = b2Array.length;
  // console.log('b2Array', b2Array)
  var svg = document.createElementNS(NS, 'svg');
  var height = increment * scale + increment;
  var width = increment * (vectorCount + scale / Math.SQRT2);
  var yOffset = function yOffset(y) {
    return height / 2 - y;
  };
  var xOffset = function xOffset(x) {
    return x + increment / 2;
  };
  svg.setAttributeNS(NS, 'viewBox', "".concat(0, " ", 0, " ", width, " ").concat(height));
  svg.style.height = height + 'px';
  svg.style.width = width + 'px';
  svg.style.backgroundColor = '#d3d3d333';
  svg.classList.add('plank');
  var svgContainer = graphEl.querySelector('div.svg-container');
  svgContainer.appendChild(svg);
  addSolidLine(svg, 0, 0, width, 0); // main diagonal

  for (var i = 0; i < vectorCount; i++) {
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, scale * increment); // solid guide line
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, -scale * increment); // solid guide line
    addDashedLine(svg, i * increment, 0, (i - scale) * increment, +scale * increment); // dashed guide line
    addDashedLine(svg, i * increment, 0, (i - scale) * increment, -scale * increment); // dashed guide line
  }

  for (var _i = 0; _i < vectorCount; _i++) {
    addOriginCircle(svg, _i * increment, 0, _i); // origins on diagonal
  }

  for (var _i2 = 0; _i2 < vectorCount; _i2++) {
    addVectorCircles(svg, _i2); // important dots
  }

  if (graphEl.getAttribute('readonly') === 'false') {
    // interactive mode
    console.log('graph is interactive');
    graphEl.querySelector('input[name="startingArray"]').style.display = 'inline-block';
    graphEl.querySelector('.actions button.btn-primary').style.display = 'inline-block';
    graphEl.querySelector('button[type="submit"]').style.display = 'inline-block';
    graphEl.querySelector('a.view-interactive').style.display = 'none';
    graphEl.querySelector('div.sparse-matrix-container').style.display = 'inline-block';
    graphEl.querySelector('div.effect-container').style.display = 'block';
    graphEl.querySelector('div.metrics-container').style.display = 'inline-block';
    var complianceVector = Library.validateVectorString(graphEl.dataset.starting);
    applyComplianceVector(svg, complianceVector);
    // createSpareMatrix()  // also creates effect graph and metrics
    var calculateButton = graphEl.querySelector('.actions button.btn-primary');
    calculateButton.onclick = function (event) {
      event.stopPropagation();
      var results = Library.validateVectorString(graphEl.querySelector('span.vector-string').textContent);
      if (results.includes(false)) {// produce an error or something
      } else {
        createSpareMatrix(); // all the things
      }
    };
  }

  // end main createGraph body

  function createSpareMatrix() {
    console.log('createSpareMatrix');
    var squareSize = 2;
    var vectorString = graphEl.querySelector('span.vector-string').textContent;
    var matrix = Library.makeSparseMatrix(vectorString);
    var svg = document.createElementNS(NS, 'svg');
    var height = matrix.length * squareSize;
    var width = matrix.length * squareSize;
    var yOffset = function yOffset(m) {
      return m * squareSize;
    };
    var xOffset = function xOffset(n) {
      return n * squareSize;
    };
    svg.setAttributeNS(NS, 'viewBox', "".concat(0, " ", 0, " ", width, " ").concat(height));
    svg.style.height = height + 'px';
    svg.style.width = width + 'px';
    svg.style.backgroundColor = '#d3d3d333';
    svg.style.border = '0.5px solid black';
    svg.classList.add('sparse-matrix');
    var svgContainer = graphEl.querySelector('div.sparse-matrix-container');
    svgContainer.appendChild(svg);
    var sparseMatrix = Library.makeSparseMatrix(vectorString);
    // console.log(sparseMatrix)
    for (var j = 0; j < sparseMatrix.length; j++) {
      //rows
      for (var _i3 = 0; _i3 < sparseMatrix[j].length; _i3++) {
        //columns
        addMatrixSquare(j, _i3, sparseMatrix[j][_i3]);
      }
    }
    createEffectGraph(matrix);
    function addMatrixSquare(j, i, value) {
      var square = document.createElementNS(NS, 'rect');
      square.setAttribute('y', yOffset(j));
      square.setAttribute('x', xOffset(i));
      square.setAttribute('width', squareSize);
      square.setAttribute('height', squareSize);
      // square.id = 'sparse-element-' + i + '-' + i
      // square.setAttribute('stroke', 'black')
      // square.setAttribute('stroke-width', '0.5px')
      square.setAttribute('fill', value === '1' ? 'black' : 'white');
      // square.classList.add('origin-circle')
      svg.appendChild(square);
    }
  }
  /* Look not at the element, but the relationships. Foloow the relationships, nameley the 2,6,2,6,2,6 graph structure, as we move the defect through another graph!!
  */
  function createEffectGraph(matrix) {
    // const startingIndex = Math.floor(matrix.length / 2) + 1
    var startingArray = graphEl.querySelector('input[name="startingArray"]').value.trim().split(',').map(function (el) {
      return 1 * el;
    });
    console.log('starting array', startingArray);
    // graphEl.querySelector('span.startingIndex').innerText = startingIndex
    // console.log('create effect graph starting at index=', startingIndex)
    var maxDepth = 12;
    graphEl.querySelector('span.maxDepth').innerText = maxDepth;
    var relationsObject = Library.createRelationsObjectFromSparseMatrix(matrix); // fastest way
    console.log('relationsObject', relationsObject);
    // const worldPaths = Library.allWorldpathsFromRelationsObject(relationsObject, startingIndex, maxDepth)
    // console.log('worldPaths', worldPaths)
    // graphEl.querySelector('span.worldpathCount').innerText = worldPaths.length.toLocaleString()
    // const shells = Library.shellsFromWorldPaths(worldPaths)
    var shells = Library.shellsOfDimensionalityFromRelationsObject(relationsObject, startingArray, maxDepth);
    console.log('shells', shells);
    var shellsContainerEl = graphEl.querySelector('div.shells-container');
    // let maxElementsInAllShells = 0
    // shells.forEach(shell => {
    //   if (shell.openWorldpaths > maxElementsInAllShells) maxElementsInAllShells = shell.openWorldpaths
    // })
    shells.forEach(function (shell, i) {
      var shellEl = document.createElement('div');
      // shellEl.style.height = Math.ceil(100/shells.length) + '%'
      shellEl.className = 'shell';
      shellsContainerEl.appendChild(shellEl);
      var shellElementContainer = document.createElement('div');
      shellElementContainer.className = 'shell-element-container';
      shellEl.appendChild(shellElementContainer);
      var shellElementContainerWidth = Math.round(100 * shell.length / shells[shells.length - 1].length); // maxShelllenght/ shelllength
      shellElementContainer.style.width = shellElementContainerWidth + '%';
      for (var j in shell) {
        var pathsEndingInElement = shell[j];
        // console.log(elementNumber, pathsEndingInElement)
        var elementBox = document.createElement('div');
        elementBox.className = 'shell-element';
        // if (i === 1) elementBox.style.color = 'white'
        // const widthNumber = Math.floor(100 * /maxElementsInAllShells)
        elementBox.style.width = Math.round(100000 / shell.length) / 1000 + '%';
        elementBox.innerText = shell[j];
        // const heightPercent = Math.round(100 * pathsEndingInElement / shell.totalWorldPaths)
        elementBox.style.height = '100%';
        // elementBox.style.background = `linear-gradient(to bottom, rgb(36, 24, 94) ${heightPercent}%, #fff ${1 - heightPercent}%`
        shellElementContainer.appendChild(elementBox);
      }
    });
  }
  function addVectorCircles(svg, i) {
    // in offset coordinates, i is vector number
    var vector = b2Array[i].split('').reverse().join('');
    // console.log('vectorValue', vector)
    for (var j = 0; j < vector.length; j++) {
      var topCircle = document.createElementNS(NS, 'circle');
      // top circles
      topCircle.setAttribute('cx', xOffset(i * increment + (j + 1) * increment / 2));
      topCircle.setAttribute('cy', yOffset((j + 1) * increment / 2));
      topCircle.setAttribute('r', circleRadius);
      topCircle.id = 'matrix-element-' + i + '-' + (j + i + 1);
      topCircle.classList.add('matrix-element');
      topCircle.dataset.vectorNumber = i;
      topCircle.dataset.vectorElement = j;
      svg.appendChild(topCircle);
      // bottom circles
      var bottomCircle = document.createElementNS(NS, 'circle');
      bottomCircle.setAttribute('cx', xOffset(i * increment + (j + 1) * increment / 2));
      bottomCircle.setAttribute('cy', yOffset((-j - 1) * increment / 2));
      bottomCircle.setAttribute('r', circleRadius);
      bottomCircle.id = 'matrix-element-' + (j + i + 1) + '-' + i;
      bottomCircle.classList.add('matrix-element');
      if (vector[j] === '1') {
        bottomCircle.classList.add('filled');
        topCircle.classList.add('filled');
      }
      svg.appendChild(bottomCircle);
      // console.log('graphEl', graphEl)
      // 
      // add user interaction
      if (graphEl.getAttribute('readonly') === 'false') {
        addUserInteraction(topCircle, i, svg);
        addUserInteraction(bottomCircle, i, svg);
      }
    }
  }
  function addUserInteraction(circle, i, svg) {
    circle.addEventListener('click', function (event) {
      // left click
      if (graphEl.getAttribute('readonly') === 'true') return;
      this.classList.toggle('filled');
      var filled = this.classList.contains('filled');
      var idStringArray = this.id.split('-');
      var x = parseInt(idStringArray[2], 10);
      var y = parseInt(idStringArray[3], 10);
      if (filled) {
        document.getElementById('matrix-element-' + x + '-' + y).classList.add('filled');
        document.getElementById('matrix-element-' + y + '-' + x).classList.add('filled');
      } else {
        document.getElementById('matrix-element-' + x + '-' + y).classList.remove('filled');
        document.getElementById('matrix-element-' + y + '-' + x).classList.remove('filled');
      }
      // update Vectors List

      var vEls = document.querySelectorAll('[data-vector-number="' + i + '"]');
      // console.log(vEls)
      var vector = [];
      vEls.forEach(function (el) {
        vector.push(el.classList.contains('filled'));
      });
      // console.log('vector', vector)
      var stringRepresentation = vector.map(function (el) {
        return el ? '1' : '0';
      }).reverse().join('');
      var number = parseInt(stringRepresentation, 2);
      // console.log('string representation', stringRepresentation, number)

      b10ArrayAfter[i] = number;
      // console.log('b10ArrayAfter', b10ArrayAfter)
      // graphEl.querySelector('span.starting-vectors').innerText = b10ArrayAfter
      var vectorString = b10ArrayAfter.join(',');
      graphEl.querySelector('input[name="name"]').value = vectorString;
      graphEl.querySelector('span.vector-string').textContent = vectorString;
      var complianceVector = Library.validateVectorString(vectorString);
      applyComplianceVector(svg, complianceVector);
    });
    circle.addEventListener('dblclick', function (event) {
      this.classList.toggle('hightlighted');
    });
  }
  function applyComplianceVector(svg, complianceVector) {
    if (complianceVector.length !== b2Array.length) {
      console.log('applyComplianceVector found to be the incorrect length');
      return;
    }
    complianceVector.forEach(function (element, i) {
      var originCircle = svg.getElementById('matrix-element-' + i + '-' + i);
      if (element === true) {
        originCircle.classList.remove('compliant');
        originCircle.classList.remove('non-compliant');
        originCircle.classList.add('compliant');
      } else {
        originCircle.classList.remove('non-compliant');
        originCircle.classList.remove('compliant');
        originCircle.classList.add('non-compliant');
      }
    });
    if (complianceVector.includes(false)) {
      graphEl.querySelector('button[type="submit"]').setAttribute('disabled', true);
    } else {
      graphEl.querySelector('button[type="submit"]').removeAttribute('disabled');
    }
  }
  function addOriginCircle(svg, x, y, i) {
    // in offset coordinates
    var circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', xOffset(x));
    circle.setAttribute('cy', yOffset(y));
    circle.setAttribute('r', circleRadius);
    circle.id = 'matrix-element-' + i + '-' + i;
    circle.setAttribute('stroke', 'black');
    circle.style = '';
    circle.classList.add('origin-circle');
    svg.appendChild(circle);
    var text = document.createElementNS(NS, 'text');
    text.classList.add('origin-circle');
    text.textContent = i;
    text.setAttribute('font-family', 'Verdana');
    text.setAttribute('stroke', 'black');
    text.setAttribute('stroke-width', 0.5);
    text.setAttribute('font-size', circleRadius);
    text.setAttribute('x', xOffset(x) - circleRadius / 3);
    var digits = i.toString().length;
    text.setAttribute('dx', (1 - digits) * circleRadius / 3);
    text.setAttribute('y', yOffset(y) + circleRadius / 3);
    text.id = 'matrix-element-label-' + i + '-' + i;
    svg.appendChild(text);
    // if (graphEl.getAttribute('readonly') === 'false') {
    //   circle.addEventListener('click', function (event) {
    //     event.stopPropagation()
    //     monteCarloSimulation(i)
    //   })
    //   text.addEventListener('click', function (event) {
    //     event.stopPropagation()
    //     monteCarloSimulation(i)
    //   })
    // }
  }

  function addSolidLine(svg, x1, y1, x2, y2) {
    // in offset coordinates
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', xOffset(x1));
    line.setAttribute('y1', yOffset(y1));
    line.setAttribute('x2', xOffset(x2));
    line.setAttribute('y2', yOffset(y2));
    line.setAttribute('stroke', 'black');
    line.classList.add('solid-guideline');
    svg.appendChild(line);
  }
  function addDashedLine(svg, x1, y1, x2, y2) {
    // in offset coordinates
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', xOffset(x1));
    line.setAttribute('y1', yOffset(y1));
    line.setAttribute('x2', xOffset(x2));
    line.setAttribute('y2', yOffset(y2));
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-dasharray', '2');
    line.classList.add('dashed-guideline');
    svg.appendChild(line);
  }
}
module.exports = init;

},{"./library":1}]},{},[2]);
