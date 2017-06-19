import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import _ from 'lodash';

export class Chart extends React.Component {
  render() {
    const lines = this.props.lines ?
      _.map(this.props.lines || [], (l) => <Line type='monotone' key={l.id} name={l.name} dataKey={l.id} stroke='#8884d8' />) :
      <Line type='monotone' dataKey='count' stroke='#8884d8' />;
    return (
      <LineChart width={600} height={300} data={this.props.data}
                 margin={{top: 5, right: 30, left: 5, bottom: 5}}>
        <XAxis dataKey='day' />
        <YAxis />
        <CartesianGrid strokeDasharray='3 3' />
        <Tooltip />
        { lines }
      </LineChart>
    );
  }
}