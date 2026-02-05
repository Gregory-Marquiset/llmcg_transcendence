import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { searchPages } from './SearchConfig';

export function SearchBar ({ searchInput, setSearchInput, 
                            results, setResults, showResult, 
                            setShowResult }) {
      const navigate = useNavigate();
      const [selectedIndex, setSelectedIndex] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
    
      useEffect(() => {
        if (searchInput.trim() === ''){
          setResults([]);
          setShowResult(false);
          setIsLoading(false);
          return ;
        }
        try {
          const searchResult = searchPages(searchInput);
          setResults(searchResult || []);
          setShowResult(true);
          setSelectedIndex(0);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        }
      }, [searchInput]);
    
      const handleSelection = (page) => {
        if (page.path){
          setSearchInput('');
          setShowResult(false);
          navigate(page.path);
        }
      }
      const handleSubmit = (e) => {
        e.preventDefault();
        if (results.length > 0)
            handleSelection(results[selectedIndex]);
      }
    return <>
        <div className="search-bar">
          <form onSubmit={handleSubmit}>
            <label> </label>{' '}
            <input
              type="text"
              className="feild px-4 py-2 rounded-lg"
              placeholder="Rechercher"
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => searchInput && setShowResult(true)}
            />
            {showResult && results.length > 0 &&
            <div className='results'>
                {results.map((page, index)=> (
                  <div className='result-search' 
                  key={page.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelection(page)}
                  >
                    <span className='icon-notification'>{page.icon}</span>
                    <div className='notif-text'>
                    <div className='notif-title'><strong>{page.title}</strong></div>
                    <div>{page.description}</div>
                    </div>
                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider"/>
                  </div>
                
                ))}
            </div>
            }
          </form>
        </div>
    </>
}

export default SearchBar