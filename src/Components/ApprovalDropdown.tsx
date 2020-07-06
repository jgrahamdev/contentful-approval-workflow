import * as React from 'react';
import { render } from 'react-dom';
import { SelectField, Option } from '@contentful/forma-36-react-components';
import { init, FieldExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';

interface AppProps {
  sdk: FieldExtensionSDK;
}

interface AppState {
  value?: string;
}

export class ApprovalDropdown extends React.Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);

    this.state = {
      value: props.sdk.field.getValue() || '',
      selectOptions: [],
      editorialApproval: props.sdk.entry.fields['editorialApproval'].getValue(),
      techApproval: props.sdk.entry.fields['techApproval'].getValue(),
    };
  }

  detachValueChangeHandler: Function | null = null;
  detachEditorialChangeHandler: Function | null = null;
  detachTechChangeHandler: Function | null = null;

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachValueChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalValueChange);
    this.detachEditorialChangeHandler = this.props.sdk.entry.fields['editorialApproval'].onValueChanged(this.onEditorialApprovalChange);
    this.detachTechChangeHandler = this.props.sdk.entry.fields['techApproval'].onValueChanged(this.onTechApprovalChange);

    this.setOptions();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
        this.state.editorialApproval !== prevState.editorialApproval ||
        this.state.techApproval !== prevState.techApproval
      ) {
      this.setOptions();
    }
  }

  componentWillUnmount() {
    if (this.detachValueChangeHandler) {
      this.detachValueChangeHandler();
    }

    if (this.detachEditorialChangeHandler) {
      this.detachEditorialChangeHandler();
    }

    if (this.detachTechChangeHandler) {
      this.detachTechChangeHandler();
    }
  }

  onExternalValueChange = (value: string) => {
    this.setState({value: value});
  };

  onEditorialApprovalChange = (value) => {
    this.setState({editorialApproval: value})
  }

  onTechApprovalChange = (value) => {
    this.setState({techApproval: value})
  }

  onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    this.setState({ value: value });
    if (value) {
      await this.props.sdk.field.setValue(value);
    } else {
      await this.props.sdk.field.removeValue();
    }
  };

  setOptions = async () => {
    let options = [];

    //Check for field validations that will allow us to create a dropdown.
    let val = Array.isArray(props.sdk.field.validations) ? props.sdk.field.validations.find(val => val.hasOwnProperty('in')) : undefined;

    if (val) {
      let sys = {
        type: 'Entry',
        contentType: {
          sys: {
            id: props.sdk.ids.contentType,
            linkType: "ContentType",
            type: "Link"
          }
        }
      }

      for (let option of val.in) {
        let validOption = false;
        switch (option) {
          case 'Draft':
            validOption = await props.sdk.access.can('create', {sys: sys})
            break;
          case 'Needs Review':
            validOption = await props.sdk.access.can('update', {sys: sys, fields:{approvalStatus: {'en-US': "Needs Review"}}})
            break;
          case 'Needs Changes':
            validOption = (
              await props.sdk.access.can('update', {sys: sys, fields: {editorialApproval: {'en-US': true}}}) ||
              await props.sdk.access.can('update', {sys: sys, fields: {techApproval: {'en-US': true}}}))
            )
            break;
          case 'Ready for Publication':
            validOption = (
              await props.sdk.access.can('publish', {sys: sys})
              && this.state.editorialApproval
              && this.state.techApproval
            )
            break;
        }

        if (validOption) {
          options.push(option);
        }
      }
    }

    if (options.length > 0) {
      this.setState({selectOptions: options})
    }
  }


  render = () => {
    return (
      <SelectField
        id="approval-select"
        name="approval-select"
        labelText=""
        required={false}
        selectProps={{
          isDisabled: false,
          width: 'medium'
        }}
        value={this.state.value}
        onChange={this.onChange}
      >
        {this.state.selectOptions.map((opt) => {
          return <Option key={opt} value={opt}>{opt}</Option>
        })}
      </SelectField>
    );
  };
}
