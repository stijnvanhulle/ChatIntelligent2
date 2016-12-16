/**
* @Author: Stijn Van Hulle <stijnvanhulle>
* @Date:   2016-12-14T19:55:16+01:00
* @Email:  me@stijnvanhulle.be
* @Last modified by:   stijnvanhulle
* @Last modified time: 2016-12-16T19:33:54+01:00
* @License: stijnvanhulle.be
*/

/**
* @Author: Stijn Van Hulle <stijnvanhulle>
* @Date:   2016-11-03T14:00:47+01:00
* @Email:  me@stijnvanhulle.be
* @Last modified by:   stijnvanhulle
* @Last modified time: 2016-12-16T19:33:54+01:00
* @License: stijnvanhulle.be
*/

import React, {Component} from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as friendActions from '../actions/friendActions';
import AddFriendForm from '../components/forms/addFriendForm';
import url from '../actions/lib/url';
import {setParams} from '../lib/functions';
import global from '../lib/const/global';
class FriendsPage extends Component {
  state = {
    meId: null,
    user: {},
    errors: {},
    saving: false
  }
  constructor(props, context) {
    super(props, context);

    let userId;
    try {
      const obj = {};
      userId = JSON.parse(localStorage.getItem(`userId`));
      this.state.meId = userId;
      if (userId) {
        this.props.actions.loadFriends(userId);
      } else {
        console.log(`no user id`);
        this.context.router.push(`/login`);
      }
    } catch (e) {
      console.log(e);
    }

  }
  addFriend = e => {
    e.preventDefault();
    //login
    const user = this.state.user;
    if (user.username && this.state.user.id) {
      this.props.actions.addFriend(this.state.meId, this.state.user.id).then(() => {
        console.log(`ok`);
      }).catch(err => {
        console.log(err);
      });
    }

  }
  findFriend = e => {
    e.preventDefault();
    //login
    let user = this.state.user;
    if (user.username) {
      axios.get(`${url.USER}?username=${user.username}`).then(response => {
        const data = response.data;
        user = data;
        console.log(user);
        this.setState({user});
      }).catch(err => {
        throw err;
      });
    }

  }
  onFriendChange = e => {
    const field = e.target.name;
    const user = this.state.user;
    user[field] = e.target.value.toString();

    return this.setState({user: user});
  }
  callFriend = userId => {
    const self = this;
    axios.get(setParams(url.USER_ONLINE, parseFloat(userId))).then(response => {
      const data = response.data;
      if (data.online) {
        global.events.emit(`connect`, userId);
        self.props.router.push(`/`);
      } else {
        console.log(`user not online`);
      }
    }).catch(err => {
      throw err;
    });

  }

  messageView = (item, i) => {
    let confirmed;
    if (item.isConfirmed) {
      confirmed = `confirmed`;
    } else {
      confirmed = `not confirmed`;
    }
    return (
      <div key={item.user2.id}>{item.user2.firstName} {item.user2.lastName}
        -- {confirmed}
        {item.user2.online}
        <button onClick={this.callFriend.bind(this, item.user2.id)}>Connect</button>
      </div>
    );
  }

  render() {
    console.log(this.props.friends);
    return (
      <div>
        <AddFriendForm onChange={this.onFriendChange} onSave={this.findFriend} user={this.state.user} errors={this.state.errors} saving={this.state.saving} />
        <button onClick={this.addFriend}>Add</button>

        {this.props.friends.map((item, i) => this.messageView(item, i))}
      </div>
    );
  }
}

const mapStateToProps = (mapState, ownProps) => {
  return {friends: mapState.friends};
};
const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators(friendActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FriendsPage);
