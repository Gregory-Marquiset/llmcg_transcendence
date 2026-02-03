import { HeaderBar, Background, Footer, Loading } from "../../components";
import { useNavigate } from 'react-router-dom'
import { useState } from "react";

export function Policy(){
    const navigate = useNavigate();
    const [ isLoading, setIsLoading ] = useState(false);
    const handleOnClick = (text) => {
        setIsLoading(true);
        setTimeout(() =>{
            navigate(text);
            setIsLoading(false);
        }, 500);
    }
    if (isLoading) return <Loading duration={500} showButton={false}/>
    return (
        <div className="page-wrapper">
            <HeaderBar/>
            <Background>
                <div className="policy-wrapper">
                    <h1>Documents Légaux</h1>
                    <br/>
                    <p>Consultez nos conditions d'utilisation et notre politique de confidentialité</p>
                    <br/>
                    <button  onClick={() => handleOnClick('/policy/terms')}
                    >Conditions Générales d'Utilisation</button>
                    <button onClick={() => handleOnClick('/policy/privacy')}
                    >Politique de Confidentialité</button>
                </div>
            </Background>
            <Footer/>
        </div>
    );
}

export default Policy;