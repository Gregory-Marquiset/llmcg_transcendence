  import { useEffect, useState } from 'react';
  import { setting, profile, logoheader } from '../../assets'
  import './HeaderBar.css'
  import { useNavigate } from 'react-router-dom'
  import { searchPages } from './SearchConfig';
  import Loading from '../Loading/Loading';
  import SearchBar from './SearchBar';

  export default function HeaderBar() {
    const [showResult, setShowResult] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [user, setUser] = useState("");
    const navigate = useNavigate();
          const [results, setResults] = useState([]);

      const handleOnClick = (path) => {
      setResults([]);
      setShowResult(false);
      setSearchInput("");
      navigate(path);
    }
    const handleSubmit = (e) => {
      e.preventDefault();
      navigate(`/users/${user}/profile`)
    }

    return(
      <>
        <div className='header-wrapper'>
          <button className="logo-bar" onClick={() => handleOnClick("/dashboard") }>
            <img src={logoheader} />
          </button>
          <div className="header-bar">
          <div className="group-search-bar">
            <form onSubmit={handleSubmit}>
              <label> </label>{' '}
              <input
                type="text"
                className="feild px-4 py-2 rounded-lg"
                placeholder="Utilisateurs"
                onChange={(e) => setUser(e.target.value)}
              />
            </form>
          </div>
          <SearchBar searchInput={searchInput}
            setSearchInput={setSearchInput}
            results={results}
            setResults={setResults}
            showResult={showResult}
            setShowResult={setShowResult}
          />
          <button className="navbar-btn" onClick={() => handleOnClick("/dashboard/profile")}>
            <img src={profile} />
          </button>
          <button className="navbar-btn" onClick={() => handleOnClick("/dashboard/settings")}>
            <img src={setting} />
          </button>
        </div>
        </div>
      </>
    )
  }
