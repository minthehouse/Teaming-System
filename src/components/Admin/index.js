import React, { Component } from 'react';
import { withFirebase } from '../Firebase';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {list : []};
    this.pendingListSubcriber = null;
  }

  componentDidMount () {
    this.pendingListSubcriber = this.props.firebase.getPendingUsers()
    .onSnapshot(users => {
      if (users.empty) this.setState({list: []});
      else {
        users.forEach(user => {
        const { list } = this.state;
        this.setState({list: [...list, user.data()]});
        });
      }
    });
  }

  componentWillUnmount(){
    this.pendingListSubcriber();
  }

  acceptRegister(userInfo) {
    const tempPassword = '123456';
    const {name, email, interest, credential, reference} = userInfo;
    this.props.firebase.createUserWithEmailAndPassword(email, tempPassword)
    .then(res => {
      return this.props.firebase.user(email)
              .set({name, email, interest, credential, reference, role: 'OU', date: new Date()});
    })
    .then(res => {
      this.props.firebase.pendingUser(email).update({rejected: "accept"});;
      this.props.firebase.passwordReset(email);
    })
    .catch(error => {
      alert(error);
    });
  }

  rejectRegister(userInfo) {
    let rejected = userInfo.rejected;
    if (rejected === "init") rejected = "rejected";
    else rejected = "block";
    this.props.firebase.pendingUser(userInfo.email).update({rejected});
  }

  render() {
    const { list } = this.state;
    return list.map(user => (
    <div key = {user.email}>
      {user.email}
      <button onClick = {() => this.acceptRegister(user)}>Accept</button>
      <button onClick = {() => this.rejectRegister(user)}>Reject</button>
    </div>
    ));
  }
}

export default withFirebase(Admin);
