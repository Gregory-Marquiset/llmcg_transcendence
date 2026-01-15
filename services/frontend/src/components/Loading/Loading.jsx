import './Loading.css'
import { Background, Button } from '../../components'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';


export default function Loading() {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) =>{
      if (prev >= 100){
        clearInterval(interval);
        return 100;
      }
      return prev + 1;
    });
  }, 10);
  return () => clearInterval(interval);
}, []);

  return (
    <Background>
        <div className="spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        </div>
        <progress className="progress-bar" value={percentage} max={100}></progress>
        <Button text="Retour" onClick={() => navigate('/dashboard')}/>
    </Background>
  );
}
