import React, { Component } from 'react';
import {
  Button, Form, Grid, Label, Icon, Image, Responsive,
} from 'semantic-ui-react';
import formattedMoney from './formattedMoney';

const PlayerName = (props) => (
  <div style={{...props.style, verticalAlign: "middle"}}>
    <Icon name="user secret" />
    {props.name}
  </div>
);

const PlayerProfit = (props) => {
  const formattedAbsValue = formattedMoney(Math.abs(props.value));
  const formattedValue = (props.value > 0) ? formattedAbsValue : `(${formattedAbsValue})`;
  return (
    <div style={{...props.style, display: "inline-flex", verticalAlign: "middle"}}>
      <Image centered style={{ width: '1rem', float: 'left', marginRight: '0.35em' }} src="/chips.png" />
      {
        formattedValue
      }
    </div>
  );
};


class PlayerItem extends Component {
  constructor(props) {
    super(props);
    this.state = { isDeleting: false };
  }

  handleRemovePlayerClick = (player) => () => {
    this.setState({ isDeleting: true });
    if (player.buys !== 0) {
      alert("Couldn't let the player go once their balance is Zero");
      this.setState({ isDeleting: false });
      return;
    }
    this.props.activeGameRef().collection('players').doc(player.id).delete()
      .then(
        () => {
          this.setState({ isDeleting: false });
        },
      )
      .catch(
        () => {
          alert(`Couldn't kick ${player.name}!`);
          this.setState({ isDeleting: false });
        },
      );
  }


  render() {
    return (
      <Grid.Column style={{ padding: '0!important' }} className="player-item">
        <Form className="player-control-panel ">
          <Form.Group inline>
            <Form.Field style={{minWidth: "fit-content", textAlign: 'left', padding: '0 1rem 0 0' }}>
              <Label
                as="span"
                size="large"
                style={{
                  textTransform: 'uppercase', width: '100%', minHeight: "32px", textAlign: 'left', borderRadius: 0,
                }}
              >
                <PlayerName name={this.props.player.name} style={{display: "inline", marginRight: "0.5rem"}}/>
                <Responsive maxWidth={767} style={{ display: "inline", width: '100%',  textAlign: 'left' }}>
                  <PlayerProfit
                    style={{
                      color: this.props.getLabelColorFromBuys(this.props.player.buys).backgroundColor,
                    }}
                    value={-this.props.player.buys}
                  />
                </Responsive>

              </Label>

            </Form.Field>
            <Responsive as={Form.Field} minWidth={768} style={{ width: '100%', textAlign: 'left' }}>
              <Label
                className="buy-in-status-bar"
                size="large"
                color={this.props.getLabelColorFromBuys(this.props.player.buys).backgroundColor}
                style={{
                  height: "32px",
                  overFlow: 'visible',
                  width: `${String(100 * Math.abs(this.props.getPercentage(this.props.player.buys)))}%`,
                  borderRadius: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  marginLeft: '-1rem',
                }}
              >
                <PlayerProfit
                  style={{
                    marginLeft: '0.5em',
                    color: this.props.getLabelColorFromBuys(this.props.player.buys).textColor,
                  }}
                  value={-this.props.player.buys}
                />
              </Label>

            </Responsive>


            <Form.Field style={{ marginLeft: 'auto' }}>
              <Button
                color="blue"
                onClick={this.props.handleBuyInButtonClick(this.props.player)}
                circular
                icon="plus"
              />
            </Form.Field>

            <Form.Field>
              <Button onClick={this.props.handleCashOutButtonClick(this.props.player)} circular icon="undo" />
            </Form.Field>

            <Form.Field style={{ paddingRight: '0' }}>
              <Button
                onClick={this.handleRemovePlayerClick(this.props.player)}
                circular
                loading={this.state.isDeleting}
                icon="sign-out"
              />
            </Form.Field>

          </Form.Group>
        </Form>


      </Grid.Column>
    );
  }
}

export { PlayerName, PlayerProfit };
export default PlayerItem;
