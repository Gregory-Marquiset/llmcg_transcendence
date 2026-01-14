import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu} from '../../../components'

function MyAchievement() {
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
            <div className='content-container'>
              <h1>achievement</h1>
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default MyAchievement