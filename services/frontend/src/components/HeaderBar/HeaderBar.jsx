  import { useEffect, useState } from 'react';
  import { setting, profile, logoheader } from '../../assets'
  import './HeaderBar.css'
  import { useNavigate } from 'react-router-dom'
  import SearchBar from './SearchBar';
  import Loading from '../Loading/Loading';
   import { useTranslation } from 'react-i18next'
  import { useAuth } from '../../context/AuthContext';

  export default function HeaderBar() {
    const [showResult, setShowResult] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [user, setUser] = useState("");
    const {
        logout, 
        accessToken,
      } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleLogOut = async () => {
    setLoading(true);
    
    try {
      const responseLogout = await fetch('/api/v1/auth/logout', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken || ''}`,
        },
        credentials: "include",
      });
      logout();
      setLoading(false);
      navigate('/');

    } catch (err) {
      logout();
      setLoading(false);
      navigate('/');
    }
  };
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
                placeholder={t("headerbar.search_user")}
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
          <button className="power-off-btn" onClick={handleLogOut} title="Déconnexion">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
          </button>
          </div>
        </div>
      </>
    )
  }
