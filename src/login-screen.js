import React from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import * as firebase from 'firebase';

export class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: 'igor@borges.me',
      password: '123456',
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput defaultValue={this.state.email} placeholder='me@email.com' onChangeText={email => this.setState({email})} />
        <TextInput defaultValue={this.state.password} placeholder='password' secureTextEntry={true} onChangeText={password => this.setState({password})} />
        <Button title='Login' onPress={() => this.doLogin()} />
      </View>
    );
  }

  doLogin() {
    const {email, password} = this.state;
    if (email && password) {
      firebase.auth().signInWithEmailAndPassword(email, password);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
