import '../../../styles/App.css'
import { Footer, Background, HeaderBar, LeftMenu, Loading} from '../../../components'
import { useState } from 'react';
function About() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading)  return <Loading/>
  return (
    <>
      <Background>
        <div className="page-wrapper">
          <HeaderBar/>
          <div className='core-container'>
            <LeftMenu setIsLoading={setIsLoading}/>
            <div className='content-container'>
              <h1>A propos</h1>
              <div className='badges-mates'>
                <a href="https://profile-v3.intra.42.fr/users/lobriott"><img src="https://badge.mediaplus.ma/starryblue/lobriott?1337Badge=off&UM6P=off" alt="lobriott's 42 stats" /></a>
                <a href="https://profile-v3.intra.42.fr/users/gmarquis"><img src="https://badge.mediaplus.ma/starryblue/gmarquis?1337Badge=off&UM6P=off" alt="gmarquis's 42 stats" /></a>
                <a href="https://profile-v3.intra.42.fr/users/lzaengel"><img src="https://badge.mediaplus.ma/starryblue/lzaengel?1337Badge=off&UM6P=off" alt="lzaengel's 42 stats" /></a>
                <a href="https://profile-v3.intra.42.fr/users/mda-cunh"><img src="https://badge.mediaplus.ma/starryblue/mda-cunh?1337Badge=off&UM6P=off" alt="mda-cunh's 42 stats" /></a>
                <a href="https://profile-v3.intra.42.fr/users/cdutel"><img src="https://badge.mediaplus.ma/starryblue/cdutel?1337Badge=off&UM6P=off" alt="cdutel's 42 stats" /></a>
              </div>
            </div>
          </div>
        </div>
        <Footer/>
      </Background>
    </>
  )
}

export default About