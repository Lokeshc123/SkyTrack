import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTasks, FaPlus, FaFilter, FaEllipsisV, FaUser, FaClock,
  FaFlag, FaProjectDiagram, FaSearch, FaTimes, FaGripVertical,
  FaCheckCircle, FaSpinner, FaExclamationTriangle, FaRobot
} from 'react-icons/fa'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

/* Column status colors - these are intentionally fixed for visual clarity */
const columnColors = {
  todo: { bg: 'var(--surface-alt)', accent: '#64748b', label: 'To Do' },
  in_progress: { bg: 'var(--info-bg)', accent: '#3b82f6', label: 'In Progress' },
  review: { bg: 'rgba(139, 92, 246, 0.1)', accent: '#8b5cf6', label: 'In Review' },
  done: { bg: 'var(--success-bg)', accent: '#10b981', label: 'Done' },
}

/* ===== Layout ===== */
const PageContainer = styled.div`
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  padding: 24px 32px 16px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
`

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const IconBadge = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 240px;
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 13px;
    color: var(--text);
    outline: none;
    
    &::placeholder {
      color: var(--text-muted);
    }
  }
  
  svg {
    color: var(--text-muted);
    font-size: 14px;
  }
`

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.$active ? 'var(--primary-light)' : 'var(--card)'};
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: var(--surface-hover);
    border-color: var(--primary);
  }
`

const AddButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`

/* ===== Filters ===== */
const FiltersBar = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  flex-wrap: wrap;
`

const FilterChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.$active ? 'var(--primary)' : 'var(--card)'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.$active ? 'var(--primary)' : 'var(--border)'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: var(--primary);
  }
`

const ClearFilters = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  color: var(--danger);
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

/* ===== Board ===== */
const BoardContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 24px 32px;
  overflow-x: auto;
  background: var(--bg);
`

const Column = styled.div`
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  background: ${props => columnColors[props.$status]?.bg || colors.bg};
  border-radius: 16px;
  max-height: 100%;
`

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 2px solid ${props => columnColors[props.$status]?.accent || colors.border};
`

const ColumnTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const ColumnIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => columnColors[props.$status]?.accent || colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`

const ColumnName = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
`

const TaskCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: ${props => columnColors[props.$status]?.accent || 'var(--text-muted)'}20;
  color: ${props => columnColors[props.$status]?.accent || 'var(--text-muted)'};
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`

const ColumnBody = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
`

const DropZone = styled.div`
  min-height: ${props => props.$isEmpty ? '120px' : '8px'};
  border: 2px dashed ${props => props.$isDragOver ? 'var(--primary)' : 'transparent'};
  border-radius: 12px;
  background: ${props => props.$isDragOver ? 'var(--primary-light)' : 'transparent'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
`

/* ===== Task Card ===== */
const TaskCard = styled(motion.div)`
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  cursor: grab;
  transition: all 0.2s;
  box-shadow: 0 2px 4px var(--shadow);
  
  &:hover {
    border-color: var(--primary);
    box-shadow: 0 4px 12px var(--shadow-strong);
    transform: translateY(-2px);
  }
  
  &:active {
    cursor: grabbing;
  }
  
  ${props => props.$isDragging && `
    opacity: 0.5;
    transform: rotate(3deg);
  `}
`

const TaskHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const TaskTitle = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  &:hover {
    color: var(--primary);
  }
`

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
  
  ${props => {
    switch (props.$priority) {
      case 'critical':
        return `background: var(--danger-bg); color: var(--danger);`
      case 'high':
        return `background: var(--warning-bg); color: var(--warning);`
      case 'medium':
        return `background: var(--primary-light); color: var(--primary);`
      default:
        return `background: var(--surface-hover); color: var(--text-secondary);`
    }
  }}
`

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-muted);
  
  svg {
    font-size: 10px;
  }
`

const TaskFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border);
`

const AssigneeAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
`

const ConfidenceBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  background: ${props => {
    if (props.$score >= 80) return 'var(--success-bg)'
    if (props.$score >= 50) return 'var(--warning-bg)'
    return 'var(--danger-bg)'
  }};
  color: ${props => {
    if (props.$score >= 80) return 'var(--success)'
    if (props.$score >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }};
  
  svg {
    font-size: 10px;
  }
`

/* ===== Loading & Empty States ===== */
const LoadingState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  color: var(--text-secondary);
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const EmptyColumn = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: var(--text-muted);
  font-size: 13px;
`

/* ===== Component ===== */
const STATUSES = ['todo', 'in_progress', 'review', 'done']

const getColumnIcon = (status) => {
  switch (status) {
    case 'todo': return <FaTasks />
    case 'in_progress': return <FaSpinner />
    case 'review': return <FaExclamationTriangle />
    case 'done': return <FaCheckCircle />
    default: return <FaTasks />
  }
}

export default function KanbanBoard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  
  // Filters
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedAssignee, setSelectedAssignee] = useState(null)
  const [selectedPriority, setSelectedPriority] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/projects')
      ])
      
      setTasks(tasksRes.data || [])
      setProjects(projectsRes.data || [])
      
      // Extract unique assignees
      const assignees = []
      const assigneeIds = new Set()
      tasksRes.data?.forEach(task => {
        if (task.assignee && !assigneeIds.has(task.assignee._id)) {
          assigneeIds.add(task.assignee._id)
          assignees.push(task.assignee)
        }
      })
      setUsers(assignees)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!task.title?.toLowerCase().includes(query) && 
            !task.description?.toLowerCase().includes(query)) {
          return false
        }
      }
      
      // Project filter
      if (selectedProject) {
        const taskProjectId = task.project?._id || task.project
        if (taskProjectId !== selectedProject) return false
      }
      
      // Assignee filter
      if (selectedAssignee) {
        const taskAssigneeId = task.assignee?._id || task.assignee
        if (taskAssigneeId !== selectedAssignee) return false
      }
      
      // Priority filter
      if (selectedPriority && task.priority !== selectedPriority) {
        return false
      }
      
      return true
    })
  }, [tasks, searchQuery, selectedProject, selectedAssignee, selectedPriority])

  const getTasksByStatus = useCallback((status) => {
    return getFilteredTasks().filter(task => task.status === status)
  }, [getFilteredTasks])

  const hasActiveFilters = selectedProject || selectedAssignee || selectedPriority

  const clearAllFilters = () => {
    setSelectedProject(null)
    setSelectedAssignee(null)
    setSelectedPriority(null)
  }

  // Drag and Drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task._id)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }
    
    const taskId = draggedTask._id
    const oldStatus = draggedTask.status
    
    // Optimistic update
    setTasks(prev => prev.map(t => 
      t._id === taskId ? { ...t, status: newStatus } : t
    ))
    
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus })
    } catch (err) {
      console.error('Failed to update task status:', err)
      // Revert on error
      setTasks(prev => prev.map(t => 
        t._id === taskId ? { ...t, status: oldStatus } : t
      ))
    }
    
    setDraggedTask(null)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `${diffDays} days`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>
          <FaSpinner size={32} />
          <p>Loading board...</p>
        </LoadingState>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <TitleGroup>
            <IconBadge>
              <FaTasks />
            </IconBadge>
            <div>
              <Title>Kanban Board</Title>
              <Subtitle>{getFilteredTasks().length} tasks across {projects.length} projects</Subtitle>
            </div>
          </TitleGroup>
          
          <HeaderActions>
            <SearchBox>
              <FaSearch />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <FaTimes 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => setSearchQuery('')}
                />
              )}
            </SearchBox>
            
            <FilterButton 
              $active={showFilters || hasActiveFilters}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filters
              {hasActiveFilters && <span>•</span>}
            </FilterButton>
            
            <AddButton to="/tasks/new">
              <FaPlus />
              New Task
            </AddButton>
          </HeaderActions>
        </HeaderTop>
        
        <AnimatePresence>
          {showFilters && (
            <FiltersBar
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Project Filter */}
              <FilterChip
                $active={!selectedProject}
                onClick={() => setSelectedProject(null)}
              >
                <FaProjectDiagram /> All Projects
              </FilterChip>
              {projects.map(project => (
                <FilterChip
                  key={project._id}
                  $active={selectedProject === project._id}
                  onClick={() => setSelectedProject(
                    selectedProject === project._id ? null : project._id
                  )}
                >
                  {project.name}
                </FilterChip>
              ))}
              
              <span style={{ color: colors.border }}>|</span>
              
              {/* Priority Filter */}
              {['critical', 'high', 'medium', 'low'].map(priority => (
                <FilterChip
                  key={priority}
                  $active={selectedPriority === priority}
                  onClick={() => setSelectedPriority(
                    selectedPriority === priority ? null : priority
                  )}
                >
                  <FaFlag /> {priority}
                </FilterChip>
              ))}
              
              {hasActiveFilters && (
                <ClearFilters onClick={clearAllFilters}>
                  <FaTimes /> Clear all
                </ClearFilters>
              )}
            </FiltersBar>
          )}
        </AnimatePresence>
      </Header>
      
      <BoardContainer>
        {STATUSES.map(status => {
          const columnTasks = getTasksByStatus(status)
          const isEmpty = columnTasks.length === 0
          
          return (
            <Column key={status} $status={status}>
              <ColumnHeader $status={status}>
                <ColumnTitle>
                  <ColumnIcon $status={status}>
                    {getColumnIcon(status)}
                  </ColumnIcon>
                  <ColumnName>{columnColors[status]?.label}</ColumnName>
                </ColumnTitle>
                <TaskCount $status={status}>{columnTasks.length}</TaskCount>
              </ColumnHeader>
              
              <ColumnBody
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {isEmpty && dragOverColumn !== status && (
                  <EmptyColumn>No tasks</EmptyColumn>
                )}
                
                {dragOverColumn === status && isEmpty && (
                  <DropZone $isDragOver $isEmpty>
                    Drop here
                  </DropZone>
                )}
                
                {columnTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    $isDragging={draggedTask?._id === task._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <TaskHeader>
                      <TaskTitle to={`/tasks/${task._id}`}>
                        {task.title}
                      </TaskTitle>
                      <PriorityBadge $priority={task.priority}>
                        <FaFlag />
                        {task.priority || 'low'}
                      </PriorityBadge>
                    </TaskHeader>
                    
                    <TaskMeta>
                      {task.project?.name && (
                        <MetaItem>
                          <FaProjectDiagram />
                          {task.project.name}
                        </MetaItem>
                      )}
                      {task.dueDate && (
                        <MetaItem style={{ 
                          color: formatDate(task.dueDate) === 'Overdue' ? colors.danger : undefined 
                        }}>
                          <FaClock />
                          {formatDate(task.dueDate)}
                        </MetaItem>
                      )}
                    </TaskMeta>
                    
                    <TaskFooter>
                      {task.assignee ? (
                        <AssigneeAvatar title={task.assignee.name}>
                          {getInitials(task.assignee.name)}
                        </AssigneeAvatar>
                      ) : (
                        <AssigneeAvatar style={{ background: colors.textMuted }}>
                          <FaUser size={10} />
                        </AssigneeAvatar>
                      )}
                      
                      {task.aiConfidence !== undefined && (
                        <ConfidenceBadge $score={task.aiConfidence}>
                          <FaRobot />
                          {task.aiConfidence}%
                        </ConfidenceBadge>
                      )}
                    </TaskFooter>
                  </TaskCard>
                ))}
                
                {dragOverColumn === status && !isEmpty && (
                  <DropZone $isDragOver>
                    Drop here
                  </DropZone>
                )}
              </ColumnBody>
            </Column>
          )
        })}
      </BoardContainer>
    </PageContainer>
  )
}
