import { tropheeSilver, tropheeGold, tropheeRegular } from './trophee/index'
import { spaceshipSilver, spaceshipGold, spaceshipRegular } from './spaceship/index'
import { croissanceSilver, croissanceGold, croissanceRegular } from './croissance/index'
import { ideaSilver, ideaGold, ideaRegular } from './idea/index'
import { likeSilver, likeGold, likeRegular } from './like/index'
import { medalSilver, medalGold, medalRegular } from './medal/index'
import { screenSilver, screenGold, screenRegular } from './screen/index'
import star  from './star/star.png'
export const badges = [ {
        name : 'Trophee',
        category : 'Ranking',
        color : '#e3574c',
        key : "rank_position",
        levels : [{
                    level : 1,
                    description: 'Under top 10',
                    threshold : 10,
                    path: tropheeSilver
                },
                {
                    level : 2,
                    description: 'Under top 3',
                    threshold : 3,
                    path: tropheeRegular
                },
                {
                    level : 3,
                    description: 'Top 1',
                    threshold : 1,
                    path: tropheeGold
                }
            ]
    }, {
        name : 'Croissance',
        category : 'Productivity',
        color : '#72b242',
        key : "task_completed",
        levels : [{
                    level : 1,
                    description: '10 tasks completed',
                    threshold : 10,
                    path: croissanceSilver
                },
                {
                    level : 2,
                    description: '100 tasks completed',
                    threshold : 100,
                    path: croissanceRegular
                },
                {
                    level : 3,
                    description: '500 tasks completed',
                    threshold : 500,
                    path: croissanceGold
                }] 
    }, {
        name : 'Like',
        category : 'Number of friendship',
        color: '#3ea5d0',
        key: "friends_count",
        levels : [{
                    level : 1,
                    description: '1 friend',
                    threshold : 1,
                    path: likeSilver
                },
                {
                    level : 2,
                    description: '10 friends',
                    threshold : 10,
                    path: likeRegular
                },
                {
                    level : 3,
                    description: '30 friends',
                    threshold : 30,
                    path: likeGold
                }]
    }, {
        name : 'Medal',
        category : 'Number of days connected in a row',
        color : '#f69725',
        key : "streaks_history",
        levels : [{
                level : 1,
                description: '1 week',
                threshold : 7,
                path: medalSilver
        },
        {
                level : 2,
                description: '1 month',
                threshold : 30,
                path: medalRegular
        },
        {
                level : 3,
                description: '3 months',
                threshold : 90,
                path: medalGold
        }]
    }, {
        name : 'Screen',
        category : 'LogTime recap in the month (reset every month)',
        color: '#6bc7bd',
        levels : [{
                level : 1,
                description: '1 hour',
                threshold : 1,
                path: screenSilver
        },
        {
                level : 2,
                description: '30 hours',
                threshold : 30,
                path: screenRegular
        },
        {
                level : 3,
                description: '100 hours',
                threshold : 100,
                path: screenGold
        }]
    }, {
        name : 'Spaceship',
        category : 'Seniority on the app',
        color : '#7b689b',
        key : "app_seniority",
        levels : [{
                level : 1,
                description: '1 day',
                threshold : 1,
                path: spaceshipSilver
        },
        {
                level : 2,
                description: '3 month',
                threshold : 90,
                path: spaceshipRegular
        },
        {
                level : 3,
                description: '1 year',
                threshold : 365,
                path: spaceshipGold
        }]      
    },
    {
        name : 'Idea',
        category : 'Number of upload',
        color : '#e6c437',
        key : "upload_count",
        levels : [{
                level : 1,
                description: '1 file uploaded',
                threshold : 1,
                path: ideaSilver
        },
        {
                level : 2,
                description: '10 file uploaded',
                threshold : 10,
                path: ideaRegular
        },
        {
                level : 3,
                description: '50 file uploaded',
                threshold : 50,
                path: ideaGold
        }]
    },
]
export const starBadge = {
    name: 'Star',
    category: 'Admin',
    color: '#FFD700',
    logins: ['gmarquis', 'mda-cunh', 'cdutel', 'lzaengel', 'lobriott'],
    path: star
}