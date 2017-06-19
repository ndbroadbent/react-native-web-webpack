import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import _ from 'lodash';

export class Chart extends React.Component {
  render() {
    const events = _(this.props.events)
      .map((e) => {
        return e.toLocalDate().toString();
      })
      .countBy()
      .map((v, k) => {
        return { day: k, count: v };
      })
      .value();

    return (
      <LineChart width={600} height={300} data={events}
                 margin={{top: 5, right: 30, left: 5, bottom: 5}}>
        <XAxis dataKey='day'/>
        <YAxis/>
        <CartesianGrid strokeDasharray='3 3'/>
        <Tooltip/>
        <Line type='monotone' dataKey='count' stroke='#8884d8' activeDot={{r: 8}}/>
        {/*<Line type='monotone' dataKey='uv' stroke='#82ca9d' />*/}
      </LineChart>
    );
  }
}