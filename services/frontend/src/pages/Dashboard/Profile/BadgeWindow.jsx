import { useState, useEffect } from 'react'
import { badges, starBadge } from '../../../badges/badges'

function computeBadgeProgress(badge, statValue) {
    let currentLevel = 0;
    let progress = 0;
    if (statValue == 0)
        return {level : currentLevel, progress}
    for (let i = 1; i <= 3; i++){
        if (statValue >= badge.levels[i].threshold)
            currentLevel = badge.levels[i].level;
        else if (i){
            const prevThreshold = badges.levels[i - 1].threshold;
            const range = badges.levels[i].threshold - prevThreshold;
            const valueInRange = statValue - prevThreshold;
            progress = Math.max(0, Math.min(100, (valueInRange / range) * 100));
            break ;
        }
    }
    if (currentLevel === 3)
        progress = 100;
    return {level : currentLevel, progress};
}

export default function BadgeWindow({isLoading}){
    const [starBadgeOwner, setStarBadge] = useState(true);
    const [stats, setStats] = useState(null);
    const accessToken = localStorage.getItem("access_token");

    useEffect(() => {
      const fetchProfile = async () => {
        try {
            isLoading(true);
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
          isLoading(false);
        } catch (err) {
          console.error("Fetch error:", err);
        }
      }
        if (accessToken)
          fetchProfile();
      }, [accessToken]);

    const computedBadges = badges.map((badge) => {
        const statValue = stats?.[badge.key] ?? 0;
        const {level, progress} = computeBadgeProgress(badge.name, statValue);
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
                                    width: type.progress,
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