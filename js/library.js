function validateVectorString (vectorString) {
  // console.log(vectorString)
  const base10Array = vectorStringToBase10Array(vectorString)
  const base2Array = base10ArrayToBase2Array(base10Array, 0)
  // console.log('base2Array', base2Array)
  //  each vector still in reverse order and still a string base 2
  const vectors = base2Array.map(vectorString => {
    const inGraphOrderArray = vectorString.split('').reverse()
    inGraphOrderArray.unshift('0')
    return inGraphOrderArray.join('')
  })
  // console.log('vectors', vectors) // example  [ "01100", "00001", "01100", "00001", "01100", "00001", "01100", "00001", "01100", "00001", … ]
  let resultsArray = []
  for(let j = 0; j < vectors.length; j++) { // j is the "row" or number of vector
    let count = 0
    // console.log('j', j)
    for(let i = 0; i < vectors[j].length; i++) {
      if (vectors[j][i] === '1') count++
      // console.log('rightwardVectorIndes',j,i)
      const leftwardVectorIndex = (vectors.length + j - i) % (vectors.length)
      // console.log('leftwardVectorIndeces', leftwardVector, i)
      if (vectors[leftwardVectorIndex][i] === '1') count++
    }
    resultsArray.push(count === 3)
  }
  // console.log('resultsArray', resultsArray)
  return resultsArray
}

exports.validateVectorString = validateVectorString

function makeSparseMatrix (vectorString) {
  const base10Array = vectorStringToBase10Array(vectorString)
  const base2Array = base10ArrayToBase2Array(base10Array, 0)
  // console.log('base2Array', base2Array)
  //  each vector still in reverse order and still a string base 2
  const vectors = base2Array.map(vectorString => {
    const inGraphOrderArray = vectorString.split('').reverse()
    inGraphOrderArray.unshift('0')
    return inGraphOrderArray.join('')
  })
 
  // console.log('vectors in makeSparseMatrix', vectors)
  const sparseMatrix = []
  for( let m = 0; m < vectors.length; m++) { // make l x l matrix
    const row = new Array(vectors.length).fill('0') // recursive fills leaves behind pointers apparently!
    sparseMatrix.push(row)
  }
  // console.log('sparseMatrix', sparseMatrix)
  for(let j = 0; j < vectors.length; j++) { // j is the "row" or number of vector
    for(let i = 0; i < vectors[j].length; i++) { // i is the index of the vector, with origin
      if (vectors[j][i] === '1') { // this is a 'dot' on the interactive view, regarding element j
        const rightwardVectorIndex = (j + i) % vectors.length
        // console.log('(j, rightwardVectorIndex)', j, rightwardVectorIndex)
        sparseMatrix[j][rightwardVectorIndex] = '1'
        sparseMatrix[rightwardVectorIndex][j] = '1'
      }
    }
    
  }
  // console.log('sparseMatrix', sparseMatrix)
  return sparseMatrix
  
}

exports.makeSparseMatrix = makeSparseMatrix

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

exports.vectorStringToBase10Array = vectorStringToBase10Array

function createRelationsObjectFromSparseMatrix (matrix) {
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
  const relations = {}
  for (let j = 0; j < matrix.length; j++ ) {
    for (let i = 0; i < matrix[j].length; i++) {
      if (matrix[j][i] === '1') {
        if (typeof relations[j] !== 'object' ) {
          relations[j] = {}
        }
        relations[j][i] = true
      }
    }
  }
  return relations
}

exports.createRelationsObjectFromSparseMatrix = createRelationsObjectFromSparseMatrix

function base10ArrayToBase2Array(b10Array, padding) {
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


exports.base10ArrayToBase2Array = base10ArrayToBase2Array

function allWorldpathsFromRelationsObject (relationsObject, startingIndex, maxDepth) {
  const worldPaths = [[startingIndex]]
  appendWorldPath(worldPaths[0])

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
  return worldPaths
}

exports.allWorldpathsFromRelationsObject = allWorldpathsFromRelationsObject

function shellsFromWorldPaths (worldPaths) {
  const shells = []
  let maxDepth = 0
  for (let i = 0; i < worldPaths.length; i++) {
    if (worldPaths[i].length > maxDepth) maxDepth = worldPaths[i].length
  }
  for (let i = 0; i <= maxDepth; i++) {
   shells.push({
     shellNumber: i,
     totalWorldPaths: 0,
     endingElements: [],
     endingPathCounts: {},
     deltaEndingElements: 0,
     closedWorldPaths: 0,
     openWorldpaths: 0
   })
  }
 //  console.log('shellsEmpty', shells)
  for (const i in worldPaths) {
   const worldPath = worldPaths[i]
   // console.log(worldPath)
   const pathLength = worldPath.length
   // console.log(pathLength)
   shells[pathLength].totalWorldPaths++
   const endingElement = worldPath[worldPath.length - 1]
   // console.log({endingElement})
   if (!shells[pathLength].endingElements.includes(endingElement)) {
     shells[pathLength].endingElements.push(endingElement)
     shells[pathLength].endingPathCounts[endingElement] = 1
     shells[pathLength].openWorldpaths++
   } else { // element already in list
     if (typeof shells[pathLength].endingPathCounts[endingElement] === 'number' ) {
       shells[pathLength].endingPathCounts[endingElement]++
     }
     shells[pathLength].closedWorldPaths++
   }
  }
 //  console.log('shells', shells)
  for (let i = 0; i < shells.length; i++) {
   if (i !== 0) {
     shells[i].deltaEndingElements = shells[i].endingElements.length - shells[i - 1].endingElements.length 
   }
  }
  return shells
}

exports.shellsFromWorldPaths = shellsFromWorldPaths