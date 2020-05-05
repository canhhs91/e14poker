import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import './App.scss';
import {
  Button, Label, Icon, Grid, Image,
} from 'semantic-ui-react';
import { firebaseAuth, googleProvider } from './firebase';

import PokerDashboard from './components/pokerDashboard';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: {
        loading: true,
        user: null,
      },
    };
  }

  signIn = () => {
    firebaseAuth.signInWithRedirect(googleProvider);
  };

  componentDidMount = () => {
    firebaseAuth.onAuthStateChanged((user) => {
      this.setState({ auth: { loading: false, user } });
    });
  };

  render() {
    const { auth } = this.state;
    return (
      <div className="App">
        <Grid>
          <Grid.Row columns={1}>
            <Grid.Column>
              {auth.user && !auth.loading
              && <PokerDashboard auth={auth} />}
              <UserInfo signIn={this.signIn} auth={auth} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

const UserInfo = (props) => {
  const { auth } = props;
  if (auth.user) {
    return (
      <Label as={Button} onClick={() => firebaseAuth.signOut()}>
        <span>
          <Image style={{ marginTop: '-2px', float: 'left', width: '15px' }} src={auth.user.photoURL} />
&nbsp;&nbsp;
        </span>
        <span>
          Log out
          {' '}
          {auth.user.email}
        </span>
      </Label>
    );
  }

  if (auth.loading) {
    return (
      <Button icon labelPosition="left">
        <Icon name="google" />
        Logging you in...
      </Button>
    );
  }

  return (
    <Button icon labelPosition="left" onClick={() => props.signIn()}>
      <Icon name="google" />
      Login with Google
    </Button>
  );
};


export default App;
