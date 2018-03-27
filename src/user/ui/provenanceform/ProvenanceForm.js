import React, { Component } from 'react'

class ProvenanceForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      input_data: {},
      inputs: ['input-0']
    }
  }

  onInputChange(input, event) {
    const _input_data = this.state.input_data;
    _input_data[input] = event.target.value
    this.setState({input_data : _input_data })
  }

  handleSubmit(event) {
    event.preventDefault()

    const return_data = [];
    for (var i = 0; i < this.state.inputs.length; i++) {
      return_data.push(this.state.input_data[this.state.inputs[i]])
    }

    if (!return_data.includes('undefined')) {
        this.props.onProvenanceFormSubmit(return_data)
    }
  }

  appendInput() {
    var newInput = "input-" + this.state.inputs.length;
    this.setState({ inputs: this.state.inputs.concat([newInput]) });
  }

  render() {
    return(
      <form className="pure-form pure-form-stacked" onSubmit={this.handleSubmit.bind(this)}>
        <fieldset>
          <label htmlFor="name">Data</label>
          {this.state.inputs.map(input_element => <input id="input" key={input_element} type="text" onChange={this.onInputChange.bind(this, input_element)} placeholder="Data to be anchored on the blockchain" />)}
          <span className="pure-form-message">This is a required field.</span>
          <br />

          <button type="submit" className="pure-button pure-button-primary">Update</button>
          <button type="button" onClick={() => this.appendInput() } className="pure-button pure-button-primary">Add input field</button>
        </fieldset>
      </form>
    )
  }
}

export default ProvenanceForm
