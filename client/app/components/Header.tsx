"use client";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import NavItems from "../utils/NavItems";
import ThemeSwitcher from "../utils/ThemeSwitcher";
import { HiOutlineMenuAlt3, HiOutlineUserCircle } from "react-icons/hi";
import CustomModel from "../utils/CustomModel";
import Login from "./Auth/Login";
import SignUp from "./Auth/SignUp";
import Verification from "./Auth/Verification";
import { useSelector } from "react-redux";
import Image from "next/image";
import avatar from '../../public/assets/avatar.png'
import { useSession } from "next-auth/react";
import { useLogOutQuery, useSocialAuthMutation } from "@/redux/features/auth/authApi";
import toast from "react-hot-toast";
type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  route:string,
  setRoute: (route:string)=>void;
};

const Header: FC<Props> = ({activeItem,setOpen,route,open,setRoute}) => {
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [logout,setLogout] = useState(false)

  const {user} = useSelector((state:any)=> state.auth) ; // user from store

  const {data} = useSession() // social auth data
  const [socialAuth,{isSuccess,error}] = useSocialAuthMutation()
  const {} = useLogOutQuery(undefined,{
    skip : !logout ?true:false
  })
  console.log(data)

  useEffect(()=>{
    if(!user){
      if(data){
        socialAuth({email:data?.user?.email,name:data?.user?.name, avatar: data?.user?.image})
      }
    }
    if(data===null){
      if(isSuccess){
        toast.success('Login Successful')
      }
    }
    if(data ===null){
      setLogout(true)
    }
  },[user,data])



  // console.log(user)


  //sticky scrollbar logic
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 85) {
        setActive(true);
      } else {
        setActive(false);
      }
    });
  }

  const handleClose =(e:any)=>{
    console.log()
    // if(e.target.id==='screen'){
      console.log("object")
      setOpenSidebar(false)
    // }
  }

  return (
    <div className="w-full relative">
      <div
        className={`${
          active
            ? "dark:bg-opacity-50 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 w-full h-[80px] z-[80] border-b dark:border-[#ffffff1c] shadow-xl transition duration-500"
            : "w-full border-b dark:border-[#ffffff1c] h-[80px] z-[80] dark:shadow"
        }`}
      >
        <div className="w-[95%] 800px:w-[92%] m-auto py-2 h-full ">
          <div className="w-full h-[80px]  flex item-center justify-between p-3">
            <div>
                <Link href={'/'} className="text-[25px] font-Poppins font-[500] text-black dark:text-white ">E-Learn</Link>
            </div>

            <div className="flex items-center">
                <ThemeSwitcher />
                <NavItems activeItem={activeItem} isMobile={false} ></NavItems>

                {/* mobile */}
                <div className="800px:hidden">
                  <HiOutlineMenuAlt3 size={25} className="cursor-pointer dark:text-white text-black" onClick={()=>setOpenSidebar(true)} />
                </div>

                {
                  user ?(
                    <Link href={'/profile'}>
                    <Image
                    className="w-[30px] h-[30px] rounded-full cursor-pointer"
                    src={user.avatar ? user.avatar.url : avatar}
                    width={30}
                    height={30} 
                    // onClick={()=>setOpen(true)}
                    alt=''
                    style={{border: activeItem===5 ? '2px solid yellow':"none"}}
                    />
                    </Link>
                  ):(

                    <HiOutlineUserCircle size={25} className="cursor-pointer dark:text-white text-black" onClick={()=>setOpen(true)} />
                  )
                }
            </div>
          </div>
        </div>
        {/* mobile sidebar */}
        {
          openSidebar &&(
            <div 
            className="fixed w-full h-screen top-0 left-0 z-[99999] dark:bg-[unset] bg-[#00000024]"
            onClick={handleClose}
            id="screen">
                <div className="w-[70%] fixed z-[999999999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
              <NavItems activeItem={activeItem} isMobile={true} />
              <HiOutlineUserCircle
                  size={25}
                  className="hidden 800px:block cursor-pointer dark:text-white text-black"
                  onClick={() => setOpen(true)}
                />
              
              <br />
              <br />
              <p className="text-[16px] px-2 pl-5 text-black dark:text-white">
                Copyright © 2023 ELearning
              </p>
              </div>
            </div>
          )
        }
      </div>


      {/*  */}
      {
        route==="Login" &&(
          <>
          {
            open &&(
              <CustomModel 
              open ={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Login}

              />
            )
          }
          </>
        )

      }
      {
        route==="Sign-Up" &&(
          <>
          {
            open &&(
              <CustomModel 
              open ={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={SignUp}

              />
            )
          }
          </>
        )

      }
      {
        route==="Verification" &&(
          <>
          {
            open &&(
              <CustomModel 
              open ={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Verification}
              />
            )
          }
          </>
        )

      }
    </div>
  );
};

export default Header;
