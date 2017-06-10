import React from 'react';
import { Button, StyleSheet, TextInput, View, Text } from 'react-native';
import * as firebase from 'firebase';

export class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      email: 'igor@borges.me',
      password: '123456',
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          defaultValue={this.state.email}
          placeholder='me@email.com'
          onChangeText={email => this.setState({email})} />
        <TextInput
          defaultValue={this.state.password}
          placeholder='password'
          secureTextEntry={true}
          onChangeText={password => this.setState({password})} />
        <Button title='Login' onPress={() => this.doLogin()} />
        <Text style={styles.errorText}>{this.state.error && this.state.error.message}</Text>
      </View>
    );
  }

  doLogin() {
    const {email, password} = this.state;
    if (email && password) {
      this.setState({ error: null });
      firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
        this.setState({ error });
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  errorText: {
    color: 'red',
  }
});
