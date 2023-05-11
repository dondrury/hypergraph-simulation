exports.validateVectorString = function(vectorString) {
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
  console.log('vectors', vectors) // example [ "1101", "1101", "0000", "1001", "0010", "0010", "1010", "0000", "1000", "0000", … ]
  let resultsArray = []
  for(let j = 0; j < vectors.length; j++) { // j is the "row" or number of vector
    let count = 0
    console.log('j', j)
    for(let i = 0; i < vectors[j].length; i++) {
      if (vectors[j][i] === '1') count++
      console.log('rightwardVectorIndes',j,i)
      const leftwardVector = (vectors.length + j - i) % (vectors.length)
      console.log('leftwardVectorIndeces', leftwardVector, i)
      if (vectors[leftwardVector][i] === '1') count++
    }
    resultsArray.push(count === 3)
  }
  console.log('resultsArray', resultsArray)
  return resultsArray
}

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