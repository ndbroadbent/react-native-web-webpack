import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import * as firebase from 'firebase';
import _ from 'lodash';

export class Activity extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <View>
        <Text>[{this.state.count}] {this.props.name}</Text>
        <Button title='+' onPress={() => this.addEvent()} />
      </View>
    );
  }

  componentWillMount() {
    firebase.database().ref(`events/${this.props.id}`).on('value', (snapshot) => {
      this.setState({ count: snapshot.numChildren() });
    });
  }

  addEvent() {
    const date = new Date().getTime();
    firebase.database().ref(`events/${this.props.id}/${date}`).set(1);
  }
}

export class ActivitiesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
    };
  }

  componentWillMount() {
    firebase.database().ref('activities').once('value', (snapshot) => {
      this.setState({
        activities: _.map(snapshot.toJSON(), (v, k) => _.assign({key: k, id: k}, v)),
      });
    });
  }

  render() {
    const activities = _.map(this.state.activities, (a) => <Activity {...a} />);
    return (
      <View style={styles.container}>
        {activities}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
