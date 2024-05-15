"use client";
import Heading from "../../../utils/Heading";
import AdminSidebar from "../../../components/Admin/sidebar/AdminSidebar";
import React from "react";
import CreateCourse from "../../../components/Admin/course/CreateCourse";
import EditCourse from "../../../components/Admin/course/EditCourse";
CreateCourse
type Props = {};

const page = ({params}:any) => {

    const id = params?.id;
  return (
    <div>
      <Heading
        title="Elearning - Admin"
        description="ELearning is a platform for students to learn and get help from teachers"
        keywords="Prograaming,MERN,Redux,Machine Learning"
      />

      <div className="flex">
        <div className="1500px:w-[16%] w-1/5">
          <AdminSidebar />
        </div>
        <div className="w-[85%]">
          {/* <DashboardHeader /> */}
          {/* <CreateCourse /> */}
          <EditCourse id={id} />
        </div>
      </div>
    </div>
  );
};

export default page;
