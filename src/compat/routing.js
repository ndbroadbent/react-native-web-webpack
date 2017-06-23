import React from 'react';
import { View, TouchableHighlight, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Parser from 'route-parser';
import _ from 'lodash';

export class Router extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      href: '#/',
      history: ['#/'],
    };
  }
  
  componentWillMount() {
    if (Platform.OS === 'web') {
      const onHashChange = function() {
        console.debug('onHashChange', window.location.hash);
        
        if (window.location.hash !== '') {
          this.setState({ href: window.location.hash });
        }
      };
      window.onhashchange = _.bind(onHashChange, this);
      
      this.go(window.location.hash === '' ? '/' : window.location.hash.slice(1));
    }
  }
  
  componentWillUnmount() {
    if (Platform.OS === 'web') {
      window.onhashchange = undefined;
    }
  }

  getChildContext() {
    return {
      Router: {
        href: this.state.href,
        go: this.go.bind(this),
        back: this.back.bind(this),
      }
    };
  }

  go(href) {
    console.debug('go', href);
    if (Platform.OS === 'web') {
      window.history.pushState(undefined, undefined, '#' + href);
    }
    this.setState({
      href: '#' + href,
      history: _.concat(this.state.history, '#' + href),
    });
  }

  back() {
    console.debug('back');
    const newHistory = _.dropRight(this.state.history, 1);
    const newHref = _.last(newHistory);

    if (newHref) {
      if (Platform.OS === 'web') {
        window.location.hash = newHref;
      }

      this.setState({
        href: newHref,
        history: newHistory,
      });
    }
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
    const href = this.context.Router.href.slice(1);
    const params = this.parser.match(href);
    const rendered = <this.props.component params={params} />;

    return (
      params && <View>{ rendered }</View>
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

export class Back extends React.Component {
  render() {
    return (
      <TouchableHighlight onPress={() => this.context.Router.back()}>
        <View>
          { this.props.children }
        </View>
      </TouchableHighlight>
    );
  }
}

Back.contextTypes = Router.childContextTypes;
