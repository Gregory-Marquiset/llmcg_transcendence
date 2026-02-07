  import { useEffect, useState } from 'react';
  import { setting, profile, logoheader } from '../../assets'
  import './HeaderBar.css'
  import { useNavigate } from 'react-router-dom'
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
          <div className="logo-bar">
            <img src={logoheader} />
          </div>
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
        </div>
        </div>
      </>
    )
  }
