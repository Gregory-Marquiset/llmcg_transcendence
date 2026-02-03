import { Background, Button, Footer, HeaderBar } from '../../../components/index.js'
import { CGUPolicy } from './CGUPolicy.js'
import { useNavigate } from 'react-router-dom'
import '../Policy.css'

export function CGU(){
    const navigate = useNavigate();
    return <>
    <div className='page-wrapper'>
        <Background>
        <HeaderBar/>
            <div className="content-wrapper-policy">
                <div class="header">Nos Conditions Générales d'Utilisation</div>
                <div className="content">
                    <div className="date"><strong>Date de mise a jour: 16/01/2026</strong></div>
                    {CGUPolicy.map((cat) => (
                        <>
                        <div className="category-title">{cat.title}</div>
                        <div className="text">{cat.content}</div>
                        {cat.list && cat.list.map((list) => (
                            <li>{list}</li>
                        ))}
                        </>
                    ))}
                </div>
            </div>
        <Footer/>
        </Background>
        </div>
    </>
}

export default CGU