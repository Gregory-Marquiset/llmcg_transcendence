import "./LogTitle.css"

export default function ({text}){
    return (
        <>
            <br/>
            <h1 className="log-title">
                {text}
            </h1>
            <br/><br/><br/><br/><br/>
        </>
    )
}