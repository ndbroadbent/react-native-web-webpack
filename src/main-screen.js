import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { ActivitiesScreen } from './activities-screen';
import * as firebase from 'firebase';

export class MainScreen extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <ActivitiesScreen />
        <Button title='Logout' onPress={() => this.onLogout()} />
      </View>
    );
  }

  onLogout() {
    firebase.auth().signOut();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});
