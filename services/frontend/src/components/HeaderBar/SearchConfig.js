
export const searchablePages = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        description: "Page d'accueil",
        path: '/dashboard',
        icon: '🏠',
        keywords: [ 'home', 'accueil', 'dashboard' ]
    },
    {
        id: 'profile',
        title: 'Profil',
        description: 'Voir et modifier mon profil',
        path: '/dashboard/profile',
        icon: '👤',
        keywords: [ 'moi', 'me', 'profile', 'profil', 'compte', 'account' ]
    },
    {
        id: 'settings',
        title: 'Réglages',
        description: 'Voir et modifier mes réglages',
        path: '/dashboard/settings',
        icon: '⚙️',
        keywords: [ 'settings', 'reglages']
    },
    {
        id: 'activity',
        title: 'Mes activités',
        description: 'Consulter mes activités',
        path: '/dashboard/activity',
        icon: '📊',
        keywords: [ 'activity' , 'agenda' ]
    },
    {
        id: 'achievement',
        title: 'Mes réussites',
        description: 'Consulter mes achievments',
        path: '/dashboard/achievement',
        icon: '🏆',
        keywords: [ 'goals' , 'achievement' , 'badges', 'reussites']
    },
    {
        id: 'conversations',
        title: 'Messageries',
        description: 'Ouvrir le fil des conversations',
        path: "/dashboard/conversations" ,
        icon: '💬',
        keywords: [ 'messages', 'message', 'conversations' ]
    },
    {
        id: 'ressources',
        title: 'Mes ressources',
        description: 'Consulter ma documentation',
        path: "/dashboard/ressources",
        icon: '📚',
        keywords: [ 'docs', 'informations', 'documentations' ]
    },
    {
        id: 'export',
        title: 'Exporter mes données' ,
        description: 'Sauvegarder et consulter mes données personnelles',
        path: "/dashboard/exportdata",
        icon: '📤' ,
        keywords: [ 'export' , 'save', 'data' ]
    },
    {
        id: 'about',
        title: 'A propos',
        description: 'Découvrez qui se cache derriere cette masterclass',
        path: "/dashboard/about",
        icon: '📌',
        keywords: [ 'about' , 'us', 'propos']
    }
        // {
    //     id: ,
    //     title: ,
    //     description: ,
    //     path: ,
    //     icon: ,
    //     keywords: [ , ]
    // },
]

export function searchPages(search){
    if (!search)
        return (searchablePages.slice(0, 10));
    return (searchablePages.slice(0, 10));
}