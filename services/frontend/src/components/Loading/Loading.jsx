import './Loading.css'
import { Background, Button, HeaderBar, Footer} from '../../components'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import SpinCube from '../SpinCube/SpinCube';


export default function Loading({duration = 1000, showProgress = true, showButton = true, showHeader = true}) {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    if (showProgress){
        const interval = setInterval(() => {
          setPercentage((prev) =>{
          if (prev >= 100){
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, duration / 100);
    return () => clearInterval(interval);
  }
}, [duration]);

  return (
    <Background>
      {showHeader &&
        <HeaderBar/>}
        <div className="page-wrapper">
        <SpinCube/>
        {showProgress && 
        <progress className="progress-bar" value={percentage} max={100}></progress>}
        <br/>
        {showButton && 
        <Button text="Retour" onClick={() => navigate('/dashboard')}/>}
        </div>
        <Footer/>
    </Background>
    
  );
}
