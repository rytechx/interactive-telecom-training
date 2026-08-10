import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorPagination from '../components/instructor/InstructorPagination.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useInstructorStore from '../store/useInstructorStore.js'
import {
  formatDate,
  formatScore,
  formatStatus,
  getStatusClass,
} from '../utils/instructorFormatters.js'

export default function InstructorStudentsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [moduleKey, setModuleKey] = useState('all')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const students = useInstructorStore((state) => state.students)
  const pagination = useInstructorStore((state) => state.studentPagination)
  const isLoading = useInstructorStore((state) => state.studentsLoading)
  const error = useInstructorStore((state) => state.studentsError)
  const loadStudents = useInstructorStore((state) => state.loadStudents)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 320)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    void loadStudents({
      search: debouncedSearch,
      status,
      module: moduleKey,
      page,
      limit,
    })
  }, [debouncedSearch, limit, loadStudents, moduleKey, page, status])

  const retry = () => void loadStudents({
    search: debouncedSearch,
    status,
    module: moduleKey,
    page,
    limit,
  })

  return (
    <div className="application-page instructor-page">
      <PageHeader
        eyebrow="Student Records"
        title="Students"
        description="Search student accounts and review current training progress."
      />

      <section className="instructor-filter-bar" aria-label="Student filters">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name, number, or email"
          />
        </label>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}>
            <option value="all">All Students</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="needs_practice">Needs Practice</option>
          </select>
        </label>
        <label>
          <span>Completed Module</span>
          <select value={moduleKey} onChange={(event) => {
            setModuleKey(event.target.value)
            setPage(1)
          }}>
            <option value="all">All Modules</option>
            <option value="rj45">RJ45</option>
            <option value="fiber">Fiber</option>
            <option value="network">Network</option>
          </select>
        </label>
        <label>
          <span>Rows</span>
          <select value={limit} onChange={(event) => {
            setLimit(Number(event.target.value))
            setPage(1)
          }}>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </section>

      {isLoading && !students.length ? (
        <InstructorLoadingState label="Loading student records..." />
      ) : error ? (
        <InstructorStatePanel
          title="Unable to load student records"
          message={error}
          onAction={retry}
        />
      ) : students.length ? (
        <>
          <section className="instructor-table-card">
            <div className="instructor-table-scroll">
              <table className="instructor-table">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Student Number</th>
                    <th scope="col">Modules</th>
                    <th scope="col">Progress</th>
                    <th scope="col">Average Score</th>
                    <th scope="col">Latest Activity</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td><strong>{student.fullName}</strong><small>{student.email}</small></td>
                      <td>{student.studentNumber}</td>
                      <td>{student.modulesCompleted} / {student.totalModules}</td>
                      <td>{student.overallProgress}%</td>
                      <td>{formatScore(student.averageBestScore)}</td>
                      <td>{formatDate(student.latestActivity)}</td>
                      <td>
                        <span className={`instructor-status ${getStatusClass(student.status)}`}>
                          {formatStatus(student.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => navigate(`/instructor/students/${student.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <InstructorPagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : (
        <InstructorStatePanel
          title="No students found"
          message="No student records match the selected filters."
        />
      )}
    </div>
  )
}
