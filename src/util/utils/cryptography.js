crypto = require('crypto'),

const generateMerkleTree = (elements) => {

  let numberOfMerkleLeafs = 8;
  var merkleLeafs = [];
  var merkleNodes = [];
  var merkleRoot = "";
  var proofs = {};

  if (elements.length > 8)  {
    console.log("Too many elements. Application logic not implemented yet")
    return null;
  }

  // First layer is the number of leafs
  var numberOfNodesInLayer = numberOfMerkleLeafs;

  // Generate the hashes of the elements
  const hashes = elements.map(element => crypto.createHash('sha256').update(element).digest("hex"));

  // Generate random merkle leafs. The hashes of the elments will replace some of them
  for(var i = 0; i < numberOfMerkleLeafs; i++) {
    merkleLeafs.push(crypto.createHash('sha256').update(crypto.randomBytes(20).toString('hex')).digest("hex"));
  }

  // Generate N random numbers where N is the amount of elements.
  // The random numbers represent where the elements will be placed among the merkleleafs
  var randomNumbers = []
  while (randomNumbers.length < elements.length) {
    var randomNumber = Math.random() * (0 - (numberOfMerkleLeafs - 1));
    if (!randomNumbers.includes(randomNumber)) {
      randomNumbers.push(randomNumber);
    }
  }

  // Replace the random hashes randomly chosen with the hash of the elements
  for (var i = 0; i < randomNumers.length; i++) {
    merkleLeafs[randomNumbers[i]] = hashes[i];
  }

  // Generate the second layer
  for(var i = 0; i < numberOfNodesInLayer; i = i + 2) {
    merkleNodes.push(crypto.createHash('sha256').update(merkleLeafs[i] + merkleLeafs[i + 1]).digest("hex"))
    var leftHashIndex = hashes.indexOf(merkleLeafs[i])
    var rightHashIndex = hashes.indexOf(merkleLeafs[i + 1])

    if (leftHash != -1) {
      proofs[merkleLeafs[leftHash]] = [{"side" : "right", "value" : rightHash}]
    }
    if (rightHash != -1) {
      proofs[merkleLeafs[rightHash]] = [{"side" : "left", "value" : leftHash}]
    }

  }

  nubmerOfNodesInLayer = numberOfNodesInLayer / 2;

  // Generate the third layer
  for(var i = 0; i < numberOfNodesInLayer; i = i + 2) {
    merkleNodes.push(crypto.createHash('sha256').update(merkleNodes[i] + merkleNodes[i + 1]).digest("hex"))
  }

  nubmerOfNodesInLayer = numberOfNodesInLayer / 2;

  // Generate the merkle root
  merkleRoot = crypto.createHash('sha256').update(merkleNodes[merkleNodes.length - 2] + merkleNodes[merkleNodes.length - 2]).digest("hex")
}




export default generateMerkleRoot
