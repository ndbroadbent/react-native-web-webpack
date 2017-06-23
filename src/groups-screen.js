import React from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import * as firebase from 'firebase';
import * as joda from 'js-joda';
import _ from 'lodash';
import { Link, Back } from './compat/routing';
import { Chart } from './compat/charts';

export class GroupListItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      group: null,
      activities: [],
    };
  }

  render() {
    const buttons = _.map(this.state.activities || [], (activity) => {
      return (
        <View key={activity.id}>
          <Text>
            { activity.name }
          </Text>
          <TouchableHighlight onPress={() => this.addEvent(activity.id)}>
            <View style={styles.buttonView}>
              <Text style={styles.buttonText}>+</Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    });

    return (
      <View style={styles.activityView}>
        <Link to={'/group/' + this.props.id}>
          <Text style={styles.activityName}>{this.props.name}</Text>
        </Link>
        { buttons }
      </View>
    );
  }

  componentWillMount() {
    const id = this.props.id;
    firebase.database().ref('/groups/' + id).once('value', (snapshot) => {
      const group = snapshot.val();
      this.setState({ group });
      (group.activities || []).forEach((aId) => {
        firebase.database().ref('/activities/' + aId).once('value', (snapshot) => {
          const activities = _(this.state.activities)
            .concat({
              name: snapshot.val().name,
              id: aId,
            })
            .orderBy('name')
            .value();
          this.setState({ activities });
        });
      });
    });
  }

  componentWillUnmount() {
    firebase.database().ref(`/groups/${this.props.id}`).off('value');
    (this.state.activities || []).forEach((activity) => {
      firebase.database().ref('/activities/' + activity.id).off('value');
    });
  }

  addEvent(activity) {
    const date = new Date().getTime();
    firebase.database().ref(`/events/${activity}/${date}`).set(1);
  }
}

export class SingleGroupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      group: null,
      activities: [],
      events: [],
    };
  }

  componentWillMount() {
    const id = this.props.params.id;
    firebase.database().ref('/groups/' + id).once('value', (snapshot) => {
      const group = snapshot.val();
      this.setState({ group });
      (group.activities || []).forEach((aId) => {
        firebase.database().ref('/activities/' + aId).once('value', (snapshot) => {
          const activities = _.concat(this.state.activities, {
            name: snapshot.val().name,
            id: aId,
          });
          this.setState({ activities });
        });
        firebase.database().ref('/events/' + aId).on('value', (snapshot) => {
          const events = _(snapshot.toJSON())
            .map((v, k) => {
              return {
                date: joda.LocalDateTime._ofEpochMillis(k, joda.ZoneOffset.ofHours(-3)),
                activity: aId,
              };
            })
            .concat(this.state.events)
            .value();
          this.setState({ events });
        });
      });
    });
  }

  componentWillUnmount() {
    const id = this.props.params.id;
    firebase.database().ref('/events/' + id).off('value');
    (this.state.group.activities || []).forEach((aId) => {
      firebase.database().ref('/activities/' + aId).off('value');
      firebase.database().ref('/events/' + aId).off('value');
    });
  }

  render() {
    const eventsData = _(this.state.events)
      .map((e) => {
        return { day: e.date.toLocalDate().toString(), activity: e.activity };
      })
      .groupBy('day')
      .map((v, day) => {
        return _(v)
          .countBy('activity')
          .merge({ day })
          .value();
      })
      .value();
    const lines = this.state.activities || [];

    return (
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 30 }}>
          { this.state.group && this.state.group.name }
        </Text>
        <Chart data={eventsData} lines={lines} />
        <Back>
          <Text>Back</Text>
        </Back>
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
