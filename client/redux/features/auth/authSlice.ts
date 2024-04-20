import { createSlice } from "@reduxjs/toolkit";


const initialState={
    token:"",
    user:""
}

// slice like reducers
const authSlice =createSlice({
    name:"auth",
    initialState,
    reducers:{
        userRegistration:(state,action)=>{
            state.token = action.payload.token
        },
        userLogin:(state,action)=>{
            state.token = action.payload.accessToken,
            state.user = action.payload.user
        },
        userLoggedOut:(state)=>{
            state.token = '',
            state.user = ''
        }
    }
})


export const {userRegistration,userLoggedOut,userLogin} = authSlice.actions

export default authSlice.reducer