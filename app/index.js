import React, { Component } from 'react';
import {
  AlertIOS,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import AppleHealthKit from 'react-native-apple-healthkit';
import BackgroundFetch from 'react-native-background-fetch';
import moment from 'moment';
import base64 from 'base-64';

import { HKOPTIONS } from './healthkit';
import css from './styles';

const initialState = {
  currentDate: moment().format('YYYYMMDD'),
  cyclingDistance: {},
  heartRate: [],
  inputAddress: '',
  sleepAnalysis: [],
  stepCount: {},
  stepCountSamples: [],
  updateTime: null,
  walkingRunningDistance: {},
  weight: {},
  bodyfatpercentage: {},
  bmi: {},
  pressed: false,
  username: '',
  password: '',
}

export default class healthPulse extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentWillMount() {
    AsyncStorage.getItem('address').then((value) => {
        this.setState({inputAddress: value});
    }).done();
    AsyncStorage.getItem('username').then((value) => {
        this.setState({username: value});
    }).done();
    AsyncStorage.getItem('password').then((value) => {
        this.setState({password: value});
    }).done();
  }

  componentDidMount() {
    const self = this;

    AppleHealthKit.isAvailable((err,available) => {
      if(available){
        AppleHealthKit.initHealthKit(HKOPTIONS, (err, res) => {
          if(this.handleHKError(err, 'initHealthKit')){
              return;
          }
        });
      }
    });

    BackgroundFetch.configure({
      stopOnTerminate: false
    }, function() {
      self.pushData();
    }, function(error) {
      AlertIOS.alert('Error','BackgroundFetch failed to start')
    });
  }

  urlValidator(str) {
    var pattern = new RegExp('https?\:\/\/[^\/\s]+(\/.*)?$');

    if(!pattern.test(str)) {
      AlertIOS.alert('Error', 'Please enter a valid URL');
      return false;
    } else {
      return true;
    }
  }

  pushData() {
    const currentDate = moment().format('YYYYMMDD');
    let dataToPush = {
      date: currentDate,
    }

    return Promise.resolve()
      .then(() => {
        return this.fetchHeartRateToday();
      }).then((samples) => {
        dataToPush.heartRate = samples;
        return this.fetchTotalStepCountToday();
      }).then((count) => {
        dataToPush.stepCount = count;
        return this.fetchCyclingDataToday();
      }).then((distance) => {
        dataToPush.cyclingDistance = distance;
        return this.fetchWalkingRunningDataToday();
      }).then((distance) => {
        dataToPush.walkingRunningDistance = distance;
        return this.fetchSleepDataToday();
      }).then((sleep) => {
        dataToPush.sleepAnalysis = sleep;
        return this.fetchStepRateToday();
      }).then((samples) => {
        dataToPush.stepCountSamples = samples;
        return this.fetchBMIDataToday();
      }).then((bmi) => {
        dataToPush.bmi = bmi;
        return this.fetchBodyFatPercentage();
      }).then((bodyfatpercentage) => {
        dataToPush.bodyfatpercentage = bodyfatpercentage;        
        return this.fetchWeightDataToday();
      }).then((weight) => {
        dataToPush.weight = weight;
        if (this.urlValidator(this.state.inputAddress)){
          let url = this.state.inputAddress;

          fetch(url, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Basic ${base64.encode(`${this.state.username}:${this.state.password}`)}`
            },
            body: JSON.stringify(dataToPush),
          }).then((data) => {
            BackgroundFetch.finish();

            if (data.status >= 400) {
              AlertIOS.alert('Error', `HTTP error: ${data.status}`);
              return;
            }

            if (moment().diff(this.state.currentDate, 'days') > 0) {
              this.setState(initialState);
            }

            return this.setState({ updateTime: moment().format('hh:mm:ss a'), currentDate });
          }).catch((error) => {
            BackgroundFetch.finish();  
            AlertIOS.alert('Error', `An error occured while pushing the data: ${error}`);
          });
        }
      });
  }

  handleHKError(err, method) {
    if(err){
      return true;
    }
    return false;
  }

  fetchTotalStepCountToday() {
    const options = {
        date: new Date().toISOString()
    };

    return new Promise((resolve) => {
      AppleHealthKit.getStepCount(options, (err, steps) => {
        if(this.handleHKError(err, 'getStepCount')){
            resolve(this.state.stepCount);
            return;
        }
        this.setState({ stepCount: steps });
        resolve(steps);
      });
    });
  }

  fetchStepRateToday() {
    let d = new Date();
    d.setHours(0,0,0,0);

    const options = {
      startDate: d.toISOString(),
      endDate:   (new Date()).toISOString(),
    };

    return new Promise((resolve) => {
      AppleHealthKit.getDailyStepCountSamples(options: Object, (err, samples) => {
        if(this.handleHKError(err, 'getDailyStepCountSamples')){
            resolve(this.state.stepCountSamples);
            return;
        }
        this.setState({ stepCountSamples: samples })
        resolve(samples);
      });  
    });
  }

  fetchHeartRateToday() {
    let d = new Date();
    d.setHours(0,0,0,0);

    const options = {
      unit: 'bpm',
      startDate: d.toISOString(),
      endDate: (new Date()).toISOString(),
      ascending: false,
    };

    return new Promise((resolve) => {
      AppleHealthKit.getHeartRateSamples(options, (err, samples) => {
        if(this.handleHKError(err, 'getHeartRateSamples')){
          resolve(this.state.heartRate);
          return;
        }
        this.setState({ heartRate: samples });
        resolve(samples);
      });
    });
  }

  fetchCyclingDataToday() {
    const options = {
      unit: 'meter',
      date: (new Date()).toISOString(),
    };
    return new Promise((resolve) => {
      AppleHealthKit.getDistanceCycling(options, (err, distance) => {
        if(this.handleHKError(err, 'getDistanceCycling')){
            resolve(this.state.cyclingDistance);
            return;
        }
        this.setState({ cyclingDistance: distance })
        resolve(distance);
      });
    });
  }

  fetchWalkingRunningDataToday() {
    const options = {
      unit: 'meter',
      date: (new Date()).toISOString(),
    };

    return new Promise((resolve) => {
      AppleHealthKit.getDistanceWalkingRunning(options, (err, distance) => {
        if(this.handleHKError(err, 'getDistanceWalkingRunning')){
            resolve(this.state.walkingRunningDistance)
            return;
        }
        this.setState({ walkingRunningDistance: distance });
        resolve(distance);
      });
    });
  }

  fetchWeightDataToday() {
    const options = {
      unit: 'gram',
      date: (new Date()).toISOString(),
    };

    return new Promise((resolve) => {
      AppleHealthKit.getLatestWeight(options, (err, weight) => {
        if(this.handleHKError(err, 'getLatestWeight')){
            resolve(this.state.weight)
            return;
        }
        this.setState({ weight });
        resolve(weight);
      });
    });
  }

  fetchBodyFatPercentage() {
    return new Promise((resolve) => {
      AppleHealthKit.getLatestBodyFatPercentage(null, (err, bodyfatpercentage) => {
        if(this.handleHKError(err, 'getLatestBodyFatPercentage')){
            resolve(this.state.bodyfatpercentage)
            return;
        }
        this.setState({ bodyfatpercentage });
        resolve(bodyfatpercentage);
      });
    });
  }

  fetchBMIDataToday() {
    return new Promise((resolve) => {
      AppleHealthKit.getLatestBmi(null, (err, bmi) => {
        if(this.handleHKError(err, 'getLatestBmi')){
            resolve(this.state.bmi)
            return;
        }
        this.setState({ bmi });
        resolve(bmi);
      });
    });
  }

  fetchSleepDataToday() {
    let d = new Date();
    d.setHours(0,0,0,0);

    const options = {
      startDate: d.toISOString(),
      endDate: (new Date()).toISOString(),
    };

    return new Promise((resolve) => {
      AppleHealthKit.getSleepSamples(options, (err, samples) => {
        if(this.handleHKError(err, 'getSleepSamples')){
          resolve(this.state.sleepAnalysis);
          return;
        }
        this.setState({ sleepAnalysis: samples });
        resolve(samples);
      });
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>
      <View style={styles.container}>
        <StatusBar/>
        <View style={styles.textContainer}>
        <Text style={styles.mainTitle}>
          Push my
        </Text>
        <Text style={styles.mainTitle}>
          HealthKit data to
        </Text>
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => {
              AsyncStorage.setItem('address', text)
              this.setState({ inputAddress: text })
            }}
            value={this.state.inputAddress}
            placeholder="Enter valid endpoint here"
          />
        </View>
        <Text style={styles.update}>
          Basic authentication credentials
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => {
              AsyncStorage.setItem('username', text)
              this.setState({ username: text })
            }}
            value={this.state.username}
            placeholder="Username"
          />
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => {
              AsyncStorage.setItem('password', text)
              this.setState({ password: text })
            }}
            value={this.state.password}
            placeholder="Password"
            secureTextEntry
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.instructions}>
            Your accessible health data from HealthKit will be pushed
            automatically to the selected endpoint when this app runs
            in the background.
          </Text>
        </View>
        <Text style={styles.update}>
          {this.state.updateTime ? `Last update: ${this.state.updateTime}` : null}
        </Text>
        <View style={styles.buttonContainer}>
        <TouchableHighlight
          onPress={this.pushData.bind(this)}
          style={[styles.button, this.state.pressed ? {backgroundColor: '#CD3260'} : {}]}
          onHideUnderlay={()=>{this.setState({pressed: false})}}
          onShowUnderlay={()=>{this.setState({pressed: true})}}
        >
          <Text style={styles.buttonInside}>
            Push data
          </Text>
        </TouchableHighlight>
        </View>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create(css);
