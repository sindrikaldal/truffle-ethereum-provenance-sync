import { connect } from 'react-redux'
import ProvenanceForm from './ProvenanceForm'
import { updateProvenance } from './ProvenanceFormActions'

const mapStateToProps = (state, ownProps) => {
  return {
    inputs: state.inputs
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onProvenanceFormSubmit: (input_data) => {
      event.preventDefault();
      dispatch(updateProvenance(input_data))
    }
  }
}

const ProvenanceFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProvenanceForm)

export default ProvenanceFormContainer
