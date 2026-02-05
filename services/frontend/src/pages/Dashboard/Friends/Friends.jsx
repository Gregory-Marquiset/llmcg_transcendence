import '../../../styles/App.css'
import './Friends.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'
import { FriendList, RequestList} from '../../../components'

function MyFriends() {
    const [refresh, setRefresh] = useState(0)
    const triggerRefresh = () => {
      setRefresh(prev => prev + 1)
    }
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
              <FriendList refresh={refresh} />
              <RequestList refresh={refresh} onActionDone={triggerRefresh} />
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}



export default MyFriends