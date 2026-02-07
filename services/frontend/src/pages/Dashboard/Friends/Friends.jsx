import '../../../styles/App.css'
import './Friends.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'
import { FriendList, RequestList} from '../../../components'
import { useWS } from '../../../context/WebSocketContext.jsx'

function MyFriends() {
    const [refresh, setRefresh] = useState(0)
    const triggerRefresh = () => {
      setRefresh(prev => prev + 1)
    }
    const [isLoading, setIsLoading] = useState(false);
    const { presenceMap, isConnected } = useWS()

    if (isLoading) return <Loading duration={400}  showButton={false}/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading}/>
            <div className='content-container'>
              <FriendList refresh={refresh} presenceMap={presenceMap} isWSConnected={isConnected} />
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
