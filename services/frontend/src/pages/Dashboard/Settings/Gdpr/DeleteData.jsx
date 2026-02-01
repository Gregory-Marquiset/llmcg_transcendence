import { logoheader } from "../../../../assets";
import { Background, Footer, LogTitle, Button } from "../../../../components";

export default function DeleteData (){
 return (<>
    <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />
        <LogTitle text="Do you confirm to delete all your data ?"/>
        <br/>
        <p>It concerns your todo list, logtime, history. success badges progression</p>
        <br/><br/>
        <Button text="Yes"/> <Button text="No"/>
    </Background>
    <Footer/>
    </>
 )
}