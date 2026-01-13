import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu} from '../../../components'

function ExportData() {
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu/>
            <div className='content-container'>
              <h1>Exporter mes data</h1>
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default ExportData