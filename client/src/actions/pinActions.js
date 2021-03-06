import axios from 'axios';
import { ADD_PIN, DELETE_PIN, ADD_TO_LIKES, REMOVE_FROM_LIKES , 
  LOADING_DATA, LOADED_DATA, LOADING_FAILURE } from './types';

//**Loding initial data **
function loadingData() {
  return {
    type: LOADING_DATA
  }
}

function loadedData(data) {
  return {
    type: LOADED_DATA,
    pins: data
  }
}

function loadingFailure(err) {
  return {
    type: LOADING_FAILURE,
    err
  }
}
//// The asynch function to actually load data
export function loadPins() {
  const url = '/api/pins';
  return (dispatch) => {
    dispatch(loadingData());
    return axios.get(url)
      .then(res=>{
      console.log("response from loadPins", res);
      let pins = res.data.map((pin)=>{
        return {id:pin._id, title:pin.image, 
          likes:pin.likes.map((like)=>like._id), 
          url:pin.sourceUrl, userId:pin.user}
      })
      dispatch(loadedData(pins));
    })
      .catch((err)=>{
        console.log("error from loadPins", err);
        dispatch(loadingFailure(err));
      })
  }
}

//Asynch; adds pin to backend; needs authentication
//Header has been set by setAuthorizationToken
export function createPin(data) {
    const url = '/api/pins'
    return dispatch=> {
      return axios.post(url, data).then(
        res=>{
          //res.data has data about the pin added.
          //use that to dispatch(addPin) here itself
          console.log("response for create pin is", res);
          //we need a pins global state.
          //which contains All the pins. Right now we have less pins 
          //so can afford to have all pins as Dashboard gets rendered or mounted 
          //can dispatch addPin to pins global state here
          if (res.status===200) {
            const {_id, image, likes, sourceUrl, user} = res.data.pincreated;
            dispatch(addPin({id:_id, title:image, likes:likes, url:sourceUrl, userId:user}));
          }
            
        }
      )
    }
  }

//Asynch; removes pin from backend; authentication
//Header has been set by setAuthorizationToken
export function removePin(id) {
  return (dispatch) => {
    const url = `/api/pins/${id}`;
    const access_token = localStorage.getItem('token');
    console.log("token in local storage is", access_token);
    const config = {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }}
    return axios.delete(url, config).then(
      res=>{
        console.log("response for deleting pin", res);
        //if pin has been deleted, dispatch a delPin to remove from store
        //if user not authorized, display message that can't del pin. 
        //del icon visible only when user views his own pins??
        dispatch(delPin(id));//to remove from store state
      })
      .catch((err)=>{
        console.log("error for del pin", err);//not displaying it
      })
  }
}

//These are for adding pins to state in store
export function addPin(pin) {
  return {
    type: ADD_PIN,
    pin
  }
}

export function delPin(id) {
  return {
    type: DELETE_PIN,
    id
  }
}

export function addToLikes (id, userId) {
  return {
    type: ADD_TO_LIKES,
    id,
    userId
  }
}

export function removeFromLikes (id, userId) {
  return {
    type: REMOVE_FROM_LIKES,
    id,
    userId
  }
}

export function likePin(id,userId) {
  return (dispatch) => {
    const url = `/api/pins/like/${id}`;
    return axios.post(url).then(
      res=>{
        console.log("response for liking pin", res);
        // if pin has been liked, increment counter etc ie dispatch incCounter
        // like or unlike button depending on if user has already liked it or not
        dispatch(addToLikes (id, userId));
      })
      .catch((err)=>{
        console.log("error for liking pin", err);//not displaying it
      })
  }
}

export function unlikePin(id, userId) {
  return (dispatch) => {
    const url = `/api/pins/unlike/${id}`;
    console.log("unliking pin");
    return axios.post(url).then(
      res=>{
        console.log("response for unliking pin", res);
        //if pin has been unliked, dispatch a reduce counter kind of thing
        // unlike icon 
        dispatch(removeFromLikes(id, userId));
      })
      .catch((err)=>{
        console.log("error for unliking pin", err);//not displaying it
      })
  }
}