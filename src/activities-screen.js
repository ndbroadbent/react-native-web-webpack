import React from 'react';
import { StyleSheet, Text, View, ListView, ActivityIndicator, TouchableHighlight } from 'react-native';
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
      <View style={styles.activityView}>
        <Text style={styles.activityName}>[{this.state.count}] {this.props.name}</Text>
        <TouchableHighlight onPress={() => this.addEvent()}>
          <View style={styles.buttonView}>
            <Text style={styles.buttonText}>+</Text>
          </View>
        </TouchableHighlight>
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
      const activities = _.map(snapshot.toJSON(), (v, k) => _.assign({ key: k, id: k }, v));
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
  activityView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5,
    padding: 10,
    borderColor: '#999999',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  activityName: {
    color: '#333333',
    fontSize: 24,
  },
  buttonView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(33, 150, 243)',
    borderRadius: 2,
    padding: 5,
    width: 34,
    height: 34
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    height: 24
  },
});
