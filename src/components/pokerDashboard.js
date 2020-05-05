import React, { Component } from 'react';
import {
  Grid, Button, Icon, Image, Responsive, Segment, Statistic,
} from 'semantic-ui-react';
import formattedMoney from './formattedMoney';
import ArchivedGamesTable from './archivedGamesTable';
import {
  BuyInModal, CashOutModal, GameSettingModal, NewPlayerModal,
} from './modals';
import PlayerItem from './playerItem';
import { db } from '../firebase';

const DEFAULT_STACK_SIZE = 2000;
const DEFAULT_LIMIT_BUYIN = 10000;

class PokerDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingData: true,
      userHasPermission: false,
      buyInModalOpen: false,
      cashoutModalOpen: false,
      newPlayerModalOpen: false,
      gameSettingModalOpen: false,
      cashoutAmount: DEFAULT_STACK_SIZE,
      players: [],
      archivedGames: [],
      gameSetting: {
        stackSize: DEFAULT_STACK_SIZE, // In GBP
        buyInAllowance: DEFAULT_LIMIT_BUYIN, // In GBP
      },
    };
  }

  componentDidMount = () => {
    if (this.props.auth.user) {
      this.loadData();
    }
  }

  activeGameRef = () => db.collection('games').doc(this.state.gameId);

  setCashoutAmount = (amount) => {
    this.setState({ cashoutAmount: amount });
  }

  getBuyInRange = () => {
    const maxBuy = Math.max(
      this.state.gameSetting.buyInAllowance,
      ...this.state.players.map((player) => Math.abs(player.buys)),
    );
    return { min: -maxBuy, max: maxBuy };
  }


  getPercentage = (buyInAmount) => {
    const range = this.getBuyInRange();
    return buyInAmount / range.max;
  }

  getLabelColorFromBuys = (buyInAmount) => {
    const percentage = this.getPercentage(buyInAmount);
    const background = (percentage > 0) ? 'orange' : 'blue';
    const textColor = (Math.abs(percentage) > 0.1) ? 'white' : 'black';
    return { backgroundColor: background, textColor };
  }


  loadData = () => {
    db.collection('games').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
      const games = snapshot.docs.map((doc) => ({ id: doc.id, docRef: doc.ref, ...doc.data() }));
      const activeGame = games.filter((game) => game.active)[0];
      this.setState({ archivedGames: games.filter((game) => !game.active) });

      if (!activeGame) return;

      this.setState({ gameId: activeGame.id });

      this.setState({
        gameSetting: {
          stackSize: activeGame.stackSize,
          buyInAllowance: activeGame.buyInAllowance,
        },
      });
      activeGame.docRef.collection('players').onSnapshot((playerSnapshot) => {
        const players = playerSnapshot.docs.map((doc) => ({ id: doc.id, docRef: doc.ref, ...doc.data() }));

        this.setState({ players });
      });
      this.setState({ userHasPermission: true, loadingData: false });
    }, (error) => {
      if (error.code === 'permission-denied') {
        this.setState({ userHasPermission: false, loadingData: false });
      }
    });
  }

  getTotalBuyIn = () => this.state.players.map((player) => player.buys).reduce((a, b) => a + b, 0);

  handleEndGame = () => {
    if (this.getTotalBuyIn() !== 0) {
      alert('Cannot end the game until all players have cashed out their chips (i.e. the total buy-in is zero)');
      return false;
    }
    if (window.confirm('This will archive the current game and create a new game. Would you like to end the game?')) {
      this.saveGameSetting({
        active: false,
        endedAt: new Date(),
      });
      db.collection('games').add({
        active: true,
        stackSize: DEFAULT_STACK_SIZE,
        buyInAllowance: DEFAULT_LIMIT_BUYIN,
        createdAt: new Date(),
      });
    }
    return false;
  }

  handleResetGame = () => {
    if (!window.confirm('This will clear all the players and change the settings to default. Reset the game?')) return;
    this.saveGameSetting({
      stackSize: DEFAULT_STACK_SIZE,
      buyInAllowance: DEFAULT_LIMIT_BUYIN,
    });
    this.activeGameRef().collection('players').get().then((snapshot) => {
      snapshot.docs.map((doc) => (doc.ref.delete()));
    });
  }

  handleBuyInButtonClick = (player) => () => {
    this.setState({ selectedPlayer: player });
    this.setState({ buyInModalOpen: true });
  }

  handleCashoutButtonClick = (player) => () => {
    const { gameSetting } = this.state;
    this.setState({ selectedPlayer: player });
    this.setState({ cashoutAmount: gameSetting.stackSize });
    this.setState({ cashoutModalOpen: true });
  }


  handleBuyInModalClose = () => {
    this.setState({ buyInModalOpen: false });
  }

  handleCashoutModalClose = () => {
    this.setState({ cashoutModalOpen: false });
  }

  handleNewPlayerModalClose = () => {
    this.setState({ newPlayerModalOpen: false });
  }

  handleGameSettingModalClose = () => {
    this.setState({ gameSettingModalOpen: false });
  }


  handleNewPlayerClick = () => {
    this.setState({ newPlayerModalOpen: true });
  }

  handleGameSettingClick = () => {
    this.setState({ gameSettingModalOpen: true });
  }

  getSources = (toPlayer) => {
    if (toPlayer) {
      return this.state.players.filter((player) => player.id !== toPlayer.id).sort((a, b) => a.buys - b.buys);
    }
    return [];
  }

  handleCashout = (playerId, cashoutAmount) => {
    this.handleCashoutModalClose();
    const playerRef = this.activeGameRef().collection('players').doc(playerId);
    playerRef.get().then((doc) => {
      const player = doc.data();
      playerRef.set({
        ...player,
        buys: player.buys - cashoutAmount,
      });
    });
  }

  handleBuyIn = (sourceId, destinationId) => () => {
    this.handleBuyInModalClose();
    const destRef = this.activeGameRef().collection('players').doc(destinationId);
    const sourceRef = this.activeGameRef().collection('players').doc(sourceId);
    let destPlayer = null;
    let sourcePlayer = null;


    db.runTransaction((transaction) => Promise.all([
      destRef.get().then((doc) => {
        destPlayer = doc.data();
      }),
      sourceRef.get().then((doc) => {
        sourcePlayer = doc.data();
      }),
    ]).then(() => {
      if (sourcePlayer) {
        transaction.update(sourceRef, { buys: sourcePlayer.buys - this.state.gameSetting.stackSize });
      }
      transaction.update(destRef, { buys: destPlayer.buys + this.state.gameSetting.stackSize });
    }));
  }

  saveGameSetting = (gameSetting) => {
    db.collection('games').doc(this.state.gameId).update(gameSetting);
    this.handleGameSettingModalClose();
  }

  addNewPlayer = (names) => {
    Object.values(names).filter((name) => name !== '').map((name) => this.activeGameRef().collection('players').add({
      name,
      buys: DEFAULT_STACK_SIZE,
    }));
    this.handleNewPlayerModalClose();
  }

  render() {
    const playerItems = this.state.players.sort((a, b) => a.buys - b.buys).map(
      (player, index) => (
        <PlayerItem
          key={player.id}
          handleBuyInButtonClick={this.handleBuyInButtonClick}
          handleCashOutButtonClick={this.handleCashoutButtonClick}
          index={index}
          players={this.state.players}
          player={player}
          getLabelColorFromBuys={this.getLabelColorFromBuys}
          getPercentage={this.getPercentage}
          gameSetting={this.state.gameSetting}
          activeGameRef={this.activeGameRef}
        />
      ),
    );
    if (this.state.loadingData) {
      return <DashboardMessage message="Loading game...." />;
    }

    if (!this.state.userHasPermission) {
      return <DashboardMessage message="You don't have permissions to access the game" />;
    }

    return (
      <div style={{ maxWidth: '900px', margin: 'auto' }}>
        <Segment className="page-module list-players" id="active-player-list">
          {this.state.players.length ? (
            <Grid stackable>
              <Grid.Row columns={1}>
                {playerItems}
              </Grid.Row>
            </Grid>
          ) : (
            <div>
              <div><Image centered size="small" src="/favicon.ico" /></div>
              <h1>Add new players to start the game</h1>
            </div>
          )}
        </Segment>
        <Grid columns={2} divided doubling>
          <Grid.Row>
            <Grid.Column width={4}>
              <Segment style={{ padding: '0.5rem' }}>
                <Statistic size="mini">
                  <Statistic.Label>Total Buy-in </Statistic.Label>
                  <Statistic.Value>
                    {formattedMoney(this.getTotalBuyIn())}
                  </Statistic.Value>
                </Statistic>
              </Segment>
            </Grid.Column>
            <Grid.Column width={12}>
              <Segment className="game-control-board" textAlign="right" style={{ float: 'right' }}>
                <Button icon onClick={this.handleNewPlayerClick} color="green">
                  <Icon name="plus" />
                  <Responsive
                    as="span"
                    minWidth={768}
                  >
                    {' '}
                    NEW
                    PLAYER
                  </Responsive>
                </Button>
                <Button icon onClick={this.handleGameSettingClick}>
                  <Icon name="setting" />
                  <Responsive
                    as="span"
                    minWidth={768}
                  >
                    {' '}
                    SETTING
                  </Responsive>
                </Button>
                <Button icon onClick={this.handleResetGame}>
                  <Icon name="repeat" />
                  <Responsive
                    as="span"
                    minWidth={768}
                  >
                    {' '}
                    RESET
                  </Responsive>
                </Button>
                {this.state.players.length > 0
                  ? (
                    <Button icon onClick={() => this.handleEndGame()} color="red">
                      <Icon name="moon" />
                      {' '}
                      END
                    </Button>
                  )
                  : (
                    <Button disabled color="red">
                      <Icon name="moon" />
                      {' '}
                      END
                    </Button>
                  )}
              </Segment>
            </Grid.Column>
          </Grid.Row>
          {this.state.archivedGames.length > 0
          && (
          <Grid.Row>
            <Grid.Column width={16}>
              <ArchivedGamesTable style={{ width: '100%' }} archivedGames={this.state.archivedGames} />
            </Grid.Column>
          </Grid.Row>
          )}
        </Grid>

        {this.state.selectedPlayer
        && (
          <BuyInModal
            open={this.state.buyInModalOpen}
            handleModalClose={this.handleBuyInModalClose}
            getSources={this.getSources}
            selectedPlayer={this.state.selectedPlayer}
            handleBuyIn={this.handleBuyIn}
            gameSetting={this.state.gameSetting}
          />
        )}
        {this.state.selectedPlayer
        && (
          <CashOutModal
            open={this.state.cashoutModalOpen}
            handleModalClose={this.handleCashoutModalClose}
            cashoutAmount={this.state.cashoutAmount}
            setCashoutAmount={this.setCashoutAmount}
            gameSetting={this.state.gameSetting}
            handleCashout={this.handleCashout}
            selectedPlayer={this.state.selectedPlayer}
          />
        )}
        <NewPlayerModal
          open={this.state.newPlayerModalOpen}
          handleNewPlayerClick={this.handleNewPlayerClick}
          handleModalClose={this.handleNewPlayerModalClose}
          addNewPlayer={this.addNewPlayer}
        />

        <GameSettingModal
          open={this.state.gameSettingModalOpen}
          handleModalClose={this.handleGameSettingModalClose}
          gameSetting={this.state.gameSetting}
          saveGameSetting={this.saveGameSetting}
        />


      </div>
    );
  }
}

const DashboardMessage = (props) => (
  <div style={{ maxWidth: '900px', margin: 'auto' }}>
    <Segment>
      <div><Image centered size="small" src="/favicon.ico" /></div>
      <h1>{props.message}</h1>
    </Segment>
  </div>
);

export default PokerDashboard;
