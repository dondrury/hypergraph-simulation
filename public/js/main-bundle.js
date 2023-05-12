(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var plankGraph = require('./plankGraph');
document.addEventListener('DOMContentLoaded', function () {
  console.log('Start');
  plankGraph();
});

},{"./plankGraph":2}],2:[function(require,module,exports){
"use strict";

var Library = require('../library');
var excessVectorPadding = 6;
var NS = 'http://www.w3.org/2000/svg';
// const padding = 20
var layout = "\n<div class=\"pg-container\">\n  <form action=\"/graph/save\" method=\"POST\">\n  <h3 class=\"title\">Plank Graph of: <span class=\"vector-string\"></span></h3>\n  <input type=\"text\" value=\"\" name=\"name\" hidden></input>\n  <a href=\"#\" class=\"view-interactive\">Open as Interactive</a>\n  <div class=\"svg-container\"></div>\n  <div class=\"monte-carlo\"></div>\n  <div class=\"info\">\n    <button type=\"submit\" class=\"btn btn-success\" >Save Graph</button>\n  </div>\n  <style>\n    .pg-container svg.plank circle{\n      fill: white;\n      stroke: black;\n      stroke-width: 1px;\n    }\n\n    .pg-container h3 {\n      display: inline;\n    }\n\n    .pg-container a.view-interactive {\n      margin-left: 20px;\n    }\n\n    .pg-container svg.plank circle.matrix-element:hover {\n      stroke: red;\n      cursor: pointer;\n    }\n\n    .pg-container svg circle.origin-circle:hover {\n      cursor: pointer;\n    }\n\n    .pg-container svg text.origin-circle:hover {\n      cursor: pointer;\n    }\n\n    .pg-container svg circle.origin-circle.non-compliant {\n      fill: #ff7575;\n    }\n\n    .pg-container svg circle.origin-circle.compliant {\n      fill: #5abf5a;\n    }\n\n    .pg-container svg circle.origin-circle.blink {\n      fill: #741bbd;\n    }\n\n\n    .pg-container svg.plank circle.filled{\n      fill: black;\n    }\n\n    .pg-container input[name=\"name\"] {\n      width: 84rem;\n      border: none;\n    }\n\n    .pg-container button[type=\"submit\"] {\n      display: none;\n    }\n  </style>\n  </form>\n</div>\n";
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
  if (graphEl.getAttribute('readonly') === 'false') {
    console.log('graph is interactive');
    graphEl.querySelector('button[type="submit"]').style.display = 'block';
    graphEl.querySelector('a.view-interactive').style.display = 'none';
  }
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
    var complianceVector = Library.validateVectorString(graphEl.dataset.starting);
    applyComplianceVector(svg, complianceVector);
  }
  monteCarloSimulation(3);

  // end main createGraph body

  function monteCarloSimulation(numberOfGraphs) {
    // monto carlo volume approximation of how volume grows with radius, start with j=0
    console.log('monteCarloSimulation');
    var vectorString = graphEl.querySelector('span.vector-string').textContent;
    var constVectorsWithOrigin = Library.vectorStringToMatrix(vectorString);
    var vectorsWithOrigin = Object.assign([], constVectorsWithOrigin);
    for (var k = 0; k < numberOfGraphs; k++) {
      // we have one full length too many here, but we don't actually use it
      vectorsWithOrigin = vectorsWithOrigin.concat(constVectorsWithOrigin);
    }
    console.log('vectorsWithOrigin', vectorsWithOrigin); // actually an array of strings, but the chars are in the right place
    // const paths = walkAllPaths()
    // console.log('paths', paths)

    // // function histogramUniqueElementsPerStep (paths) {
    // //   // paths is array of paths
    // //   for (let i = 0; i < constVectorsWithOrigin.length; i++) {
    // //     let stepSection
    // //   }
    // // }

    // function walkAllPaths() {
    //   let paths = []
    //   for (let p = 0; p < constVectorsWithOrigin.length - 1; p++) {
    //     console.log('path starting at ' + p)
    //     let path = [p] // include starting element
    //     walkPath(p, path)
    //     // console.log(path)
    //     path = path.map(val => val - p) // normalize path by subtracting the first element from all of them, bringing them all back to zero
    //     paths.push(path) // these path values do NOT represent the actual matrix-element value, all shifted back by starting point. They superimpose
    //   }
    //   return paths
    // }

    // function walkPath (startElement, path) {

    //   const next = nextElement(startElement, path)
    //   // console.log(next)
    //   path.push(next)
    //   if (next >= vectorsWithOrigin.length - constVectorsWithOrigin.length) return // stay in n - 1 graphs
    //   walkPath(next, path)
    // }

    // function nextElement (j, path) {
    //   let elementsToChooseFrom = []
    //   console.log('next element', j)
    //   for(let i = 0; i < vectorsWithOrigin[j].length; i++) { // this can fail in the forward direction when it encounters any empty "0" vector
    //     if (vectorsWithOrigin[j][i] === '1') elementsToChooseFrom.push((i + j) % vectorsWithOrigin.length)
    //   }
    //   if (elementsToChooseFrom.length === 0) { // we have failed to find any elements in the forward direction, go back
    //     for(let i = 0; i < vectorsWithOrigin[j].length; i++) { // this can fail in the forward direction when it encounters any empty "0" vector
    //       if (vectorsWithOrigin[vectorsWithOrigin.length + j - i][i] === '1') elementsToChooseFrom.push((i + j) % vectorsWithOrigin.length)
    //     }
    //   }
    //   console.log('elementsToChooseFrom j=' + j, elementsToChooseFrom)
    //   const chosenElement = elementsToChooseFrom[Math.floor(Math.random() * elementsToChooseFrom.length)]
    //   // console.log('chosenElement', chosenElement)
    //   const originCircle =  svg.getElementById('matrix-element-' + chosenElement + '-' + chosenElement)
    //   // if (originCircle) {
    //   //   originCircle.classList.add('blink')
    //   //   setTimeout(() => {
    //   //     originCircle.classList.remove('blink')
    //   //   }, 300);
    //   // }
    //   return chosenElement
    // }
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

},{"../library":3}],3:[function(require,module,exports){
"use strict";

exports.validateVectorString = function (vectorString) {
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
  // console.log('vectors', vectors) // example [ "1101", "1101", "0000", "1001", "0010", "0010", "1010", "0000", "1000", "0000", … ]
  var resultsArray = [];
  for (var j = 0; j < vectors.length; j++) {
    // j is the "row" or number of vector
    var count = 0;
    // console.log('j', j)
    for (var i = 0; i < vectors[j].length; i++) {
      if (vectors[j][i] === '1') count++;
      // console.log('rightwardVectorIndes',j,i)
      var leftwardVector = (vectors.length + j - i) % vectors.length;
      // console.log('leftwardVectorIndeces', leftwardVector, i)
      if (vectors[leftwardVector][i] === '1') count++;
    }
    resultsArray.push(count === 3);
  }
  // console.log('resultsArray', resultsArray)
  return resultsArray;
};
function vectorStringToMatrix(vectorString) {
  var base10Array = vectorStringToBase10Array(vectorString);
  var base2Array = base10ArrayToBase2Array(base10Array, 0);
  // console.log('base2Array', base2Array)
  //  each vector still in reverse order and still a string base 2
  var vectors = base2Array.map(function (vectorString) {
    var inGraphOrderArray = vectorString.split('').reverse();
    inGraphOrderArray.unshift('0');
    return inGraphOrderArray.join('');
  });
  console.log(vectors);
  return vectors;
}
exports.vectorStringToMatrix = vectorStringToMatrix;
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

},{}]},{},[1]);
