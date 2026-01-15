import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'

function Conversations() {
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
              <h1>Conversations</h1>
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Conversations