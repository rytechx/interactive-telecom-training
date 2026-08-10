export default function InstructorPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <nav className="instructor-pagination" aria-label="Pagination">
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <div>
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  )
}
