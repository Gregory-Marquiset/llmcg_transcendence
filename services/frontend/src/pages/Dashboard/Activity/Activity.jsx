import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react'
import { Agenda, ToDoListEditor, Historic, LastUploads} from './ActivityComponents'

function Activity() {
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