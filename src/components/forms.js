import React, { Component } from 'react';
import { Form } from 'semantic-ui-react';

class NewPlayerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      names: {
        name1: '',
        name2: '',
        name3: '',
        name4: '',
        name5: '',
      },
    };
  }

  get names() {
    return this.state.names;
  }

  handleChange = (event) => {
    const { names } = this.state;
    names[event.target.name] = event.target.value;
    this.setState(names);
  }

  render() {
    return (
      <Form>
        {Object.entries(this.state.names).map(([key, name]) => (
          <Form.Input
            onChange={this.handleChange}
            key={key}
            name={key}
            fluid
            placeholder="Name"
            value={name}
          />
        ))}
      </Form>
    );
  }
}

class GameSettingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stackSizeInGBP: this.props.gameSetting.stackSize / 100,
      buyInAllowanceInGBP: this.props.gameSetting.buyInAllowance / 100,
    };
  }

  handleStackSizeChange = (event) => {
    this.setState({ stackSizeInGBP: event.target.value });
  }

  handleAllowanceChange = (event) => {
    this.setState({ buyInAllowanceInGBP: event.target.value });
  }

  render() {
    return (
      <Form>
        <Form.Input
          autoFocus
          icon="gbp"
          iconPosition="left"
          onChange={this.handleStackSizeChange}
          fluid
          placeholder="Stack Size"
          label="Stack Size"
          value={this.state.stackSizeInGBP}
        />
        <Form.Input
          icon="gbp"
          iconPosition="left"
          onChange={this.handleAllowanceChange}
          fluid
          placeholder="Buy-In Limit"
          label="Buy-In Limit"
          value={this.state.buyInAllowanceInGBP}
        />
      </Form>
    );
  }
}


class CashoutForm extends Component {
  handleCashoutAmountChange = (event) => {
    const amountInGBP = event.target.value;
    this.props.setCashoutAmount(amountInGBP * 100);
  }

  render() {
    return (
      <Form>
        <Form.Input
          autoFocus
          type="number"
          icon="gbp"
          iconPosition="left"
          onChange={this.handleCashoutAmountChange}
          placeholder="Amount"
          value={this.props.cashoutAmount / 100 || ''}
        />
      </Form>
    );
  }
}

export { NewPlayerForm, GameSettingForm, CashoutForm };
