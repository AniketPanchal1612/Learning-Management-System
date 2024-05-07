"use client";
import Heading from "../../utils/Heading";
import AdminSidebar from "../../components/Admin/sidebar/AdminSidebar";
import React from "react";
import CreateCourse from "../../components/Admin/course/CreateCourse";
import DashboardHero from "../../components/Admin/DashboardHero";
import AllCourses from "../../components/Admin/course/AllCourses";
type Props = {}

const page = (props: Props) => {
  return (
<div>
      <Heading
        title="Elearning - Admin"
        description="ELearning is a platform for students to learn and get help from teachers"
        keywords="Prograaming,MERN,Redux,Machine Learning"
      />

      <div className="flex h-screen">
        <div className="1500px:w-[16%] w-1/5">
          <AdminSidebar />
        </div>
        <div className="w-[85%]">
          <DashboardHero />
          <AllCourses />
        </div>
      </div>
    </div>  )
}

export default page