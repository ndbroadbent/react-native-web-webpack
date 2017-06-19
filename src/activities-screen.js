import React from 'react';
import { StyleSheet, Text, View, ListView, ActivityIndicator, TouchableHighlight } from 'react-native';
import * as firebase from 'firebase';
import * as joda from 'js-joda';
import _ from 'lodash';
import { Link } from './compat/routing';
import { Chart } from './compat/charts';

export class ActivityListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <View style={styles.activityView}>
        <Link to={'/activity/' + this.props.id}>
          <Text style={styles.activityName}>[{this.state.count}] {this.props.name}</Text>
        </Link>
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

  componentWillUnmount() {
    firebase.database().ref(`events/${this.props.id}`).off('value');
  }

  addEvent() {
    const date = new Date().getTime();
    firebase.database().ref(`events/${this.props.id}/${date}`).set(1);
  }
}

export class SingleActivityScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activity: null,
      events: [],
    };
  }

  componentWillMount() {
    const id = this.props.params.id;
    firebase.database().ref('/activities/' + id).once('value', (snapshot) => {
      this.setState({
        activity: snapshot.val(),
      });
    });
    firebase.database().ref('/events/' + id).on('value', (snapshot) => {
      const events = _.map(_.keys(snapshot.toJSON()), (v) => joda.LocalDateTime._ofEpochMillis(v, joda.ZoneOffset.ofHours(-3)));
      this.setState({ events });
    });
  }

  componentWillUnmount() {
    const id = this.props.params.id;
    firebase.database().ref('/events/' + id).off('value');
  }

  render() {
    const events = _.map(this.state.events, (e) => <Text key={e.toString()}>{e.toString()}</Text>);
    const eventsData = _(this.state.events)
      .map((e) => {
        return e.toLocalDate().toString();
      })
      .countBy()
      .map((v, k) => {
        return { day: k, count: v };
      })
      .value();

    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 30 }}>
          { this.state.activity && this.state.activity.name }
        </Text>
        <Chart data={eventsData} />
        { events }
        <Link to='/'>
          <Text>Back</Text>
        </Link>
      </View>
    );
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
        <Link to='/group/-KmyVXZb-XGjS4Nweiuc'>
          <Text>GROUP</Text>
        </Link>
        { this.state.loading ?
          <ActivityIndicator /> :
          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderRow={(a) => <ActivityListItem {...a} />}/>
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
