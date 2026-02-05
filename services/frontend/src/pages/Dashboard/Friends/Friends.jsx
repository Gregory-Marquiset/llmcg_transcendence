import '../../../styles/App.css'
import './Friends.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'
import { FriendList, RequestList} from '../../../components'
import { useAuth } from '../../../context/AuthContext'
function MyFriends() {
    const [isLoading, setIsLoading] = useState(false);
    const {errStatus, setErrStatus}= useAuth();
    if (isLoading) return <Loading duration={400}  showButton={false}/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading}/>
            <div className='content-container'>
              <FriendList />
              <RequestList />
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default MyFriends