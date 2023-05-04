const excessVectorPadding = 2
const NS = 'http://www.w3.org/2000/svg'
// const padding = 20
const layout = `
<div class="pg-container">
  <h3 class="title">Plank Graph starting at (<span class="starting-vectors"></span>)</h3>
  <div class="svg-container"></div>
  <style>
    .pg-container svg.plank circle{
      fill: white;
      stroke: black;
      stroke-width: 1px;
    }

    .pg-container svg.plank circle.matrix-element:hover {
      stroke: red;
    }
    .pg-container svg.plank circle.filled{
      fill: black;
    }

    .pg-container svg.plank circle.origin-circle {
      fill: #ff9191;
      stroke-width: 1px;
    }
    .pg-container svg.plank circle.origin-circle.compliant {
      fill: #9aff91;
    }
  </style>
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
  const b10Array = sanitizeInputNumbers(graphEl.dataset.starting)
  graphEl.querySelector('span.starting-vectors').innerText = graphEl.dataset.starting
  const b2Array = b10tob2Array(b10Array, excessVectorPadding)
  const scale = b2Array[0].length
  // console.log('scale', scale)
  // var matrix = createNewMatrix(scale + b2Array.length)
  // console.log(matrix)
  const vectorCount = b2Array.length
  console.log('b2Array', b2Array)
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
    addVectorCircles(svg, i) // important dots
    addOriginCircle(svg, i * increment, 0, i) // origins on diagonal
    updateOriginCircle(i)
  }

  function createNewMatrix(size) {
    let temp = new Array(size)
    for (let i = 0; i < size; i++) {
      temp[i] = new Array(size).fill(false)
    }
    console.log(temp)
    return temp
  }

  function updateMatrix(y, x, val) {
    // console.log('update ', y, x)
    try {
      matrix[y][x] = val
    } catch (e) {
      // no worries it may not be there
    }
  }

  // end main createGraph body

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
      // add user interaction
      addUserInteraction(topCircle, i, j)
      addUserInteraction(bottomCircle, i, j)
    }

    function addUserInteraction (circle, i, j) {
      circle.addEventListener('click', function (event) {
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
        updateOriginCircle(x)
        updateOriginCircle(y)
      })
    }
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
  }

  function updateOriginCircle (x) { // use mod to wrap around to front, straight from the DOM
   // x can be the row, it really doesn't matter which
   let rowCount = 0
   for(let j = 0; j < scale * 2 ; j++) {
    // console.log({j})
    // const filled = document.getElementById('matrix-element-' + (x % vectorCount) + '-' + (j % vectorCount)).classList.contains('filled')
    // console.log(x % vectorCount, j % vectorCount)
    const element = document.getElementById('matrix-element-' + (x % vectorCount) + '-' + (j % vectorCount))
    if (element && element.classList.contains('filled')) rowCount++
   }
   if (rowCount === 3) {
    document.getElementById('matrix-element-' + x + '-' + x).classList.add('compliant')
   } else {
    document.getElementById('matrix-element-' + x + '-' + x).classList.remove('compliant')
   }
   console.log({rowCount})
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





function sanitizeInputNumbers (nums) {
  if (typeof nums !== 'string') {
    console.log('array of input numbers should be a string')
    return
  }
  const b10Array = []
  nums.split(',').forEach(num => {
    try {
      const b10num = parseInt(num, 10)
      // console.log(b10num)
      if (isNaN(b10num)) throw new Error('not a number=' + num)
      b10Array.push(b10num)
    } catch (e) {
      console.error(e)
    }
  })
  // console.log('b10Array', b10Array)
  return b10Array
}

function b10tob2Array (b10Array, padding) {
  let maxScale = 0
  let b2Array = b10Array.map(num => {
    let binaryString = num.toString(2)
    // console.log(num, binaryString)
    if (binaryString.length > maxScale) maxScale = binaryString.length
    return binaryString
  })
  // console.log('maxScale', maxScale)
  b2Array = b2Array.map(b2numString => {
    return b2numString.padStart(maxScale + padding, '0')
  }) 
  return b2Array
}

module.exports = init
