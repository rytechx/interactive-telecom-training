export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="application-page-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}
