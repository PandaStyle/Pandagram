import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ListView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { firebaseApp } from '../../firebase'
import Icon from 'react-native-vector-icons/Ionicons'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import { getColor } from '../config'
import { observer } from 'mobx-react/native'
import { Actions } from 'react-native-mobx'
import Post from './post'


@observer(['appStore'])
export default class Profile extends Component {
  constructor(props) {
    super(props)
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
    this.state = {
      isLoadingTail: true,
      isEmpty: false,
      dataSource: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2}),
    }
  }

  componentDidMount() {
    const uid = this.props.appStore.user.uid
    console.log("--------- MY POSTS --------- " + uid)
    firebaseApp.database().ref('userposts/'+ uid +'/posts').orderByChild('timestamp').on('value',
    (snapshot) => {
      console.log("USER POST RETRIEVED");
      //this.props.appStore.myposts = snapshot.val()
      if (snapshot.val()) {
        this.setState({ isEmpty: false })
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(_.reverse(_.toArray(snapshot.val()))),
        })
      }
      else {
        this.setState({ isEmpty: true })
      }
      this.setState({ isLoadingTail: false })
    })
  }

  componentDidUpdate() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
  }

  render() {
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView>
          <TouchableOpacity style={styles.listItem} onPress={this._userEdit}>
            <EvilIcon name='pencil' size={30} color='rgba(0,0,0,.5)' style={styles.itemIcon}/>
            <Text style={styles.itemName}>
              Edit your account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItem} onPress={this._logOut}>
            <Icon name='md-log-out' size={30} color='rgba(0,0,0,.5)' style={styles.itemIcon}/>
            <Text style={styles.itemName}>
              Sign Out - {this.props.appStore.username}
            </Text>
          </TouchableOpacity>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            renderFooter={this._renderFooter}
          />
        </KeyboardAwareScrollView>
      </View>
    )
  }

  _renderRow = (data) => {
    console.log("--- _renderRow ---")
    const timeString = moment(data.timestamp).fromNow()
    return (
      <Post
        postTitle={data.title}
        posterName={data.username}
        postTime={timeString}
        postContent={data.text}
        imagePath={data.image}
        imageWidth={data.imageWidth}
        imageHeight={data.imageHeight}
      />
    )
  }

  _renderFooter = () => {
    console.log("--- _renderFooter ---")
    if (this.state.isLoadingTail) {
      return (
        <View style={styles.waitView}>
          <ActivityIndicator size='large'/>
        </View>
      )
    }
    if (this.state.isEmpty) {
      return (
        <View style={styles.waitView}>
          <Text>Nothing there yet.</Text>
        </View>
      )
    }
  }

  _userEdit = () => {
    Actions.setting()
  }

  _logOut = () => {
    firebaseApp.auth().signOut()
    .then(() => {
      Actions.login({ type: 'replace' });
    }, function(error) {
      console.log(error)
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  waitView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  listItem: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemIcon: {
    marginLeft: 20,
    marginRight: 20
  },
  itemName: {
    fontSize: 14
  }
})