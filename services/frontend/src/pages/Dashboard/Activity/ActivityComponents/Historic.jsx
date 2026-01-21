const data = [
    {
        id: 1,
        title: 'Experience',
        description : 'A gagné 10xp',
        date : '30/12/2025'
    },
    {
        id: 2,
        title: 'A upload a file',
        description : 'sujet minishell',
        date : '30/12/2025'
    },
    {
        id: 3,
        title: 'A un nouvel ami',
        description : 'lobriott',
        date : '30/12/2025'
    }
]

export default function Historic({setIsLoading}){
    return <>
        <div className="historic-container" key='0'>
            <h3>   Votre historique</h3>
            {data.map((item) => {
                return <div className="historic-tile" key={item.id}>
                        <h3>  <strong>{item.title}</strong> : {item.description}</h3>
                        <h4>{item.date}.  </h4>
                    </div>
            })}
        </div>
    </>
}