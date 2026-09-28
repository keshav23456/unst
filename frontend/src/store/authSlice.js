import {createSlice} from '@reduxjs/toolkit';

const initialState =  {
    status: false,
    userData: null,
    // false until the first /current-user call resolves. Route guards wait
    // for this so a page refresh doesn't redirect a signed-in user away.
    checked: false,
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        login:(state,action)=>{
            state.status = true;
            state.userData = action.payload.userData;
            state.checked = true;
        },
        logout:(state)=>{
            state.status = false;
            state.userData = null;
            state.checked = true;
        }
    }
})

export const {login,logout} = authSlice.actions;

export default authSlice.reducer;
