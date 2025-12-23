import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu} from '../../../components'

function Profile() {
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <h1>Profile</h1>
          </div>
        <Footer/>
      </Background>
    </>
  )
}

export default Profile