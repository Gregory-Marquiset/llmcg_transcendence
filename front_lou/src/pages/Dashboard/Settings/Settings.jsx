import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu} from '../../../components'

function Settings() {
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <h1>Settings</h1>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Settings