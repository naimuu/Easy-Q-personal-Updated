import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import React from 'react'
import BookList from './BookList'

export default function page() {
  return (
    <div>
        <Breadcrumb pageName='Books'/>
        <BookList/>
    </div>
  )
}
