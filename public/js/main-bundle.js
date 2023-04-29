(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var plankGraph = require('./plankGraph');
document.addEventListener('DOMContentLoaded', function () {
  console.log('Start');
  plankGraph();
});

},{"./plankGraph":2}],2:[function(require,module,exports){
"use strict";

var excessVectorPadding = 2;
var NS = 'http://www.w3.org/2000/svg';
// const padding = 20

function init() {
  console.log('init');
  if (document.getElementsByClassName('plank-graph').length > 0) {
    Array.from(document.getElementsByClassName('plank-graph')).forEach(createGraph);
  }
}
function createGraph(graphEl) {
  // in standard cartesian coordinates
  var circleRadius = 12;
  var increment = circleRadius * 4;
  console.log('create graph');
  var b10Array = sanitizeInputNumbers(graphEl.dataset.numbers);
  var b2Array = b10tob2Array(b10Array, excessVectorPadding);
  var scale = b2Array[0].length;
  var vectorCount = b2Array.length;
  console.log('b2Array', b2Array);
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
  graphEl.appendChild(svg);
  addSolidLine(svg, 0, 0, width, 0);
  for (var i = 0; i < vectorCount; i++) {
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, scale * increment); //solid guide line
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, -scale * increment); //solid guide line
    addOriginCircle(svg, i * increment, 0, i); // origins
    addVectorCircles(svg, i);
  }
  function addVectorCircles(svg, i) {
    // in offset coordinates, i is vector number
    var vector = b2Array[i].split('').reverse().join('');
    console.log('vectorValue', vector);
    for (var j = 0; j < scale; j++) {
      var topCircle = document.createElementNS(NS, 'circle');
      // top circles
      topCircle.setAttribute('cx', xOffset(i * increment + (j + 1) * increment / 2));
      topCircle.setAttribute('cy', yOffset((j + 1) * increment / 2));
      topCircle.setAttribute('r', circleRadius);
      topCircle.id = i + '-' + j;
      topCircle.style = 'stroke-width:1;stroke:black';
      topCircle.setAttribute('fill', vector[j] === '1' ? 'black' : 'white');
      svg.appendChild(topCircle);
      // bottom circles
      var bottomCircle = document.createElementNS(NS, 'circle');
      bottomCircle.setAttribute('cx', xOffset(i * increment + (j + 1) * increment / 2));
      bottomCircle.setAttribute('cy', yOffset((-j - 1) * increment / 2));
      bottomCircle.setAttribute('r', circleRadius);
      bottomCircle.id = i + '-' + j;
      bottomCircle.style = 'stroke-width:1;stroke:black';
      bottomCircle.setAttribute('fill', vector[j] === '1' ? 'black' : 'white');
      svg.appendChild(bottomCircle);
    }
  }
  function addOriginCircle(svg, x, y, txt) {
    // in offset coordinates
    var circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', xOffset(x));
    circle.setAttribute('cy', yOffset(y));
    circle.setAttribute('r', circleRadius);
    circle.style = 'fill:white;stroke-width:1;';
    svg.appendChild(circle);
    var text = document.createElementNS(NS, 'text');
    text.textContent = txt;
    text.setAttribute('font-family', 'Verdana');
    text.setAttribute('stroke', 'black');
    text.setAttribute('stroke-width', 0.5);
    text.setAttribute('font-size', circleRadius);
    text.setAttribute('x', xOffset(x) - circleRadius / 2);
    text.setAttribute('y', yOffset(y) + circleRadius / 3);
    // text.setAttributeNS(NS, 'text-anchor', 'middle')
    svg.appendChild(text);
    // svg.appendChild(g)
  }

  function addSolidLine(svg, x1, y1, x2, y2) {
    // in offset coordinates
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', xOffset(x1));
    line.setAttribute('y1', yOffset(y1));
    line.setAttribute('x2', xOffset(x2));
    line.setAttribute('y2', yOffset(y2));
    line.setAttribute('stroke', 'black');
    line.classList.add('solid-guidline');
    svg.appendChild(line);
  }
}
function sanitizeInputNumbers(nums) {
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
function b10tob2Array(b10Array, padding) {
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
module.exports = init;

},{}]},{},[1]);
