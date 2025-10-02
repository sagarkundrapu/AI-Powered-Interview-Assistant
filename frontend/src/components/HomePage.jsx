import React from 'react'
import ResumeUpload from './ResumeUpload'
import ResumeDetails from './ResumeDetails'
import UploadPage from './UploadPage'
import Dashboard from './Dashboard'

const HomePage = ({token,role}) => {
  return (
    <>
    {
      console.log("Role in HomePage:", role)
    }
     {role==="admin" ? <Dashboard/>
       : <UploadPage token={token}/>}
    </>
  )
}

export default HomePage