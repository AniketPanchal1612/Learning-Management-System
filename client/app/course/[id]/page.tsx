'use client'
import CourseDetailsPage from '@/app/components/course/CourseDetailPage'
import React from 'react'

type Props = {}

const page = ({params}:any) => {
  return (
    <div>


    <CourseDetailsPage id={params.id} />
    </div>
)
}

export default page