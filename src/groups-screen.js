import React from 'react';
import { StyleSheet, Text, View, ListView, ActivityIndicator, TouchableHighlight } from 'react-native';
import * as firebase from 'firebase';
import * as joda from 'js-joda';
import _ from 'lodash';
import { Link } from './compat/routing';
import { Chart } from './compat/charts';

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
        <Link to='/'>
          <Text>Back</Text>
        </Link>
      </View>
    );
  }
}
