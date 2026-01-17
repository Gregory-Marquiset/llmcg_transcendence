import { useEffect, useState } from 'react';
import { setting, profile, logoheader } from '../../assets'
import './HeaderBar.css'
import { useNavigate } from 'react-router-dom'
import { searchPages } from './SearchConfig';
import Loading from '../Loading/Loading';
import SearchBar from './SearchBar';

export default function HeaderBar() {
  const navigate = useNavigate();

  return(
    <>
      <div className='header-wrapper'>
        <button className="logo-bar" onClick={() => handleOnClick("/dashboard") }>
          <img src={logoheader} />
        </button>
        <div className="header-bar">
        <div className="group-search-bar">
          <form>
            <label> </label>{' '}
            <input
              type="text"
              className="feild px-4 py-2 rounded-lg"
              placeholder="Mes groupes"
            />
          </form>
        </div>
        <SearchBar/>
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
