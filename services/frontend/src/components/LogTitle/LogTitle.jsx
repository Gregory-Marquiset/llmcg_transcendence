import "./LogTitle.css"

export default function ({text}){
    return (
        <>
            <br/>
            <h1 className="log-title">
                {text}
            </h1>
        </>
    )
}