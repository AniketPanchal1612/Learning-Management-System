'use client'
import React,{FC,useState} from "react" 
import Heading from "./utils/Heading"
import Header from "./components/Header"
import Hero from "./components/Route/Hero"

interface Props{};

const Page: FC<Props> = (props)=>{
  const [open,setOpen] = useState(false); //login
  const [activeItem,setActiveItem] = useState(0) //active header items
  const [route,setRoute] = useState('Login')
  
  
  return (
    <div >
        <Heading title='E-Learn' description="Learn and Upskill" keywords="MERN, AI/ML, Software Engineer" />
        <Header 
        open={open} 
        setOpen={setOpen} 
        activeItem={activeItem}
        setRoute = {setRoute}
        route = {route}
        />
        <Hero />
    </div>
  )
}

export default Page