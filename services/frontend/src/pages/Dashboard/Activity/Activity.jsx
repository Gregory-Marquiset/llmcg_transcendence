import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'
function Activity() {
    const [isLoading, setIsLoading] = useState(false);
    if (isLoading) return <Loading/>
    return (
      <>
        <Background>
          <div className="page-wrapper">
            <HeaderBar/>
            <div className='core-container'>
              <LeftMenu setIsLoading={setIsLoading}/>
              <div className='content-container'>
                <h1>HELLO</h1>
              </div>
            </div>
          </div>
          <Footer/>
        </Background>
      </>
    )
}

export default Activity