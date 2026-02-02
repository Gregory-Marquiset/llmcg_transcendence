import '../../../styles/App.css'
import './Friends.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'
import { FriendList} from '../../../components'

function MyFriends() {
    const accessToken = localStorage.getItem("access_token");
    const [isLoading, setIsLoading] = useState(false);
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
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default MyFriends