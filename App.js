import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

// Generated from service: https://ngrok.com/
const PUSH_REGISTRATION_ENDPOINT = 'http://e17503bc16ed.ngrok.io/token';
const MESSAGE_ENPOINT = 'http://e17503bc16ed.ngrok.io/message';

export default class App extends React.Component {
  state = {
    notification: null,
    messageText: ''
  }

  handleNotification = (notification) => {
    this.setState({ notification });
  }

  handleChangeText = (text) => {
    this.setState({ messageText: text });
  }

  sendMessage = async () => {
    fetch(MESSAGE_ENPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: this.state.messageText,
      }),
    });

    this.setState({ messageText: '' });
  }

  registerForPushNotificationsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

    if (status !== 'granted') {
      return;
    }

    let token = await Notifications.getExpoPushTokenAsync();
    // let token = await Notifications.getDevicePushTokenAsync();
    // console.log(token);

    fetch(PUSH_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: {
          value: token.data,
        },
        user: {
          username: 'foo',
          name: 'test'
        },
      }),
    });
  
    this.notificationSubscription = Notifications.setNotificationHandler(this.handleNotification);
  }

  componentDidMount() {
    this.registerForPushNotificationsAsync();
  }

  renderNotification() {
    return(
      <View style={styles.container}>
        <Text style={styles.label}>A new message was recieved!</Text>
        <Text>{this.state.notification.data.message}</Text>
      </View>
    )
  }
  
  render() {
    return (
      <View style={styles.container}>
        <TextInput value={this.state.messageText} onChangeText={this.handleChangeText} style={styles.textInput} />
        
        <TouchableOpacity style={styles.button} onPress={this.sendMessage}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        
        { this.state.notification ? this.renderNotification() : null }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#474747',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 50,
    width: 300,
    borderColor: '#f6f6f6',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  button: {
    padding: 10,
    margin: 20,
    backgroundColor: 'grey',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff'
  },
  label: {
    fontSize: 18
  }
});

// expo init my-app
// expo install expo-permissions
// expo install expo-notifications
// npm start (start the app)
// expo install express esm expo-server-sdk
// npm run serve (start the express back end server)
// npm i -g ngrok   // https://ngrok.com/
// ngrok http 3000  // expose(tunnel) back end express server (localhost) to internet on port 3000
// Forward HTTP requests from: http://localhost:3000 to: http://e17503bc16ed.ngrok.io
// https://expo.io/notifications  // Expo testing tool
