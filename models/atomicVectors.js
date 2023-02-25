const atomicVectors = {}
const allVectors = {}
const scale = 6 // must be even
/*
{
   vectors: [
     {
       asString: '111',
       asBooleanVector: [true, true, true]
       immediateChildrenComplete: true,
       vectors: [
           {
              asString: '0111',
              asBooleanVector: [false, true, true. true],
              vectors: [],
              immediateChildrenComplete: false,
          },
          {
             asString: '1011',
             asBooleanVector: [true, false, true, true],
             vectors: [],
             immediateChildrenComplete: false,
         },
         {
            asString: '1101',
            asBooleanVector: [true, true, false, true],
            vectors: [],
            immediateChildrenComplete: false,
        },
        {
           asString: '1110',
           asBooleanVector: [true, true, true, false]
           vectors: [],
           immediateChildrenComplete: false,
       },
      ]
    }
  ],
  asString: '111',
  asBooleanVector: [true, true, true],
  immediateChildrenComplete: true
}

*/

function createAtomicVectors (vectors, asString, exitLength) {
  // console.log('createAtomicVectors starting as ' + asString)
  vectors.asString = asString
  vectors.vectors = []
  vectors.asBooleanVector = asString.split('').map(char => char === '1')
  if (vectors.asBooleanVector.length === exitLength) {
    return
  }
  for (let i = 0; i < vectors.asBooleanVector.length + 1; i++) { // 0 to n
    const _asBooleanVector = JSON.parse(JSON.stringify(vectors.asBooleanVector))
    // console.log(_asBooleanVector);
    _asBooleanVector.splice(i, 0, false)
    // console.log(_asBooleanVector)
    const newCharVector = _asBooleanVector.map(b => b ? '1' : '0')
    const newVector = {
      asString: newCharVector.join(''),
      asBooleanVector: _asBooleanVector,
      immediateChildrenComplete: false
    }
    const fullString = newVector.asString.concat(new Array(exitLength - newVector.asString.length).fill('0').join(''))
    vectors.vectors.push(newVector)
    // const fullBooleanVector = _asBooleanVector.concat(new Array(exitLength - _asBooleanVector.length).fill(false))
    allVectors[parseInt(fullString, 2)] = fullString
    // console.log(newVector.asString);
  }
  vectors.immediateChildrenComplete = true
  vectors.vectors.forEach(v => createAtomicVectors(v, v.asString, exitLength))
}

exports.scale = function (requestedScale) {
  if (requestedScale % 2 !== 0) {
    console.log('Scale of atomicVectors must be an even number')
  } else {
    scale = requestedScale
  }
}

exports.getScale = function () {
  return scale
}

exports.all = function () {
  return allVectors
}

exports.init = function () {
  return new Promise ((resolve, reject) => {
    if (Object.keys(allVectors).length > 0) {
      return resolve(allVectors)
    }
    createAtomicVectors(atomicVectors, '111', scale) // 3-ordinal, up to length 6
    // console.log(JSON.stringify(atomicVectors, null, 4));
    console.log(allVectors);
    console.log('length ' + Object.keys(allVectors).length);
    return resolve(allVectors)
  })
}

exports.vectors = atomicVectors
