import { useNavigate } from 'react-router-dom'
import { logoheader, favicon } from '../../assets'
import '../../styles/App.css'
import './DashboardStyles.css'
import { Button, Footer, Background } from '../../components'

function Dashboard() {
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <div className="header-bar">
            <div className="group-search-bar">
              <form>
                <label> </label>{' '}
                <input
                  type="text"
                  className="feild px-4 py-2 rounded-lg w-80"
                  placeholder="Mes groupes"
                />
              </form>
            </div>
            <div className='search-bar'>
              <form>
                <label> </label>{' '}
                <input
                  type="text"
                  className="feild px-4 py-2 rounded-lg w-80"
                  placeholder="Rechercher"
                />
              </form>
            </div>
          </div>
          <div className="cosmetic-header" />
          <div className="left-menu">
            <Button text="Mes activités" />
            <Button text="Mes achievements" />
            <Button text="Mes Conversations" />
            <Button text="Mes ressources" />
            <Button text="Exporter mes data" />
            <Button text="A propos" />
          </div>
        </div>
        <Footer />
      </Background>
    </>
  )
}

export default Dashboard
