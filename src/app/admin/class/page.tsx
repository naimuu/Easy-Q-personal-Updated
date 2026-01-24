import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import React from 'react'
import ClassList from './ClassList'

export default function page() {
  return (
    <div>
        <Breadcrumb pageName='Class'/>
        <ClassList/>
    </div>
  )
}
