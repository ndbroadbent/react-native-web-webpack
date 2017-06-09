import React from 'react';
import { Button, StyleSheet, Text, View, ListView, ActivityIndicator } from 'react-native';
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
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      loading: true,
      dataSource: this.ds.cloneWithRows([]),
    };
  }

  componentWillMount() {
    firebase.database().ref('activities').once('value', (snapshot) => {
      const activities = _.map(snapshot.toJSON(), (v, k) => _.assign({key: k, id: k}, v));
      this.setState({
        dataSource: this.ds.cloneWithRows(activities),
        loading: false,
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.loading ?
          <ActivityIndicator /> :
          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderRow={(a) => <Activity {...a} />}/>
        }
      </View>
    );
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
