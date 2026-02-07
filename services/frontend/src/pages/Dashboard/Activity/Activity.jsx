import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading, SpinLogo} from '../../../components'
import { useState } from 'react'
import { Agenda, ToDoListEditor, Historic} from './ActivityComponents'
import Error404 from '../../ErrorPages/404';
import Error401 from '../../ErrorPages/401';
import { useAuth } from '../../../context/AuthContext'
function Activity() {
      const {errStatus, setErrStatus}= useAuth();
    const [isLoading, setIsLoading] = useState(false);
    if (errStatus === 404) return <Error404/>
    if (errStatus === 401) return <Error401/>
    if (isLoading) return <Loading duration={400}  showButton={false}/>
    return (
      <>
        <Background>
          <div className="page-wrapper">
            <HeaderBar/>
            <div className='core-container'>
              <LeftMenu setIsLoading={setIsLoading}/>
              <div className='content-container'>
                <div className='agenda-todo-container'>
                <Agenda setIsLoading={setIsLoading}/>
                <ToDoListEditor setIsLoading={setIsLoading}/>
                </div>
                <div className='historic-uploads-container'>
                  <Historic setIsLoading={setIsLoading}/>
                </div>
              </div>
            </div>
          </div>
          <Footer/>
        </Background>
      </>
    )
}

export default Activity