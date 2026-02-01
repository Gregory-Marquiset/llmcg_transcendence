import { logoheader } from "../../../../assets";
import { Background, Footer, LogTitle, Button } from "../../../../components";

export default function DeleteAccount (){
 return (<>
    <Background>
        <img src={logoheader} className="logoheader" alt="42 Tracker" />
        <LogTitle text="Do you confirm to delete your account ?"/>
        <br/><br/>
        <Button text="Yes"/> <Button text="No"/>
    </Background>
    <Footer/>
    </>
 )
}