// actions


// entry point
import { apiSlice } from "../api/apiSlice";
import { userLoggedin, userRegistration } from "./authSlice";

type RegistrationResponse ={
    message:string,
    activationToken:string
}

type RegistrationData={}


export const authApi = apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        //endpoints
        register:builder.mutation<RegistrationResponse,RegistrationData>({
            query:(data)=>({
                url:"register",
                method:"POST",
                body:data,
                credentials:"include" as const
            }),

            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                try {
                    const result = await queryFulfilled
                    dispatch(
                        userRegistration({
                            token: result.data.activationToken
                        })
                    )     
                } catch (error) {
                    console.log(error)
                }
            }
        }),

        activation: builder.mutation({
            query:({activation_token,activation_code})=>({
                url:'activate-user',
                method:"POST",
                body:{
                    activation_token,
                    activation_code
                }
            })
        }),

        login: builder.mutation({
            query:({email,password})=>({
                url:"login",
                method:"POST",
                body:{email,password},
                credentials:"include" as const
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                try {
                    const result = await queryFulfilled
                    dispatch(
                        userLoggedin({
                            accessToken:result.data.activationToken,
                            user: result.data.user
                        })
                    )
                } catch (error) {
                    console.log(error)
                }
            }
        }),


        socialAuth: builder.mutation({
            query:({email,name,avatar})=>({
                url:"social-auth",
                method:"POST",
                body:{email,name,avatar},
                credentials:"include" as const
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                try {
                    const result = await queryFulfilled
                    dispatch(
                        userLoggedin({
                            accessToken:result.data.activationToken,
                            user: result.data.user
                        })
                    )
                } catch (error) {
                    console.log(error)
                }
            }
        }),
        
    })
})

export const {useRegisterMutation, useActivationMutation, useLoginMutation, useSocialAuthMutation} = authApi