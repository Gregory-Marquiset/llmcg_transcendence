import '../../styles/App.css'
import './DashboardStyles.css'
import { Footer, Background, HeaderBar, LeftMenu} from '../../components'
import { useEffect, useState } from 'react'


function Dashboard() {
  const [quote, setQuote] = useState();



  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
            <div className='content-container'>
              \
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Dashboard