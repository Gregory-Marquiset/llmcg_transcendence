import { useState, useEffect } from 'react'
import { badges, starBadge } from '../../../badges/badges'

function computeBadgeProgress(badge, statValue) {
  const levels = badge.levels;

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (statValue >= levels[i].threshold) {
      currentLevel = i;
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
    const [starBadgeOwner, setStarBadge] = useState(true);
    const [stats, setStats] = useState(null);
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
            setIsLoggedIn(false);
            return;
          }
          const fetchedUserData = await responseMe.json();
          console.log(fetchedUserData);
          setStats(fetchedUserData.stats);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      }
        if (accessToken)
          fetchProfile();
      }, []);

    const computedBadges = badges.map((badge) => {
        const statValue = stats?.[badge.key] ?? 0;
        const {level, progress} = computeBadgeProgress(badge, statValue);
        return {
            ...badge,
            level,
            progress
        };
    });

    return (
        <div className='badge-wrapper'>
            {computedBadges.map((type, index) => {
                return (
                    <div key={type.name} className='badge-container'>
                            <img 
                                className='badge'
                                src={type.levels[type.level].path}
                                alt={`${type.name} - ${type.description}`}
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
                    </div>
                );
            })}
            {starBadgeOwner && (
                <div className='badge-container'>
                    <img 
                        className='badge'
                        src={starBadge.path}
                        alt="Star Badge - Admin"
                    />
                    <div className="badge-name">Admin ⭐</div>
                </div>
            )}
        </div>
    );
}