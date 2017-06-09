import React from 'react';
import { AsyncStorage, Platform, StyleSheet, View } from 'react-native';
import * as firebase from 'firebase';
import { LoginScreen } from './login-screen';
import { ActivitiesScreen } from './activities-screen';

const config = {
  apiKey: 'AIzaSyCeBVaIXYwjEpU289jf7JCeq0zMfzWUxoU',
  authDomain: 'last-time-b6bf0.firebaseapp.com',
  databaseURL: 'https://last-time-b6bf0.firebaseio.com',
};
firebase.initializeApp(config);

if (Platform.OS !== 'web') {
  global.localStorage = class {
    static clear() {
      AsyncStorage.clear();
    }

    static getItemPromise(keyName) {
      return new Promise((resolve, reject) => {
        AsyncStorage.getItem(keyName, (e, value) => {
          if (e) reject(e);
          else resolve(value);
        });
      })
    }

    static async getItem(keyName) {
      return await this.getItemPromise(keyName);
    }

    static key(key) {
      return null;
    }

    static removeItem(keyName) {
      AsyncStorage.removeItem(keyName);
    }

    static setItem(keyName, keyValue) {
      AsyncStorage.setItem(keyName, keyValue);
    }
  };
}

export default class ExampleApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      console.log('user', user);
      this.setState({ user });
    });
  }

  render() {
    return (
      <View>
        { this.state.user ? <ActivitiesScreen /> : <LoginScreen /> }
      </View>
    );
  }
}

const styles = StyleSheet.create({
});
