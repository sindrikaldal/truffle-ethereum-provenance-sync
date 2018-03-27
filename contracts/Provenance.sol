pragma solidity ^0.4.2;

import './zeppelin/ownership/Ownable.sol';

contract Provenance {

  // Variables
  bytes32 provenanceRoot;
  mapping(bytes32 => bytes32) lineage;

  // Events
  event ProvenanceChanged(bytes32 _provenance, address _modifier);

  // Public functions
  function setProvenanceRoot(bytes32 _provenanceRoot) public returns (bool) {

    // Assign the new provenance
    lineage[provenanceRoot] = _provenanceRoot;
    provenanceRoot = _provenanceRoot;

    // Trigger the event and return true
    ProvenanceChanged(provenanceRoot, msg.sender);
    return true;
  }

  function getProvenanceRoot() public constant returns (bytes32) {
    return provenanceRoot;
  }

  function getLineageProvenance(bytes32 provenance) public constant returns (bytes32) {
    return lineage[provenance];
  }
}
