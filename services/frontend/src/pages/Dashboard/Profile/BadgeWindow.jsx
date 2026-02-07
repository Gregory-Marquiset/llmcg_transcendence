import { useState, useEffect } from 'react'
import { badges } from '../../../badges/badges'

function computeBadgeProgress(badge, statValue) {
  const levels = badge.levels;

  let currentLevel = 0;
  for (let i = 0; i < levels.length; i++) {
    if (statValue >= levels[i].threshold) {
      currentLevel = i;
    } else {
      break; 
    }
  }

  if (currentLevel === levels.length - 1) {
    return { level: currentLevel, progress: 100 };
  }
  const currentThreshold = levels[currentLevel].threshold;
  const nextThreshold = levels[currentLevel + 1].threshold;

  const progress =
    ((statValue - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  
  return {
    level: currentLevel,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

export default function BadgeWindow({isLoading}){
    const [stats, setStats] = useState(null);
    const [hoveredBadge, setHoveredBadge] = useState(null);
    const accessToken = localStorage.getItem("access_token");
    
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const responseMe = await fetch('/api/v1/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          if (!responseMe.ok) {
            localStorage.clear();
            console.error("Error while fetching info");
            return;
          }
          const fetchedUserData = await responseMe.json();
          //console.log(fetchedUserData);
          setStats(fetchedUserData.stats);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      }
      if (accessToken)
          fetchProfile();
    }, [accessToken]);

    if (!stats) {
        return <div className='badge-wrapper'>Loading badges...</div>;
    }

    const computedBadges = badges.map((badge) => {
        const statValue = stats[badge.key] ?? 0;
        const {level, progress} = computeBadgeProgress(badge, statValue);
        return {
            ...badge,
            level,
            progress
        };
    });

    return (
        <div className='badge-wrapper'>
            {computedBadges.map((type) => {
                return (
                    <div 
                        key={type.name} 
                        className='badge-container'
                        onMouseEnter={() => setHoveredBadge(type.name)}
                        onMouseLeave={() => setHoveredBadge(null)}
                    >
                        <img 
                            className='badge'
                            src={type.levels[type.level].path}
                            alt={`${type.name} - ${type.levels[type.level].description}`}
                        />
                        <div 
                            className="badge-progress-container"
                            style={{ borderColor: '#eab2bb'}}>
                            <div 
                                className="badge-progress-fill"
                                style={{ 
                                    width: `${type.progress}%`,
                                    backgroundColor: type.color 
                                }}
                            />
                        </div>
                        <br/>
                        <div className="badge-name">{type.name}</div>
                        
                        {hoveredBadge === type.name && (
                            <div className="badge-tooltip">
                                {type.levels[type.level].description}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
