import { HeaderBar, Footer, Background, Button } from "../../../components"
import '../Policy.css'
import { PrivacyPolicy } from './PrivacyPolicy'
import { useNavigate } from 'react-router-dom'  
function Privacy(){
    const navigate = useNavigate();
    return <>
        <div className="page-wrapper">
            <Background> 
                <HeaderBar/>
                <div className="content-wrapper-policy">
                    <div class="header">Notre politique de confidentialité</div>
                    <div className="content">
                        <div className="date"><strong>Date de mise a jour: 16/01/2026</strong></div>
                        {PrivacyPolicy.map((cat) => (
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

export default Privacy