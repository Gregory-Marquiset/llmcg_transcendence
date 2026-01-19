import { useState } from 'react'
import { badges, starBadge } from '../../../badges/badges'

export default function BadgeWindow({name}){
    const [badgeLevel, setBadgeLevel] = useState(3);
    const [starBadgeOwner, setStarBadge] = useState(true);
        
    return (
        <div className='badge-wrapper'>
            {badges.map((type) => {
                const currentLevel = type.levels?.find(l => l.level === badgeLevel);
                return (
                    <div key={type.name} className='badge-container'>
                        {currentLevel && (
                            <img 
                                className='badge'
                                src={currentLevel.path} 
                                alt={`${type.name} - ${currentLevel.description}`}
                            />
                        )}
                        <div 
                            className="badge-progress-container"
                            style={{ borderColor: '#eab2bb'}}>
                            <div 
                                className="badge-progress-fill"
                                style={{ 
                                    width: '60%',
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