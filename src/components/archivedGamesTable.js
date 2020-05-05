import React, { Component } from 'react';
import { Header, Table, Label } from 'semantic-ui-react';
import { db } from '../firebase';
import { PlayerName, PlayerProfit } from './playerItem';

class ArchivedGameRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
    };
  }

  getPlayersForGame = () => (
    db.collection('games').doc(this.props.game.id).collection('players').get()
      .then((snapshot) => {
        const players = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        this.setState({ players });
      })
  )

  render() {
    this.getPlayersForGame();
    return (this.state.players.length > 0
      && (
        <Table.Row>
          <Table.Cell>
            <Header as="h4" textAlign="center">
              {this.props.game.endedAt && this.props.game.endedAt.toDate().toLocaleString()}
            </Header>
          </Table.Cell>
          <Table.Cell>
            {this.state.players.sort((a, b) => a.buys - b.buys).map(
              (player) => (
                <Label style={{ margin: '0.3rem' }} key={`player${player.id}`}>
                  <PlayerName name={player.name} />
                  <PlayerProfit value={-player.buys} style={{marginTop: "0.5rem"}} />
                </Label>
              ),
            )}
          </Table.Cell>

        </Table.Row>
      )

    );
  }
}

const ArchivedGamesTable = (props) => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell colSpan={2} textAlign="center" singleLine>Archive</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {props.archivedGames.map((game) => (
        <ArchivedGameRow key={`archive-game${game.id}`} game={game} />
      ))}
    </Table.Body>
  </Table>
);

export default ArchivedGamesTable;
