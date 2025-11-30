import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaRobot, FaUsers, FaChartPie, FaProjectDiagram, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaArrowRight, FaSync, FaBrain, FaHistory,
  FaLightbulb, FaTasks, FaCalendarAlt, FaChartLine, FaTrophy, FaFlag, FaDatabase
} from 'react-icons/fa'
import api from '../lib/api'
import { getCache, setCache, clearCache, getCacheInfo, generateDataHash, CACHE_KEYS } from '../lib/cache'
import { useAuth } from '../context/AuthContext'

/* ===== Design Tokens ===== */
const colors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHover: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  managerGradient: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)',
  aiGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
}

/* ===== Layout ===== */
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 32px 72px;
`

const Header = styled.div`
  margin-bottom: 32px;
`

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const AIBadge = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${colors.managerGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 10px 20px -5px rgba(14, 165, 233, 0.4);
`

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: ${colors.text};
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${colors.textSecondary};
`

const CacheIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${colors.surfaceHover};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 12px;
  color: ${colors.textSecondary};
  
  svg {
    font-size: 10px;
    color: ${colors.primary};
  }
`

const RefreshButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: white;
  color: ${colors.textSecondary};
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.surfaceHover};
    color: ${colors.text};
  }
  
  svg.spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

/* ===== Tabs ===== */
const TabBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: ${colors.surfaceHover};
  border-radius: 12px;
  margin-bottom: 24px;
`

const Tab = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? colors.text : colors.textSecondary};
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover:not([disabled]) {
    color: ${colors.text};
  }
`

/* ===== Cards ===== */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled(motion.div)`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`

const MetricCard = styled(Card)`
  text-align: center;
`

const MetricIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 20px;
  color: ${props => props.$color};
`

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${colors.text};
  margin-bottom: 4px;
`

const MetricLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
`

/* ===== Team Summary ===== */
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${colors.primary};
  }
`

/* ===== Team Member List ===== */
const TeamList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${colors.surfaceHover};
  border-radius: 12px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateX(4px);
    background: ${colors.borderLight};
  }
`

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
`

const MemberName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`

const MemberStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.$color || colors.textSecondary};
  
  svg { font-size: 10px; }
`

/* ===== Project Health ===== */
const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ProjectCard = styled.div`
  padding: 16px;
  background: ${colors.surfaceHover};
  border-radius: 12px;
  border-left: 4px solid ${props => props.$health === 'good' ? colors.success : props.$health === 'warning' ? colors.warning : colors.danger};
`

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const ProjectName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`

const HealthBadge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.$health === 'good' ? colors.successBg : props.$health === 'warning' ? colors.warningBg : colors.dangerBg};
  color: ${props => props.$health === 'good' ? colors.success : props.$health === 'warning' ? colors.warning : colors.danger};
`

const ProjectProgress = styled.div`
  height: 6px;
  background: ${colors.border};
  border-radius: 3px;
  overflow: hidden;
`

const ProjectProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$value}%;
  background: ${props => props.$health === 'good' ? colors.success : props.$health === 'warning' ? colors.warning : colors.danger};
  transition: width 0.5s ease;
`

const ProjectStats = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-size: 12px;
  color: ${colors.textSecondary};
`

/* ===== Sprint Retrospective ===== */
const RetroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const RetroCard = styled(Card)`
  border-top: 4px solid ${props => props.$type === 'wins' ? colors.success : props.$type === 'challenges' ? colors.warning : colors.primary};
`

const RetroTitle = styled.h4`
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`

const RetroList = styled.ul`
  margin: 0;
  padding-left: 16px;
  list-style: none;
`

const RetroItem = styled.li`
  position: relative;
  padding: 8px 0;
  font-size: 13px;
  color: ${colors.textSecondary};
  line-height: 1.5;
  
  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 14px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.$type === 'wins' ? colors.success : props.$type === 'challenges' ? colors.warning : colors.primary};
  }
`

/* ===== Risk Analysis ===== */
const RiskTable = styled.div`
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
`

const RiskHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 12px 16px;
  background: ${colors.surfaceHover};
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textSecondary};
  text-transform: uppercase;
`

const RiskRow = styled(Link)`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  padding: 14px 16px;
  border-top: 1px solid ${colors.border};
  text-decoration: none;
  transition: background 0.2s;
  
  &:hover {
    background: ${colors.surfaceHover};
  }
`

const RiskCell = styled.div`
  font-size: 13px;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`

const RiskLevel = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: ${props => {
    if (props.$level === 'high' || props.$level === 'critical') return colors.dangerBg
    if (props.$level === 'medium') return colors.warningBg
    return colors.successBg
  }};
  color: ${props => {
    if (props.$level === 'high' || props.$level === 'critical') return colors.danger
    if (props.$level === 'medium') return colors.warning
    return colors.success
  }};
`

/* ===== Loading & Empty States ===== */
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: ${colors.textSecondary};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textSecondary};
`

/* ===== Component ===== */
export default function ManagerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [teamSummary, setTeamSummary] = useState(null)
  const [retrospective, setRetrospective] = useState(null)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [fromCache, setFromCache] = useState(false)
  const [cacheInfo, setCacheInfo] = useState(null)

  const fetchData = async (forceRefresh = false) => {
    try {
      // Always fetch base data first to check for changes
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/api/projects'),
        api.get('/api/tasks')
      ])
      
      const allProjects = projectsRes.data || []
      const allTasks = tasksRes.data || []
      
      setProjects(allProjects)
      setTasks(allTasks)
      
      // Generate hash from source data to detect changes
      const dataHash = generateDataHash({
        projects: allProjects.map(p => ({ id: p._id, name: p.name, updatedAt: p.updatedAt })),
        tasks: allTasks.map(t => ({ id: t._id, status: t.status, aiConfidence: t.aiConfidence, updatedAt: t.updatedAt }))
      })
      
      // Check cache using data hash (unless force refresh)
      if (!forceRefresh) {
        const cachedSummary = getCache(CACHE_KEYS.MANAGER_SUMMARY, dataHash)
        const cachedRetro = getCache(CACHE_KEYS.MANAGER_RETRO, dataHash)
        
        if (cachedSummary) {
          console.log('Using cached manager data - data unchanged')
          setTeamSummary(cachedSummary)
          setRetrospective(cachedRetro)
          setFromCache(true)
          setCacheInfo(getCacheInfo(CACHE_KEYS.MANAGER_SUMMARY))
          setLoading(false)
          return
        }
      }
      
      // Data changed or force refresh - fetch fresh AI insights
      console.log('Fetching fresh manager insights - data changed')
      setFromCache(false)
      
      // Try to fetch AI summaries
      try {
        const teamRes = await api.get('/api/ai/insights/team')
        if (teamRes.data?.summary) {
          const summary = {
            teamStats: {
              totalMembers: Object.keys(teamRes.data.memberStats || {}).length,
              completedTasks: allTasks.filter(t => t.status === 'done').length,
              inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
              atRiskTasks: allTasks.filter(t => (t.aiConfidence || 100) < 50).length
            },
            memberSummaries: Object.values(teamRes.data.memberStats || {}),
            projectHealth: allProjects.map(p => {
              const projectTasks = allTasks.filter(t => t.project?._id === p._id || t.project === p._id)
              const completed = projectTasks.filter(t => t.status === 'done').length
              const total = projectTasks.length || 1
              return {
                name: p.name,
                progress: Math.round((completed / total) * 100),
                healthScore: Math.round((completed / total) * 100),
                completedTasks: completed,
                pendingTasks: total - completed
              }
            }),
            riskyTasks: allTasks.filter(t => (t.aiConfidence || 100) < 50),
            aiSummary: teamRes.data.summary
          }
          setTeamSummary(summary)
          setCache(CACHE_KEYS.MANAGER_SUMMARY, summary, dataHash)
        }
      } catch (e) {
        console.log('AI team summary not available:', e.message)
        // Create summary from raw data
        const memberMap = {}
        allTasks.forEach(t => {
          if (t.assignee) {
            const id = t.assignee._id || t.assignee
            const name = t.assignee.name || 'Unknown'
            if (!memberMap[id]) {
              memberMap[id] = { name, activeTasks: 0, completedTasks: 0, atRiskTasks: 0 }
            }
            if (t.status === 'done') memberMap[id].completedTasks++
            else memberMap[id].activeTasks++
            if ((t.aiConfidence || 100) < 50) memberMap[id].atRiskTasks++
          }
        })
        
        const fallbackSummary = {
          teamStats: {
            totalMembers: Object.keys(memberMap).length,
            completedTasks: allTasks.filter(t => t.status === 'done').length,
            inProgressTasks: allTasks.filter(t => t.status === 'in_progress').length,
            atRiskTasks: allTasks.filter(t => (t.aiConfidence || 100) < 50).length
          },
          memberSummaries: Object.values(memberMap),
          projectHealth: allProjects.map(p => {
            const projectTasks = allTasks.filter(t => t.project?._id === p._id || t.project === p._id)
            const completed = projectTasks.filter(t => t.status === 'done').length
            const total = projectTasks.length || 1
            return {
              name: p.name,
              progress: Math.round((completed / total) * 100),
              healthScore: Math.round((completed / total) * 100),
              completedTasks: completed,
              pendingTasks: total - completed
            }
          }),
          riskyTasks: allTasks.filter(t => (t.aiConfidence || 100) < 50)
        }
        setTeamSummary(fallbackSummary)
        setCache(CACHE_KEYS.MANAGER_SUMMARY, fallbackSummary, dataHash)
      }
      
      // Try to fetch retrospective
      if (allProjects.length > 0) {
        try {
          const retroRes = await api.get(`/api/ai/retrospective?projectId=${allProjects[0]._id}`)
          setRetrospective(retroRes.data)
          setCache(CACHE_KEYS.MANAGER_RETRO, retroRes.data, dataHash)
        } catch (e) {
          console.log('Retrospective not available:', e.message)
        }
      }
      
      setCacheInfo(getCacheInfo(CACHE_KEYS.MANAGER_SUMMARY))
    } catch (err) {
      console.error('Failed to fetch manager data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Clear cache and force refresh
    clearCache(CACHE_KEYS.MANAGER_SUMMARY)
    clearCache(CACHE_KEYS.MANAGER_RETRO)
    await fetchData(true)
    setRefreshing(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>
          <FaBrain size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>Loading manager insights...</p>
        </LoadingState>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <TitleGroup>
            <AIBadge>
              <FaUsers />
            </AIBadge>
            <div>
              <Title>Manager Dashboard</Title>
              <Subtitle>AI-powered team and project insights</Subtitle>
            </div>
            {fromCache && cacheInfo && (
              <CacheIndicator>
                <FaDatabase />
                Cached • Data unchanged {cacheInfo.ageMinutes > 0 ? `(${cacheInfo.ageMinutes}m ago)` : ''}
              </CacheIndicator>
            )}
          </TitleGroup>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </HeaderTop>
      </Header>

      <TabBar>
        <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <FaChartPie /> Team Overview
        </Tab>
        <Tab $active={activeTab === 'retro'} onClick={() => setActiveTab('retro')}>
          <FaHistory /> Sprint Retrospective
        </Tab>
        <Tab $active={activeTab === 'risks'} onClick={() => setActiveTab('risks')}>
          <FaExclamationTriangle /> Risk Analysis
        </Tab>
      </TabBar>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Overview Metrics */}
            <Grid>
              <MetricCard>
                <MetricIcon $bg={colors.primaryGradient} $color="white">
                  <FaUsers />
                </MetricIcon>
                <MetricValue>{teamSummary?.teamStats?.totalMembers || 0}</MetricValue>
                <MetricLabel>Team Members</MetricLabel>
              </MetricCard>

              <MetricCard>
                <MetricIcon $bg={colors.successBg} $color={colors.success}>
                  <FaCheckCircle />
                </MetricIcon>
                <MetricValue>{teamSummary?.teamStats?.completedTasks || 0}</MetricValue>
                <MetricLabel>Tasks Completed</MetricLabel>
              </MetricCard>

              <MetricCard>
                <MetricIcon $bg={colors.warningBg} $color={colors.warning}>
                  <FaClock />
                </MetricIcon>
                <MetricValue>{teamSummary?.teamStats?.inProgressTasks || 0}</MetricValue>
                <MetricLabel>In Progress</MetricLabel>
              </MetricCard>

              <MetricCard>
                <MetricIcon $bg={colors.dangerBg} $color={colors.danger}>
                  <FaExclamationTriangle />
                </MetricIcon>
                <MetricValue>{teamSummary?.teamStats?.atRiskTasks || 0}</MetricValue>
                <MetricLabel>At Risk</MetricLabel>
              </MetricCard>
            </Grid>

            <SummaryGrid>
              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <FaUsers /> Team Performance
                  </CardTitle>
                </CardHeader>
                
                {teamSummary?.memberSummaries?.length > 0 ? (
                  <TeamList>
                    {teamSummary.memberSummaries.map((member, i) => (
                      <MemberCard key={i}>
                        <MemberInfo>
                          <Avatar>{getInitials(member.name)}</Avatar>
                          <MemberName>{member.name}</MemberName>
                        </MemberInfo>
                        <MemberStats>
                          <StatBadge>
                            <FaTasks /> {member.activeTasks || 0} active
                          </StatBadge>
                          <StatBadge $color={colors.success}>
                            <FaCheckCircle /> {member.completedTasks || 0} done
                          </StatBadge>
                          {member.atRiskTasks > 0 && (
                            <StatBadge $color={colors.danger}>
                              <FaExclamationTriangle /> {member.atRiskTasks} at risk
                            </StatBadge>
                          )}
                        </MemberStats>
                      </MemberCard>
                    ))}
                  </TeamList>
                ) : (
                  <EmptyState>
                    <FaUsers size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p>No team data available</p>
                  </EmptyState>
                )}
              </Card>

              {/* Project Health */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <FaProjectDiagram /> Project Health
                  </CardTitle>
                </CardHeader>
                
                {teamSummary?.projectHealth?.length > 0 ? (
                  <ProjectList>
                    {teamSummary.projectHealth.map((project, i) => {
                      const health = project.healthScore > 70 ? 'good' : project.healthScore > 40 ? 'warning' : 'critical'
                      return (
                        <ProjectCard key={i} $health={health}>
                          <ProjectHeader>
                            <ProjectName>{project.name}</ProjectName>
                            <HealthBadge $health={health}>
                              {health === 'good' ? 'Healthy' : health === 'warning' ? 'At Risk' : 'Critical'}
                            </HealthBadge>
                          </ProjectHeader>
                          <ProjectProgress>
                            <ProjectProgressFill $value={project.progress || 0} $health={health} />
                          </ProjectProgress>
                          <ProjectStats>
                            <span>{project.completedTasks || 0} completed</span>
                            <span>{project.pendingTasks || 0} pending</span>
                          </ProjectStats>
                        </ProjectCard>
                      )
                    })}
                  </ProjectList>
                ) : (
                  <EmptyState>
                    <FaProjectDiagram size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p>No project data available</p>
                  </EmptyState>
                )}
              </Card>
            </SummaryGrid>
          </motion.div>
        )}

        {activeTab === 'retro' && (
          <motion.div
            key="retro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {retrospective ? (
              <RetroGrid>
                <RetroCard $type="wins">
                  <RetroTitle>
                    <FaTrophy style={{ color: colors.success }} /> Wins
                  </RetroTitle>
                  <RetroList>
                    {(retrospective.wins || ['Great progress on deliverables', 'Team collaboration improved']).map((item, i) => (
                      <RetroItem key={i} $type="wins">{item}</RetroItem>
                    ))}
                  </RetroList>
                </RetroCard>

                <RetroCard $type="challenges">
                  <RetroTitle>
                    <FaFlag style={{ color: colors.warning }} /> Challenges
                  </RetroTitle>
                  <RetroList>
                    {(retrospective.challenges || ['Some tasks took longer than expected', 'Communication gaps identified']).map((item, i) => (
                      <RetroItem key={i} $type="challenges">{item}</RetroItem>
                    ))}
                  </RetroList>
                </RetroCard>

                <RetroCard $type="improvements">
                  <RetroTitle>
                    <FaLightbulb style={{ color: colors.primary }} /> Improvements
                  </RetroTitle>
                  <RetroList>
                    {(retrospective.improvements || ['Implement daily standups', 'Use better estimation techniques']).map((item, i) => (
                      <RetroItem key={i} $type="improvements">{item}</RetroItem>
                    ))}
                  </RetroList>
                </RetroCard>
              </RetroGrid>
            ) : (
              <EmptyState>
                <FaHistory size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                <p>Retrospective data not available. Complete a sprint to generate insights.</p>
              </EmptyState>
            )}
          </motion.div>
        )}

        {activeTab === 'risks' && (
          <motion.div
            key="risks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <FaExclamationTriangle style={{ color: colors.danger }} /> Risk Analysis
                </CardTitle>
              </CardHeader>
              
              {teamSummary?.riskyTasks?.length > 0 ? (
                <RiskTable>
                  <RiskHeader>
                    <div>Task</div>
                    <div>Assignee</div>
                    <div>Risk Level</div>
                    <div>Confidence</div>
                  </RiskHeader>
                  {teamSummary.riskyTasks.map((task, i) => (
                    <RiskRow key={i} to={`/tasks/${task._id}`}>
                      <RiskCell>
                        <FaTasks /> {task.title}
                      </RiskCell>
                      <RiskCell>{task.assignee?.name || 'Unassigned'}</RiskCell>
                      <RiskCell>
                        <RiskLevel $level={task.riskLevel?.toLowerCase() || 'medium'}>
                          {task.riskLevel || 'Medium'}
                        </RiskLevel>
                      </RiskCell>
                      <RiskCell>{task.aiConfidence || 50}%</RiskCell>
                    </RiskRow>
                  ))}
                </RiskTable>
              ) : (
                <EmptyState>
                  <FaCheckCircle size={48} style={{ marginBottom: 16, color: colors.success }} />
                  <p>No high-risk tasks identified. Your team is on track!</p>
                </EmptyState>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
