import { tropheeSilver, tropheeGold, tropheeRegular } from './trophee/index'
import { spaceshipSilver, spaceshipGold, spaceshipRegular } from './spaceship/index'
import { croissanceSilver, croissanceGold, croissanceRegular } from './croissance/index'
import { ideaSilver, ideaGold, ideaRegular } from './idea/index'
import { likeSilver, likeGold, likeRegular } from './like/index'
import { medalSilver, medalGold, medalRegular } from './medal/index'
import { screenSilver, screenGold, screenRegular } from './screen/index'
export const badges = [ {
        name : 'Croissance',
        category : 'Productivity',
        color : '#72b242',
        key : "task_completed",
        levels : [
                {
                    level : 0,
                    description: '🌱 Start your journey',
                    threshold : 0,
                    path: croissanceSilver
                },
                {
                    level : 1,
                    description: '🌿 Early achiever - 10 tasks',
                    threshold : 10,
                    path: croissanceSilver
                },
                {
                    level : 2,
                    description: '🌳 Productivity master - 100 tasks',
                    threshold : 100,
                    path: croissanceRegular
                },
                {
                    level : 3,
                    description: '🏆 Elite performer - 500 tasks',
                    threshold : 500,
                    path: croissanceGold
                }] 
    }, {
        name : 'Like',
        category : 'Number of friendship',
        color: '#3ea5d0',
        key: "friends_count",
        levels : [{
                    level : 0,
                    description: '👋 Awaiting connections',
                    threshold : 0,
                    path: likeSilver
                },
                {
                    level : 1,
                    description: '🤝 First friend made',
                    threshold : 1,
                    path: likeSilver
                },
                {
                    level : 2,
                    description: '👥 Growing network - 10 friends',
                    threshold : 10,
                    path: likeRegular
                },
                {
                    level : 3,
                    description: '🌟 Social butterfly - 30 friends',
                    threshold : 30,
                    path: likeGold
                }]
    }, {
        name : 'Medal',
        category : 'Number of days connected in a row',
        color : '#f69725',
        key : "streaks_history",
        levels : [
        {
                    level : 0,
                    description: '📅 Begin your streak',
                    threshold : 0,
                    path: medalSilver
        },
        {
                level : 1,
                description: '🔥 Week warrior - 7 days',
                threshold : 7,
                path: medalSilver
        },
        {
                level : 2,
                description: '💪 Monthly champion - 30 days',
                threshold : 30,
                path: medalRegular
        },
        {
                level : 3,
                description: '👑 Unstoppable - 90 days',
                threshold : 90,
                path: medalGold
        }]
    }, {
        name : 'Screen',
        category : 'LogTime recap in the month (reset every month)',
        color: '#6bc7bd',
        key : "monthly_logtime",
        levels : [
        {
            level : 0,
            description: '⏱️ Just getting started',
            threshold : 0,
            path: screenSilver
        },
        {
            level : 1,
            description: '⌚ First hour logged',
            threshold : 60,
            path: screenSilver
        },
        {
            level : 2,
            description: '⏰ Dedicated user - 10 hours',
            threshold : 600, 
            path: screenRegular
        },
        {
            level : 3,
            description: '🎯 Power user - 50 hours',
            threshold : 3000,  
            path: screenGold
        }]
    }, {
        name : 'Spaceship',
        category : 'Seniority on the app',
        color : '#7b689b',
        key : "app_seniority",
        levels : [
        {
                level : 0,
                description: '🚀 Welcome aboard',
                threshold : 0,
                path: spaceshipSilver
        },
        {
                level : 1,
                description: '🌙 First day complete',
                threshold : 1,
                path: spaceshipSilver
        },
        {
                level : 2,
                description: '🪐 Veteran explorer - 3 months',
                threshold : 90,
                path: spaceshipRegular
        },
        {
                level : 3,
                description: '⭐ Legendary member - 1 year',
                threshold : 365,
                path: spaceshipGold
        }]      
    },
]