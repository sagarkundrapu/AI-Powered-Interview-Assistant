import UploadPage from './UploadPage'
import Admin from './Admin'

const HomePage = ({token,role}) => {
  return (
    <>
     {role==="admin" ? <Admin token={token}/>
       : <UploadPage token={token}/>}
    </>
  )
}

export default HomePage