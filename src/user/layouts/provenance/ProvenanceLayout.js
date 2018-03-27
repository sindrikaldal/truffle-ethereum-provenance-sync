import React, { Component } from 'react'
import ProvenanceFormContainer from '../../ui/provenanceform/ProvenanceFormContainer'

class Provenance extends Component {
  render() {
    return(
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>Anchor Provenance Data</h1>
            <p>Add files to sync to the Ethereum blockchain.</p>
            <ProvenanceFormContainer />
          </div>
        </div>
      </main>
    )
  }
}

export default Provenance
