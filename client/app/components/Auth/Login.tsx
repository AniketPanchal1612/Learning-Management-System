"use client";
import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiFillGithub,
} from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { styles } from "../../styles/style";
import { error } from "console";
import { useLoginMutation } from "../../../redux/features/auth/authApi";
import toast from "react-hot-toast";
import {signIn} from 'next-auth/react'

type Props = {
  setRoute: (route: string) => void;
  setOpen: (open:boolean)=>void;
  refetch?:any
};

const schema = Yup.object().shape({
  email: Yup.string().email("Invalid Email").required("Please enter email"),
  password: Yup.string().required("Please enter password").min(6),
});

const Login: FC<Props> = ({setRoute,setOpen,refetch}) => {
  const [passwordShow, setPasswordShow] = useState(false);
  const [login,{isSuccess,isError,data,error}] = useLoginMutation()


  // console.log("Login Comp");
  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      // console.log(email, password);
      await login({email,password})
    },
  });

  useEffect(()=>{
    if(isSuccess){
      toast.success('Login Successfully')
      setOpen(false)
      refetch()

    }
    if(error){
      if('data' in error){
        const errorData =  error as any;
        toast.error(errorData.data.message);
      }
    }
  },[isSuccess,error])

  const { errors, touched, values, handleChange, handleSubmit } = formik;
  return (
    <div className="w-full">
      <h1 className={`${styles.title}`}>Login with Elearning</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" className={`${styles.label}`}>
          Enter your Email
        </label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          id="email"
          placeholder="example@gmail.com"
          className={`${errors.email && touched.email && "border-red-500"} ${
            styles.input
          }`}
        />
        {errors.email && touched.email && (
          <span className="text-red-500 pt-2 block">{errors.email}</span>
        )}

        <div className="w-full mt-5 relative mb-1">
          <label className={`${styles.label}`} htmlFor="email">
            Enter your password
          </label>
          <input
            type={!passwordShow ? "password" : "text"}
            name="password"
            value={values.password}
            onChange={handleChange}
            id="password"
            placeholder="Abc@123#"
            className={`${
              errors.password && touched.password && "border-red-500"
            } ${styles.input}`}
          />
          {passwordShow ? (
            <AiOutlineEye
              className="absolute bottom-3 right-2 z-1 cursor-pointer"
              onClick={() => setPasswordShow(false)}
              size={20}
            />
          ) : (
            <AiOutlineEyeInvisible
              className="absolute bottom-3 right-2 z-1 cursor-pointer"
              onClick={() => setPasswordShow(true)}
              size={20}
            />
          )}
          {errors.password && touched.password && (
            <span className="text-red-500 pt-2 block">{errors.password}</span>
          )}
        </div>

        <div className="w-full mt-5">
          <input type="submit" value="Login" className={`${styles.button}`} />
        </div>

        <br />
        <br />
        <h5 className="text-center pt-4 font-Poppins text-[14px] text-black dark:text-white">
          Or join with
        </h5>

        <div className="flex items-center justify-center my-3">
          <FcGoogle size={30} className="cursor-pointer mr-2"
          onClick={()=> signIn('google')}
          />
          <AiFillGithub size={30} className="cursor-pointer ml-2"
          onClick={()=>signIn('github')}
          />
        </div>
        <h5 className="text-center pt-4 font-Poppins text-[14px]">
          Not have any account?{" "}
          <span
            className="text-[#2190ff] pl-1 cursor-pointer"
            onClick={() => setRoute("Sign-Up")}
          >
            Sign up
          </span>
        </h5>
      </form>
    </div>
  );
};

export default Login;
