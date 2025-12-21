import './Background.css'

export default function Background({ children }) {
  return (
    <>
      <div className="page-wrapper">
        <div className="background-regular">{children}</div>
      </div>
    </>
  )
}
