import { useEffect, useState } from 'react'
import InstructorAttemptDetail from '../components/instructor/InstructorAttemptDetail.jsx'
import InstructorLoadingState from '../components/instructor/InstructorLoadingState.jsx'
import InstructorPagination from '../components/instructor/InstructorPagination.jsx'
import InstructorStatePanel from '../components/instructor/InstructorStatePanel.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import useInstructorStore from '../store/useInstructorStore.js'
import {
  formatDate,
  formatDuration,
  formatScore,
} from '../utils/instructorFormatters.js'

export default function InstructorResultsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [moduleKey, setModuleKey] = useState('all')
  const [scoreBand, setScoreBand] = useState('all')
  const [performance, setPerformance] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selectedAttempt, setSelectedAttempt] = useState(null)
  const results = useInstructorStore((state) => state.results)
  const pagination = useInstructorStore((state) => state.resultPagination)
  const isLoading = useInstructorStore((state) => state.resultsLoading)
  const error = useInstructorStore((state) => state.resultsError)
  const attemptDetail = useInstructorStore((state) => state.attemptDetail)
  const attemptDetailLoading = useInstructorStore(
    (state) => state.attemptDetailLoading,
  )
  const attemptDetailError = useInstructorStore(
    (state) => state.attemptDetailError,
  )
  const loadResults = useInstructorStore((state) => state.loadResults)
  const loadAttemptDetail = useInstructorStore((state) => state.loadAttemptDetail)
  const clearAttemptDetail = useInstructorStore((state) => state.clearAttemptDetail)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 320)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    void loadResults({
      search: debouncedSearch,
      module: moduleKey,
      scoreBand,
      performance,
      fromDate,
      toDate,
      page,
      limit,
    })
  }, [debouncedSearch, fromDate, limit, loadResults, moduleKey, page, performance, scoreBand, toDate])

  const retry = () => void loadResults({
    search: debouncedSearch,
    module: moduleKey,
    scoreBand,
    performance,
    fromDate,
    toDate,
    page,
    limit,
  })

  const openAttempt = (attempt) => {
    setSelectedAttempt(attempt)
    void loadAttemptDetail(attempt.studentId, attempt.attemptId)
  }

  const closeAttempt = () => {
    setSelectedAttempt(null)
    clearAttemptDetail()
  }

  return (
    <div className="application-page instructor-page">
      <PageHeader
        eyebrow="Assessment History"
        title="Training Results"
        description="Review completed training attempts across all student accounts."
      />

      <section className="instructor-filter-bar instructor-results-filters" aria-label="Training result filters">
        <label>
          <span>Student</span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Name or student number"
          />
        </label>
        <label>
          <span>Module</span>
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
          <span>Score Range</span>
          <select value={scoreBand} onChange={(event) => {
            setScoreBand(event.target.value)
            setPage(1)
          }}>
            <option value="all">All Scores</option>
            <option value="below_70">Below 70</option>
            <option value="70_84">70-84</option>
            <option value="85_94">85-94</option>
            <option value="95_100">95-100</option>
          </select>
        </label>
        <label>
          <span>Performance</span>
          <select value={performance} onChange={(event) => {
            setPerformance(event.target.value)
            setPage(1)
          }}>
            <option value="all">All Ratings</option>
            <option value="outstanding">Outstanding</option>
            <option value="excellent">Excellent</option>
            <option value="very_good">Very Good</option>
            <option value="good">Good</option>
            <option value="needs_practice">Needs Practice</option>
            <option value="repeat_training">Repeat Training</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input type="date" value={fromDate} onChange={(event) => {
            setFromDate(event.target.value)
            setPage(1)
          }} />
        </label>
        <label>
          <span>To</span>
          <input type="date" value={toDate} onChange={(event) => {
            setToDate(event.target.value)
            setPage(1)
          }} />
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

      {isLoading && !results.length ? (
        <InstructorLoadingState label="Loading training results..." />
      ) : error ? (
        <InstructorStatePanel
          title="Unable to load training results"
          message={error}
          onAction={retry}
        />
      ) : results.length ? (
        <>
          <section className="instructor-table-card">
            <div className="instructor-table-scroll">
              <table className="instructor-table">
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Module</th>
                    <th scope="col">Attempt</th>
                    <th scope="col">Score</th>
                    <th scope="col">Performance</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Completed</th>
                    <th scope="col"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((attempt) => (
                    <tr key={attempt.attemptId}>
                      <td><strong>{attempt.studentName}</strong><small>{attempt.studentNumber}</small></td>
                      <td>{attempt.moduleName}</td>
                      <td>#{attempt.attemptNumber}</td>
                      <td>{formatScore(attempt.score)}</td>
                      <td>{attempt.performanceRating ?? 'Not available'}</td>
                      <td>{formatDuration(attempt.durationSeconds)}</td>
                      <td>{formatDate(attempt.completedAt, { includeTime: true })}</td>
                      <td><button type="button" onClick={() => openAttempt(attempt)}>View Details</button></td>
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
          title="No completed results found"
          message="No training attempts match the selected filters."
        />
      )}

      {selectedAttempt && (
        <InstructorAttemptDetail
          attempt={attemptDetail}
          isLoading={attemptDetailLoading}
          error={attemptDetailError}
          onClose={closeAttempt}
          onRetry={() => void loadAttemptDetail(
            selectedAttempt.studentId,
            selectedAttempt.attemptId,
          )}
        />
      )}
    </div>
  )
}
