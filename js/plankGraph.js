const Library = require('./library')
const excessVectorPadding = 6
const NS = 'http://www.w3.org/2000/svg'
// const padding = 20
const layout = `
<div class="pg-container">
  <form action="/graph/save" method="POST">
  <h3 class="title">Plank Graph of: <span class="vector-string"></span></h3>
  <input type="text" value="" name="name" hidden></input>
  <a href="#" class="view-interactive">Open as Interactive</a>
  <div class="svg-container"></div>
  
  <div class="sparse-matrix-container">
    <h4>Sparse Matrix Representation</h4>
  </div>
  <div class="metrics-container">
    <h4>Metrics</h4>
  </div>
  <div class="dimensionality-container">
    <h4>Shells of Dimensionality</h4>
  </div>
 
  <div class="info">
    <button type="submit" class="btn btn-success" >Save Graph</button>
  </div>
  <style>

    .pg-container .svg-container {
      max-width: 100%;
      width: 100%;
      overflow-y: scroll;
      overflow-y: hidden;
    }
    .pg-container svg.plank circle{
      fill: white;
      stroke: black;
      stroke-width: 1px;
    }

    .pg-container h3 {
      display: inline;
    }

    .pg-container a.view-interactive {
      margin-left: 20px;
    }

    .pg-container svg.plank circle.matrix-element:hover {
      stroke: red;
      cursor: pointer;
    }

    .pg-container svg circle.origin-circle:hover {
      cursor: pointer;
    }

    .pg-container svg text.origin-circle:hover {
      cursor: pointer;
    }

    .pg-container svg circle.origin-circle.non-compliant {
      fill: #ff7575;
    }

    .pg-container svg circle.origin-circle.compliant {
      fill: #5abf5a;
    }

    .pg-container svg circle.origin-circle.blink {
      fill: #741bbd;
    }


    .pg-container svg.plank circle.filled{
      fill: black;
    }

    .pg-container .sparse-matrix-container {
      display: none;
      width: 33.3%;
      overflow-y: scroll;
      overflow-y: hidden;
    }

    .pg-container .dimensionality-container {
      display: none;
      width: 33.3%;
      float: right;
      overflow-y: scroll;
      overflow-y: hidden;
    }

    .pg-container .metrics-container {
      display: none;
      width: 33.3%;
      float: right;
      overflow-y: scroll;
      overflow-y: hidden;
    }

    .pg-container input[name="name"] {
      width: 84rem;
      border: none;
    }

    .pg-container button[type="submit"] {
      display: none;
    }
  </style>
  </form>
</div>
`

function init () {
  console.log('init')
  if (document.getElementsByClassName('plank-graph').length > 0) {
    Array.from(document.getElementsByClassName('plank-graph')).forEach(createGraph)
  }
}

function createGraph (graphEl) { // in standard cartesian coordinates
  graphEl.innerHTML = layout
  const circleRadius = graphEl.dataset.radius ? parseInt(graphEl.dataset.radius, 10) : 12 // default to 12
  const increment = circleRadius * 4
  // console.log('create graph')
  const b10Array = Library.vectorStringToBase10Array(graphEl.dataset.starting)
  const b10ArrayAfter = Object.assign([], b10Array)
  // graphEl.querySelector('span.starting-vectors').innerText = graphEl.dataset.starting
  const inputNameEl = graphEl.querySelector('input[name="name"]')
  inputNameEl.value = graphEl.dataset.starting
  graphEl.querySelector('span.vector-string').textContent = graphEl.dataset.starting
  // set up all features for saving
  if (graphEl.getAttribute('readonly') === 'false') {
    console.log('graph is interactive')
    graphEl.querySelector('button[type="submit"]').style.display = 'block'
    graphEl.querySelector('a.view-interactive').style.display = 'none'
  }
  const href = graphEl.querySelector('a').setAttribute('href', '/graph/byId?name=' + encodeURIComponent(b10Array.join(',')))
  const b2Array = Library.base10ArrayToBase2Array(b10Array, excessVectorPadding)
  const scale = b2Array[0].length
  // console.log('scale', scale)
  // var matrix = createNewMatrix(scale + b2Array.length)
  // console.log(matrix)
  const vectorCount = b2Array.length
  // console.log('b2Array', b2Array)
  const svg = document.createElementNS(NS,'svg')
  const height = increment * scale + increment
  const width =  increment * (vectorCount + scale / Math.SQRT2) 
  const yOffset = y => height / 2 - y
  const xOffset = x => x + increment / 2
  svg.setAttributeNS(NS,'viewBox', `${0} ${0} ${width} ${height}`)
  svg.style.height = height + 'px'
  svg.style.width = width + 'px'
  svg.style.backgroundColor = '#d3d3d333'
  svg.classList.add('plank')
  const svgContainer = graphEl.querySelector('div.svg-container')
  svgContainer.appendChild(svg)
  addSolidLine(svg, 0, 0, width, 0) // main diagonal
  
  for (let i = 0; i < vectorCount; i++) {
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, scale * increment) // solid guide line
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, - scale * increment) // solid guide line
    addDashedLine(svg, i * increment, 0, (i - scale) * increment, + scale * increment) // dashed guide line
    addDashedLine(svg, i * increment, 0, (i - scale) * increment, - scale * increment) // dashed guide line
  }
  for (let i = 0; i < vectorCount; i++) {
    addOriginCircle(svg, i * increment, 0, i) // origins on diagonal
  }
  for (let i = 0; i < vectorCount; i++) {
    addVectorCircles(svg, i) // important dots
  }
  if (graphEl.getAttribute('readonly') === 'false') { // interactive mode
    graphEl.querySelector('div.sparse-matrix-container').style.display = 'inline-block'
    graphEl.querySelector('div.dimensionality-container').style.display = 'inline-block'
    graphEl.querySelector('div.metrics-container').style.display = 'inline-block'
    const complianceVector = Library.validateVectorString(graphEl.dataset.starting)
    applyComplianceVector(svg, complianceVector)
    createSpareMatrix()  // also creates dimensionality graph and metrics
    
  }
 
  // end main createGraph body

  function createSpareMatrix() { // monto carlo volume approximation of how volume grows with radius, start with j=0
    console.log('createSpareMatrix')
    const squareSize = 10
    const vectorString = graphEl.querySelector('span.vector-string').textContent
    const matrix = Library.makeSparseMatrix(vectorString)
    const svg = document.createElementNS(NS,'svg')
    const height = matrix.length * squareSize
    const width =  matrix.length * squareSize
    const yOffset = m => m * squareSize
    const xOffset = n => n * squareSize
    svg.setAttributeNS(NS,'viewBox', `${0} ${0} ${width} ${height}`)
    svg.style.height = height + 'px'
    svg.style.width = width + 'px'
    svg.style.backgroundColor = '#d3d3d333'
    svg.classList.add('sparse-matrix')
    const svgContainer = graphEl.querySelector('div.sparse-matrix-container')
    svgContainer.appendChild(svg)
    const sparseMatrix = Library.makeSparseMatrix(vectorString)
    // console.log(sparseMatrix)
    for (let j = 0; j < sparseMatrix.length; j++){ //rows
      for (let i= 0; i < sparseMatrix[j].length; i++) { //columns
        addMatrixSquare(j, i, sparseMatrix[j][i])
      }
    }
    createDimensionalityGraph(matrix)

    function addMatrixSquare (j, i, value) {
      const square = document.createElementNS(NS,'rect')
      square.setAttribute('y', yOffset(j))
      square.setAttribute('x', xOffset(i))
      square.setAttribute('width', squareSize)
      square.setAttribute('height', squareSize)
      // square.id = 'sparse-element-' + i + '-' + i
      square.setAttribute('stroke', 'black')
      square.setAttribute('stroke-width', '0.5px')
      square.setAttribute('fill', value === '1' ? 'black' : 'white')
      // square.classList.add('origin-circle')
      svg.appendChild(square)
    }
  }

  function createDimensionalityGraph (matrix) {
    const startingIndex = Math.floor(matrix.length / 2)
    console.log('create dimensionality graph starting at index=', startingIndex)
    // const connectedElements = Library.findAdjascentElements(matrix, startingIndex)
    // console.log(startingIndex, 'is connected to', connectedElements)
    const maxDepth = 10
    // const maxShellLength = 50
    const relationsObject = Library.createRelationsObjectFromSparseMatrix(matrix) // fastest way
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
   console.log('relationsObject', relationsObject)
   const worldPaths = [[startingIndex]]
   
   appendWorldPath(worldPaths[0])

   console.log('worldPaths', worldPaths)
   const shells = []
   for (let i = 0; i <= maxDepth; i++) {
    shells.push({
      shellNumber: i,
      numberOfPaths: 0,
      endingElements: []
    })
   }
  //  console.log('shellsEmpty', shells)
   for (const i in worldPaths) {
    const worldPath = worldPaths[i]
    // console.log(worldPath)
    const pathLength = worldPath.length
    // console.log(pathLength)
    shells[pathLength].numberOfPaths++
    const endingElement = worldPath[worldPath.length - 1]
    // console.log({endingElement})
    if (!shells[pathLength].endingElements.includes(endingElement)) {
      shells[pathLength].endingElements.push(endingElement)
    }
   }
   console.log('shells', shells)


   function appendWorldPath (pathArray) { // start with the array children
    if (pathArray.length >= maxDepth  ) return
    const lastElement = pathArray[pathArray.length - 1]
    const connectedElements = Object.keys(relationsObject[lastElement]).map(el => 1 * el)
    // console.log('connectedElements', connectedElements)
    for (const i in connectedElements) {
      const newPathArray = pathArray.map(x => 1 * x)
      const newElement = connectedElements[i]
      if (!newPathArray.includes(newElement)) { // if we haven't visited that element before, on this path
        newPathArray.push(newElement)
        worldPaths.push(newPathArray)
        appendWorldPath(newPathArray)
      }
      
    }
   }

   
  }

  function addVectorCircles (svg, i) { // in offset coordinates, i is vector number
    const vector = b2Array[i].split('').reverse().join('')
    // console.log('vectorValue', vector)
    for (let j = 0; j < vector.length; j++) {
      const topCircle = document.createElementNS(NS,'circle')
      // top circles
      topCircle.setAttribute('cx', xOffset((i) * increment + (j + 1) * increment / 2))
      topCircle.setAttribute('cy', yOffset((j + 1) * increment/2))
      topCircle.setAttribute('r', circleRadius)
      topCircle.id = 'matrix-element-' + i + '-' +  (j + i + 1)
      topCircle.classList.add('matrix-element')
      topCircle.dataset.vectorNumber = i 
      topCircle.dataset.vectorElement = j
      svg.appendChild(topCircle)
      // bottom circles
      const bottomCircle = document.createElementNS(NS,'circle')
      bottomCircle.setAttribute('cx', xOffset((i) * increment + (j + 1) * increment / 2))
      bottomCircle.setAttribute('cy', yOffset((-j - 1) * increment/2))
      bottomCircle.setAttribute('r', circleRadius)
      bottomCircle.id = 'matrix-element-' + (j + i + 1) + '-' + i
      bottomCircle.classList.add('matrix-element')
      
      if (vector[j] === '1') {
        bottomCircle.classList.add('filled')
        topCircle.classList.add('filled')
      }
      svg.appendChild(bottomCircle)
      // console.log('graphEl', graphEl)
      // 
      // add user interaction
      if (graphEl.getAttribute('readonly') === 'false') {
        addUserInteraction(topCircle, i, svg)
        addUserInteraction(bottomCircle, i, svg)
      }
    }
  }

  function addUserInteraction (circle, i, svg) {
    circle.addEventListener('click', function (event) { // left click
      if (graphEl.getAttribute('readonly') === 'true') return
      this.classList.toggle('filled')
      const filled = this.classList.contains('filled')
      const idStringArray = this.id.split('-')
      const x = parseInt(idStringArray[2], 10)
      const y = parseInt(idStringArray[3], 10)
      if (filled) {
        document.getElementById('matrix-element-' + x + '-' + y).classList.add('filled')
        document.getElementById('matrix-element-' + y + '-' + x).classList.add('filled')
      } else {
        document.getElementById('matrix-element-' + x + '-' + y).classList.remove('filled')
        document.getElementById('matrix-element-' + y + '-' + x).classList.remove('filled')
      }
      // update Vectors List
      
      const vEls = document.querySelectorAll('[data-vector-number="' + i + '"]')
      // console.log(vEls)
      let vector = []
      vEls.forEach(el => {
        vector.push(el.classList.contains('filled'))
      })
      // console.log('vector', vector)
      const stringRepresentation = vector.map(el => el ? '1' : '0').reverse().join('')
      const number = parseInt(stringRepresentation, 2)
      // console.log('string representation', stringRepresentation, number)
      
      b10ArrayAfter[i] = number
      // console.log('b10ArrayAfter', b10ArrayAfter)
      // graphEl.querySelector('span.starting-vectors').innerText = b10ArrayAfter
      const vectorString = b10ArrayAfter.join(',')
      graphEl.querySelector('input[name="name"]').value = vectorString
      graphEl.querySelector('span.vector-string').textContent = vectorString
      const complianceVector = Library.validateVectorString(vectorString)
      applyComplianceVector(svg, complianceVector)
    })  
  }

  function applyComplianceVector (svg, complianceVector) {
    if (complianceVector.length !== b2Array.length) {
      console.log('applyComplianceVector found to be the incorrect length')
      return
    }
    complianceVector.forEach((element, i) => {
      const originCircle = svg.getElementById('matrix-element-' + i + '-' + i)
      if (element === true) {
        originCircle.classList.remove('compliant')
        originCircle.classList.remove('non-compliant')
        originCircle.classList.add('compliant')
      } else {
        originCircle.classList.remove('non-compliant')
        originCircle.classList.remove('compliant') 
        originCircle.classList.add('non-compliant')
      }
    })

  }

  function addOriginCircle (svg, x, y, i) { // in offset coordinates
    const circle = document.createElementNS(NS,'circle')
    circle.setAttribute('cx', xOffset(x))
    circle.setAttribute('cy', yOffset(y))
    circle.setAttribute('r', circleRadius)
    circle.id = 'matrix-element-' + i + '-' + i
    circle.setAttribute('stroke', 'black')
    circle.style = ''
    circle.classList.add('origin-circle')
    svg.appendChild(circle)
    const text = document.createElementNS(NS, 'text')
    text.classList.add('origin-circle')
    text.textContent = i
    text.setAttribute('font-family', 'Verdana')
    text.setAttribute('stroke', 'black')
    text.setAttribute('stroke-width', 0.5)
    text.setAttribute('font-size', circleRadius)
    text.setAttribute('x', xOffset(x) - circleRadius / 3)
    const digits = i.toString().length
    text.setAttribute('dx', (1 - digits) * circleRadius / 3)
    text.setAttribute('y', yOffset(y) + circleRadius / 3)
    text.id = 'matrix-element-label-' + i + '-' + i
    svg.appendChild(text)
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
  
  function addSolidLine (svg, x1, y1, x2, y2) { // in offset coordinates
    const line = document.createElementNS(NS, 'line')
    line.setAttribute('x1', xOffset(x1))
    line.setAttribute('y1', yOffset(y1))
    line.setAttribute('x2', xOffset(x2))
    line.setAttribute('y2', yOffset(y2))
    line.setAttribute('stroke', 'black')
    line.classList.add('solid-guideline')
    svg.appendChild(line)
  }

  function addDashedLine (svg, x1, y1, x2, y2) { // in offset coordinates
    const line = document.createElementNS(NS, 'line')
    line.setAttribute('x1', xOffset(x1))
    line.setAttribute('y1', yOffset(y1))
    line.setAttribute('x2', xOffset(x2))
    line.setAttribute('y2', yOffset(y2))
    line.setAttribute('stroke', 'black')
    line.setAttribute('stroke-dasharray', '2')
    line.classList.add('dashed-guideline')
    svg.appendChild(line)
  }
}

module.exports = init
