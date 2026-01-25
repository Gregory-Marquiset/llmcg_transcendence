import '../Dashboard.css'
import { profilepicture } from '../../../../assets'
import { top1, top2, top3 } from '../../../../badges/ranking'
import { useEffect, useState } from 'react'

const data = [
    {
        id : 1,
        name : 'Liam',
        xp_gained : 1,
        avatar_path : ''
    },
    {
        id : 2,
        name : 'Gregory',
        xp_gained : 35,
        avatar_path : ''
    },
    {
        id : 3,
        name : 'Lou',
        xp_gained : 111111,
        avatar_path : ''
    },
    {
        id : 4,
        name : 'Charles',
        xp_gained : 5,
        avatar_path : ''
    }
]

const badges = {
    1: top1,
    2: top2,
    3: top3
}

export default function Topxp () {
    const sortedData = data.sort((a, b) => b.xp_gained - a.xp_gained)
    const [i, setI] = useState(1);
    return <>
        <div className='topxp-summary'>
            <h3>     Top friends of the week :</h3>
            {sortedData.map((item, index) => {
                return  <div className="friend-ranked" key={item.id}>
                                <img 
                                    src={item.avatar_path || profilepicture}
                                    alt={item.name}
                                    className='avatar-xp'
                                />
                                <div className="text-xp-container">
                                    <div className='friend-name'>{item.name}</div>
                                    <div className='xp-ranked'><strong>+{item.xp_gained}xp</strong> during last week !</div>
                                </div>
                                {index < 3 && (
                                <div className='badge-container'>
                                    <img 
                                        src={badges[index + 1]} 
                                        alt={`Top ${index + 1}`}
                                        className='rank-badge'
                                    />
                                </div>
                                )}
                </div>
        })}
        </div>
    </>
}