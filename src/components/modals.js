import React, { Component } from 'react';
import { Button, Icon, Modal } from 'semantic-ui-react';
import { NewPlayerForm, GameSettingForm, CashoutForm } from './forms';
import formattedMoney from './formattedMoney';

class CashOutModal extends Component {
  cashoutForm = null;

  render() {
    return (
      <Modal size="mini" open={this.props.open} centered={false}>
        <Modal.Header>
          <Icon name="money" />
          {`Cash out ${formattedMoney(this.props.cashoutAmount)} for ${this.props.selectedPlayer.name}`}
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <CashoutForm
              cashoutAmount={this.props.cashoutAmount}
              selectedPlayer={this.props.selectedPlayer}
              setCashoutAmount={this.props.setCashoutAmount}
              ref={(ref) => {
                this.cashoutForm = ref;
              }}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.props.handleModalClose}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={() => this.props.handleCashout(this.props.selectedPlayer.id, this.props.cashoutAmount)}
          >
            Cash Out
          </Button>
        </Modal.Actions>
      </Modal>

    );
  }
}

class NewPlayerModal extends Component {
  playerForm = null;

  render() {
    return (
      <Modal size="mini" open={this.props.open} centered={false}>
        <Modal.Header>
          <Icon name="blind" />
          {' '}
          New Players
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <NewPlayerForm ref={(ref) => {
              this.playerForm = ref;
            }}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.props.handleModalClose}>
            Cancel
          </Button>
          <Button color="blue" onClick={() => this.props.addNewPlayer(this.playerForm.names)}>
            Add
          </Button>
        </Modal.Actions>
      </Modal>

    );
  }
}


const BuyInModal = (props) => (
  <Modal size="mini" open={props.open} centered={false}>
    <Modal.Header>
      <Icon name="money bill alternate outline" />
      {` Buy in ${formattedMoney(props.gameSetting.stackSize)} for ${props.selectedPlayer.name} from`}
    </Modal.Header>
    <Modal.Content>
      <Modal.Description>
        <Button onClick={props.handleBuyIn('-1', props.selectedPlayer.id)} color="blue">Bank</Button>
        {props.getSources(props.selectedPlayer).map(
          (player) => (
            <Button
              onClick={props.handleBuyIn(player.id, props.selectedPlayer.id)}
              key={`source${player.id}`}
            >
              {player.name}
              {' '}
              (
              {formattedMoney(player.buys)}
              )
            </Button>
          ),
        )}

      </Modal.Description>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={props.handleModalClose}>
        Cancel
      </Button>
    </Modal.Actions>
  </Modal>

);


class GameSettingModal extends Component {
  render() {
    return (
      <Modal size="mini" open={this.props.open} centered={false}>
        <Modal.Header>
          <Icon name="setting" />
          {' '}
          Game Settings
        </Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <GameSettingForm
              gameSetting={this.props.gameSetting}
              ref={(ref) => {
                this.gameSettingForm = ref;
              }}
            />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.props.handleModalClose}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={() => this.props.saveGameSetting({
              stackSize: this.gameSettingForm.state.stackSizeInGBP * 100,
              buyInAllowance: this.gameSettingForm.state.buyInAllowanceInGBP * 100,
            })}
          >
            Save
          </Button>
        </Modal.Actions>
      </Modal>

    );
  }
}

export {
  NewPlayerModal, BuyInModal, GameSettingModal, CashOutModal,
};
