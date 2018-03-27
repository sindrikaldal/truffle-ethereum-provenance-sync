import ProvenanceContract from '../../../../build/contracts/Provenance.json'
import store from '../../../store'

const contract = require('truffle-contract')
const crypto   = require('crypto')

export const PROVENANCE_UPDATED = 'PROVENANCE_UPDATED'
function provenanceUpdated(user) {
  return {
    type: PROVENANCE_UPDATED,
    payload: user
  }
}

// A helper function to add a element to a map whose values are arrays
function addToMap(map, key, element, type) {
  let value = map.get(key);
  if (value === undefined) {
    value = [];
  }
  value.push(element)
  map.set(key, value);
  return map;
}

// Function to add elements to the proofs that are generated to verify
// that the elements re a part of the merkle root to be submitted to the blockchain
function addProofs(proofs, hashes, generatedHashes, leftHash, rightHash, combinedHash) {

  // Iterate throught the hashes of the elements that we're 'anchoring'
  for (let i = 0; i < hashes.length; i++) {
    // Check both right and left hash and see if which node in lower layers generated it
    if (generatedHashes.get(hashes[i]).includes(leftHash)) {
      // Once we find the nodes that generated the hash we add the the 'other' hash
      // to the proof of the opposite node
      proofs = addToMap(proofs, hashes[i], {"side" : "right", "value" : rightHash}, "proofs")
      generatedHashes = addToMap(generatedHashes, hashes[i], combinedHash, "generated hashes")
    }
    // Same as above
    if (generatedHashes.get(hashes[i]).includes(rightHash)) {
      proofs = addToMap(proofs, hashes[i], {"side" : "left", "value" : leftHash}, "proofs")
      generatedHashes = addToMap(generatedHashes, hashes[i], combinedHash, "generated hashes")
    }
  }
  return proofs, generatedHashes;
}

// A function that takes in elements to be hashed together to create
// a merkletree. This function then returns the merkle root and proof
// for each element that can be used to verify that it's part of the tree
let generateMerkleTree = (elements) => {

  let numberOfMerkleLeafs = 8;     // The maximum number of elements that can be submitted (at the moment)
  let merkleNodes = [];            // An array that will contain the hashes of the merkle tree
  let proofs = new Map();          // A map structure that will contain hash(element) => array(proofs for element)
  let generatedHashes = new Map(); // A map structure used for helping in the construction the proofs map

  // Elements cannot be undefined
  if (elements.includes(undefined)) {
    console.log("An element cannot be undefined.")
    return null;
  }

  // Adjust the number of merkle leafs if the number of elements is greater than 8.
  // The number of merkleleafs is always set to a number that is a power of 2 for a
  // well balanced merkle tree and predictability in calculations
  if (elements.length > 8)  {
    while (numberOfMerkleLeafs < elements.length) {
      numberOfMerkleLeafs *= 2;
    }
  }

  // First layer is the number of leafs
  let numberOfNodesInLayer = numberOfMerkleLeafs;

  // Generate the hashes of the elements
  const hashes = elements.map(element => crypto.createHash('sha256').update(element).digest("hex"));

  // Populate the helper hash array that will be used to generate proofs
  for(let i = 0; i < hashes.length; i++) {
    generatedHashes.set(hashes[i], [hashes[i]]);
  }

  // Generate random merkle leafs. The hashes of the elments will replace some of them
  for(let i = 0; i < numberOfNodesInLayer; i++) {
    merkleNodes.push(crypto.createHash('sha256').update(crypto.randomBytes(20).toString('hex')).digest("hex"));
  }

  // Generate N random numbers where N is the amount of elements.
  // The random numbers represent where the elements will be placed among the merkleleafs
  let randomNumbers = []
  while (randomNumbers.length < elements.length) {
    let randomNumber = Math.floor(Math.random() * ((numberOfMerkleLeafs - 1) - 0));
    if (!randomNumbers.includes(randomNumber)) {
      randomNumbers.push(randomNumber);
    }
  }

  // Replace the random hashes randomly chosen with the hash of the elements
  for (let i = 0; i < randomNumbers.length; i++) {
    merkleNodes[randomNumbers[i]] = hashes[i];
  }

  // An index to keep track of how many nodes have been processed
  let merkleIndex = 0;

  // Loops through the merkle tree while building it. The tree is stored in an array where the first element
  // is the bottom leaf to the left. It then goes from left to right up the layers until it hits the merkle root
  while(numberOfNodesInLayer >= 2) {
    for(let i = merkleIndex; i < (merkleIndex +numberOfNodesInLayer); i += 2) {
      let combinedHash = crypto.createHash('sha256').update(merkleNodes[i] + merkleNodes[i + 1]).digest("hex");
      merkleNodes.push(combinedHash);
      proofs, generatedHashes = addProofs(proofs, hashes, generatedHashes, merkleNodes[i], merkleNodes[i + 1], combinedHash);
    }
    merkleIndex += numberOfNodesInLayer
    numberOfNodesInLayer /= 2;
  }

  // Return the merkle root and proofs for each element submitted
  return {"merkleRoot" : merkleNodes[merkleNodes.length - 1], "proofs" : proofs};
}

export function updateProvenance(provenanceData) {
  let web3 = store.getState().web3.web3Instance

  // Double-check web3's status.
  if (typeof web3 !== 'undefined') {

    return function(dispatch) {
      // Using truffle-contract we create the authentication object.
      const provenance = contract(ProvenanceContract)
      provenance.setProvider(web3.currentProvider)

      // Declaring this for later so we can chain functions on Authentication.
      var provenanceInstance

      // Get current ethereum wallet.
      web3.eth.getCoinbase((error, coinbase) => {
        // Log errors, if any.
        if (error) {
          console.error(error);
        }

        provenance.deployed().then(function(instance) {
          provenanceInstance = instance

          // Generate merkle root that will be posted on the blockchain

          // var elements = ['Hello World', 'Something Else', 'This needs to be more complicated'];

          var merkleRoot = generateMerkleTree(provenanceData)

          provenanceInstance.setProvenanceRoot(merkleRoot, {from: coinbase})
          .then(function(result) {
            // If no error, update user.
            dispatch(provenanceUpdated({"merkleRoot": merkleRoot}))
            return alert('Name updated!')
          })
          .catch(function(result) {
            // If error...
          })
        })
      })
    }
  } else {
    console.error('Web3 is not initialized.');
  }
}
