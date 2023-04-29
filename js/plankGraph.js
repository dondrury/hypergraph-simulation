const excessVectorPadding = 2
const NS = 'http://www.w3.org/2000/svg'
// const padding = 20


function init () {
  console.log('init')
  if (document.getElementsByClassName('plank-graph').length > 0) {
    Array.from(document.getElementsByClassName('plank-graph')).forEach(createGraph)
  }
}

function createGraph (graphEl) { // in standard cartesian coordinates
  const circleRadius = 12
  const increment = circleRadius * 4
  console.log('create graph')
  const b10Array = sanitizeInputNumbers(graphEl.dataset.numbers)
  const b2Array = b10tob2Array(b10Array, excessVectorPadding)
  const scale = b2Array[0].length
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
  graphEl.appendChild(svg)
  addSolidLine(svg, 0, 0, width, 0)
  
  for (let i = 0; i < vectorCount; i++) {
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, scale * increment) //solid guide line
    addSolidLine(svg, i * increment, 0, (i + scale) * increment, - scale * increment) //solid guide line
    addOriginCircle(svg, i * increment, 0, i) // origins
    addVectorCircles(svg, i)
  }

  function addVectorCircles (svg, i) { // in offset coordinates, i is vector number
    const vector = b2Array[i].split('').reverse().join('')
    console.log('vectorValue', vector)
    for (let j = 0; j < scale; j++) {
      const topCircle = document.createElementNS(NS,'circle')
      // top circles
      topCircle.setAttribute('cx', xOffset((i) * increment + (j + 1) * increment / 2))
      topCircle.setAttribute('cy', yOffset((j + 1) * increment/2))
      topCircle.setAttribute('r', circleRadius)
      topCircle.id = i + '-' + j
      topCircle.style = 'stroke-width:1;stroke:black'
      topCircle.setAttribute('fill', vector[j] === '1' ? 'black' : 'white')
      svg.appendChild(topCircle)
      // bottom circles
      const bottomCircle = document.createElementNS(NS,'circle')
      bottomCircle.setAttribute('cx', xOffset((i) * increment + (j + 1) * increment / 2))
      bottomCircle.setAttribute('cy', yOffset((-j - 1) * increment/2))
      bottomCircle.setAttribute('r', circleRadius)
      bottomCircle.id = i + '-' + j
      bottomCircle.style = 'stroke-width:1;stroke:black'
      bottomCircle.setAttribute('fill', vector[j] === '1' ? 'black' : 'white')
      svg.appendChild(bottomCircle)
    }
  }

  function addOriginCircle (svg, x, y, txt) { // in offset coordinates
    const circle = document.createElementNS(NS,'circle')
    circle.setAttribute('cx', xOffset(x))
    circle.setAttribute('cy', yOffset(y))
    circle.setAttribute('r', circleRadius)
    circle.style = 'fill:white;stroke-width:1;'
    svg.appendChild(circle)
    const text = document.createElementNS(NS, 'text')
    text.textContent = txt
    text.setAttribute('font-family', 'Verdana')
    text.setAttribute('stroke', 'black')
    text.setAttribute('stroke-width', 0.5)
    text.setAttribute('font-size', circleRadius)
    text.setAttribute('x', xOffset(x) - circleRadius / 2)
    text.setAttribute('y', yOffset(y) + circleRadius / 3)
    // text.setAttributeNS(NS, 'text-anchor', 'middle')
    svg.appendChild(text)
    // svg.appendChild(g)
  }
  
  function addSolidLine (svg, x1, y1, x2, y2) { // in offset coordinates
    const line = document.createElementNS(NS, 'line')
    line.setAttribute('x1', xOffset(x1))
    line.setAttribute('y1', yOffset(y1))
    line.setAttribute('x2', xOffset(x2))
    line.setAttribute('y2', yOffset(y2))
    line.setAttribute('stroke', 'black')
    line.classList.add('solid-guidline')
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
