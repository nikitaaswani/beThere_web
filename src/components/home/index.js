import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Header from '../header/index';
import Data from '../../services/data';
import API from '../../services/api';
import './style.css';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
// import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import PopUp from '../popup';
import Radio from '@material-ui/core/Radio';
import Pulse from 'react-reveal/Pulse';
import Fade from 'react-reveal/Fade';
import Bounce from 'react-reveal/Bounce';
import CancelIcon from '@material-ui/icons/Cancel';

// Transition

import Slide from '@material-ui/core/Slide';
import Paper from '@material-ui/core/Paper';
import Collapse from '@material-ui/core/Collapse';
import Grow from '@material-ui/core/Grow';


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open:false,
      selectedIndex:'0',
      redirect:false,
      anchorRef:null,
      currentDate:'',
      currentDay:'',
      currentMonth:'',
      currentYear:'',
      selectedOption: 'present',
      user: {},
      geoLocation: {
        lat: 0,
        lng: 0
      },
      // showSlider: true,
      hasMarkedTodayAttendance: false,
      errorMsg: '',
      wfhDisabled: true,
      loading: true,
      location:null,
      errorMessage:null,
      position:null,
      locationPermission: false,
      submitLoading: false,
      showSubmitButton: true,
      flag_WFH: false
    }
    this.reRender = () => {
      console.log(' in re render');
      this.getGeoLocation();
    };
  }

  handleClose = (event) => {
    console.log('snackbar closed');
    this.setState({showSubmitButton: true});
    if (this.state.anchorRef && this.state.anchorRef.contains(event.target)) {
      return;
    }
    this.setState({open:false})
  }

  handleOption = async (option) => {
    let validWFH = true;
    if (option === 'wfh') {
      this.setState({flag_WFH: true});
      if ( !this.state.wfhDisabled ) {
        validWFH = false;
      }
    }
    try {
      // window.navigator.vibrate(100);
      if ( !validWFH ) {
        this.setState({selectedOption: option});
        window.navigator.vibrate(100);
      } else {
        window.navigator.vibrate([200, 100, 200]);
      }
    } catch(err ) {
      console.log('vibration error :', err);
    }
  }

  handleSubmit = async () => {
    this.setState({submitLoading: true});
    let user_id = Data.getData('user')._id;
    let gotGeolocation = await this.getGeoLocation();
    console.log(' got geolocation :', gotGeolocation);
    // if ( !gotGeolocation) {

    // }
    let result = await API.postAttendance(user_id, {status: this.state.selectedOption, geoLocation: this.state.geoLocation});
    console.log('submit result :',result)
    if (result.success ) {
      try {
        window.navigator.vibrate(100);
      } catch(err ) {
      }
      // this.setState({showSlider: false});
      this.setState({open:true, errorMsg: result.msg, hasMarkedTodayAttendance: true});
    } else {
      try {
        window.navigator.vibrate([200, 100, 200]);
      } catch(err ) {
      }
      this.setState({open:true, errorMsg: result.msg});
    }
    this.setState({showSubmitButton: false});
    this.setState({submitLoading: false})
  }

  checkIfAttendanceMarked = async () => {
    let result =  await API.getAttendance();
    this.setState({loading: false})
    if (result === true) {
      this.setState({hasMarkedTodayAttendance: result});
    }

  }

  getGeoLocation = async () => {
    return new Promise( (resolve, reject) => {
      navigator.geolocation.getCurrentPosition (
        (position) => {
          let lat = position.coords.latitude
          let lng = position.coords.longitude
          let geoLocation = {lat: lat, lng: lng};
          console.log("getCurrentPosition Success " + lat + lng); // logs position correctly
          this.setState({locationPermission: true});
          this.setState({geoLocation});
          resolve(true);
        },
        (error) => {
          this.setState({locationPermission: false});
          console.error("geolocation error :",error);
          resolve(false);

        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        ) 
    })
  }

  checkIfValidTimeForWFH = ( ) => {
    let hr =  new Date().getHours();
    let min = new Date().getMinutes();
    if (hr <= 10) {
      this.setState({wfhDisabled: false});
    } 
    else if (hr === 10  &&  min <= 30) {
      this.setState({wfhDisabled: false});
    }
  }

  async componentDidMount () {
    this.checkIfValidTimeForWFH()
    this.getGeoLocation();
    let user = Data.getData('user');
    let date=new Date().toLocaleDateString('en-US', {day: 'numeric'})
    let month=new Date().toLocaleDateString('en-US', {month: 'short'})
    // let year=new Date().toLocaleDateString('en-US', {year: 'numeric'})
    let day= new Date().toLocaleDateString('en-US', {weekday:'long'});
    let currentDate = date + ' ' + month;
    // this.setState({currentDate:date});
    this.setState({user});
    this.setState({currentMonth:month});
    // this.setState({currentYear:year});
    this.setState({user, currentDay:day, currentDate});
    await API.postUser({email:user.email});
    this.checkIfAttendanceMarked();
    }

    // getWFHClass = () => {
    //     if (this.state.wfhDisabled) {
    //       return "buttonDisabled";
    //     }
    //     else {
    //       if (this.state.selectedOption === "WFH") {
    //         return "buttonEnabled selected";
    //       } else {
    //         return "buttonEnabled";
    //       }
    //   } 
    // }
    // getPresentClass = () => {
    //     if (this.state.selectedOption === "PRESENT") {
    //       return "buttonEnabled selected";
    //     } else {
    //       return "buttonEnabled";
    //     }
    // }

    // handleSubmit = () => {
    //   this.setState({submitLoading: true})
    // }
    
  render () {
   
  return(
    <div className="wrapper_content">
      <div><Header /></div>
      {/* {
        !this.state.locationPermission ? 
        <PopUp />
        : null
      } */}
        <div className="main_wrapper">
          {
          this.state.loading ?
          (
            <div className="empCard loadingWrapper">
              <CircularProgress color="secondary" />
            </div>
          )
          :
          <Fade>
          <div className="content">
            <div>
              {/* <Pulse> */}
              {/* <Grow
                style={{ transformOrigin: '0 0 0' }}
                 timeout='1000'
              > */}
                <div className="content-greetings-primary">
                    welcome, {this.state.user.name}
                </div>
              {/* </Grow> */}
              {/* </Pulse> */}
              <div className="content-greetings-secondray">
                <div>
                  Hope you had a great 
                </div>
                <div>
                  sleep, time to start a fresh
                </div>
                <div>
                  day!
                </div>
              </div>
              <div className="line">
                _______
              </div>
            </div>
            <div className="content-instruction">
              MARK YOUR ATTENDANCE
            </div>
            <Bounce >
              <div className="date-wrapper">
                <div className="date--wrapper-day">
                  {this.state.currentDay},
                </div>
                <div className="date-wrapper-date">
                  {this.state.currentDate}
                </div>
              </div>
            </Bounce>
            {
              this.state.flag_WFH ? 
              <Slide direction="up" in={this.state.flag_WFH} mountOnEnter unmountOnExit>
                <Paper elevation={4} className='wfh-selection-wrapper'>
                  <h1>
                     why are you working from home.
                  </h1>
                </Paper>
              </Slide>
              : 
                <div className="options-wrapper">
                <div className="option-1" onClick={() => this.handleOption('wfh')}>
                  {/* <Radio
                    checked={this.state.selectedOption === 'wfh'}
                    // onChange={() => this.handleOption('wfh')}
                    value="wfh"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'A' }}
                    disabled={this.state.wfhDisabled}
                  /> */}
                  {/* Work From Home */}
                  <Button variant="contained" className='submit'>
                      Work from Home
                  </Button>
                </div>
                <div className="option-2" onClick={() => this.handleOption('present')}>
                  {/* <Radio
                    checked={this.state.selectedOption === 'present'}
                    onChange={() => this.handleOption('present')}
                    value="office"
                    name="radio-button-demo"
                    inputProps={{ 'aria-label': 'B' }}
                  /> */}
                  {/* Work from Office */}
                  <Button variant="contained" className='submit'>
                      Work from Office
                  </Button>
                </div>
              </div>
            }
            {
              this.state.showSubmitButton ?
              <div className="submit-wrapper">
              {/* Submit */}
              {/* <Button variant="contained" className={this.state.submitLoading ? 'transition submit ': 'submit'}
              onClick={() => this.handleSubmit()}> */}
              <Button variant="contained" className='submit'
              onClick={() => this.handleSubmit()}>
                {
                  this.state.submitLoading ? <CircularProgress color="secondary" />
                  : 'submit'
                }
              </Button>
            </div> : 
            <div className="submit-wrapper">
            </div>
            }
          </div>
          </Fade>
        }
        </div>  {/* content */}
        <Snackbar
						anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						open={this.state.open}
						onClose={() => this.handleClose ()}
						ContentProps={{
						'aria-describedby': 'message-id',
            }}
            className="snackbar-wrapper"
						message={
            <div id="message-id" className="snackbar-text">
                <div>
                  {this.state.errorMsg}
                </div>
                <div>
                <CancelIcon />
                </div>
            </div>}
				/>
        
    </div>
    )
  }
   
}

export default Home;
