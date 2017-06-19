import React from 'react';
import { View, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';
import Parser from 'route-parser';

export class Router extends React.Component {
  constructor(props) {
    super(props);
    this.state = { href: '/' };
  }

  getChildContext() {
    return {
      Router: {
        href: this.state.href,
        go: this.go.bind(this)
      }
    };
  }

  go(href) {
    this.setState({ href: href });
  }

  render() {
    return (
      <View>
        { this.props.children }
      </View>
    );
  }
}

Router.childContextTypes = {
  Router: PropTypes.shape({
    href: PropTypes.string,
    go: PropTypes.func
  })
};

export class Route extends React.Component {
  constructor(props) {
    super(props);
    this.parser = new Parser(props.path);
  }

  componentWillReceiveProps(props) {
    this.parser = new Parser(props.path);
  }

  render() {
    const params = this.parser.match(this.context.Router.href);
    console.debug(this.props.path, this.context.Router.href, params);
    const rendered = <this.props.component params={params} />;
    return (
      <View>
        { params && rendered }
      </View>
    );
  }
}

Route.contextTypes = Router.childContextTypes;

export class Link extends React.Component {
  render() {
    return (
      <TouchableHighlight onPress={() => this.context.Router.go(this.props.to)}>
        <View>
          { this.props.children }
        </View>
      </TouchableHighlight>
    );
  }
}

Link.contextTypes = Router.childContextTypes;
