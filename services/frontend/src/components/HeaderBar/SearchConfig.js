
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
        keywords: [ 'activity' , 'agenda', 'activite' ]
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
    const smallSearch = search.trim().toLowerCase();
    const results = searchablePages.filter(page => page.keywords.some(k => k.includes(smallSearch)));
    return (results.slice(0, 10));
}