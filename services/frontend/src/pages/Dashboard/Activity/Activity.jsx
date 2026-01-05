import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu} from '../../../components'

function Activity() {
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
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