import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaRobot, FaLightbulb, FaChartLine, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaArrowRight, FaSync, FaBrain,
  FaFireAlt, FaTasks, FaCalendarAlt, FaDatabase
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
  background: ${colors.aiGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.4);
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

/* ===== Status Banner ===== */
const StatusBanner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${props => props.$enabled ? colors.successBg : colors.warningBg};
  border: 1px solid ${props => props.$enabled ? '#a7f3d0' : '#fde68a'};
  border-radius: 12px;
  margin-bottom: 24px;
`

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$enabled ? colors.success : colors.warning};
`

const StatusText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$enabled ? '#065f46' : '#92400e'};
`

/* ===== Cards ===== */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
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
  margin: 0 auto 16px;
  font-size: 20px;
  color: ${props => props.$color};
`

const MetricValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${colors.text};
  margin-bottom: 4px;
`

const MetricLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
`

const MetricTrend = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$positive ? colors.success : colors.danger};
`

/* ===== Daily Insights ===== */
const InsightsCard = styled(Card)`
  grid-column: span 2;
  
  @media (max-width: 768px) {
    grid-column: span 1;
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

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const InsightItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: ${colors.surfaceHover};
  border-radius: 12px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateX(4px);
  }
`

const InsightIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  flex-shrink: 0;
`

const InsightContent = styled.div`
  flex: 1;
`

const InsightTitle = styled.h4`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`

const InsightDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.textSecondary};
  line-height: 1.5;
`

const InsightMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`

const MetaTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${colors.textMuted};
`

/* ===== At Risk Tasks ===== */
const RiskCard = styled(Card)`
  border-left: 4px solid ${colors.danger};
`

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const TaskItem = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${colors.surfaceHover};
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.border};
    transform: translateX(4px);
  }
`

const TaskInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TaskPriority = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.$priority === 'urgent') return colors.danger
    if (props.$priority === 'high') return colors.warning
    return colors.primary
  }};
`

const TaskTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
`

const TaskConfidence = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.danger};
`

/* ===== Recommendations Section ===== */
const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const RecommendationCard = styled(motion.div)`
  padding: 20px;
  background: white;
  border: 1px solid ${colors.border};
  border-radius: 14px;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.15);
  }
`

const RecHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`

const RecIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
`

const RecTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`

const RecPriority = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  margin-top: 4px;
  background: ${props => {
    if (props.$priority === 'critical') return colors.danger
    if (props.$priority === 'high') return colors.warning
    return colors.success
  }};
  color: white;
`

const RecDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.textSecondary};
  line-height: 1.5;
`

const RecAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.primary};
  text-decoration: none;
  
  &:hover {
    gap: 10px;
  }
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
export default function AIDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [aiStatus, setAiStatus] = useState(null)
  const [insights, setInsights] = useState(null)
  const [atRiskTasks, setAtRiskTasks] = useState([])
  const [fromCache, setFromCache] = useState(false)
  const [cacheInfo, setCacheInfo] = useState(null)

  const fetchData = async (forceRefresh = false) => {
    try {
      // Always fetch the source data first to check if it changed
      const [statusRes, tasksRes] = await Promise.all([
        api.get('/api/ai/status'),
        api.get('/api/tasks/my-tasks')
      ])
      
      const tasks = tasksRes.data || []
      const riskyTasks = tasks.filter(t => (t.aiConfidence || 100) < 60).slice(0, 5)
      
      // Generate hash from the source data to detect changes
      const dataHash = generateDataHash({
        status: statusRes.data,
        tasks: tasks.map(t => ({ id: t._id, status: t.status, aiConfidence: t.aiConfidence, updatedAt: t.updatedAt }))
      })
      
      // Check cache using the data hash (unless force refresh)
      if (!forceRefresh) {
        const cachedInsights = getCache(CACHE_KEYS.AI_INSIGHTS, dataHash)
        
        if (cachedInsights) {
          console.log('Using cached AI insights - data unchanged')
          setAiStatus(statusRes.data)
          setInsights(cachedInsights)
          setAtRiskTasks(riskyTasks)
          setFromCache(true)
          setCacheInfo(getCacheInfo(CACHE_KEYS.AI_INSIGHTS))
          setLoading(false)
          return
        }
      }
      
      // Data changed or force refresh - fetch fresh AI insights
      console.log('Fetching fresh AI insights - data changed')
      setFromCache(false)
      setAiStatus(statusRes.data)
      setAtRiskTasks(riskyTasks)
      
      // Fetch insights only if AI is enabled
      if (statusRes.data?.enabled) {
        try {
          const insightsRes = await api.get('/api/ai/insights/daily')
          const insightData = insightsRes.data?.insights || insightsRes.data
          const processedInsights = {
            insights: Array.isArray(insightData?.suggestions) 
              ? insightData.suggestions.map((s, i) => ({ 
                  type: i === 0 ? 'productivity' : i === 1 ? 'risk' : 'progress',
                  title: 'AI Suggestion',
                  message: s 
                }))
              : [],
            summary: {
              totalTasks: tasks.length,
              completedThisWeek: tasks.filter(t => t.status === 'done').length,
              urgentTasks: riskyTasks.length
            },
            recommendations: insightData?.suggestions?.map((s, i) => ({
              priority: i === 0 ? 'high' : 'medium',
              title: 'Recommendation',
              message: s
            })) || [],
            topPriority: insightData?.topPriority,
            riskAlert: insightData?.riskAlert,
            motivationalNote: insightData?.motivationalNote
          }
          setInsights(processedInsights)
          // Cache with the data hash - will be valid until data changes
          setCache(CACHE_KEYS.AI_INSIGHTS, processedInsights, dataHash)
        } catch (e) {
          console.log('Insights not available:', e.message)
          const fallbackInsights = {
            summary: {
              totalTasks: tasks.length,
              completedThisWeek: tasks.filter(t => t.status === 'done').length,
              urgentTasks: riskyTasks.length
            },
            insights: [],
            recommendations: []
          }
          setInsights(fallbackInsights)
          setCache(CACHE_KEYS.AI_INSIGHTS, fallbackInsights, dataHash)
        }
      } else {
        const basicInsights = {
          summary: {
            totalTasks: tasks.length,
            completedThisWeek: tasks.filter(t => t.status === 'done').length,
            urgentTasks: riskyTasks.length
          },
          insights: [],
          recommendations: []
        }
        setInsights(basicInsights)
        setCache(CACHE_KEYS.AI_INSIGHTS, basicInsights, dataHash)
      }
      
      setCacheInfo(getCacheInfo(CACHE_KEYS.AI_INSIGHTS))
    } catch (err) {
      console.error('Failed to fetch AI data', err)
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
    clearCache(CACHE_KEYS.AI_INSIGHTS)
    await fetchData(true)
    setRefreshing(false)
  }

  const getIconForInsight = (type) => {
    switch (type) {
      case 'productivity': return { icon: <FaChartLine />, bg: colors.primaryGradient, color: 'white' }
      case 'risk': return { icon: <FaExclamationTriangle />, bg: colors.dangerBg, color: colors.danger }
      case 'progress': return { icon: <FaCheckCircle />, bg: colors.successBg, color: colors.success }
      case 'deadline': return { icon: <FaClock />, bg: colors.warningBg, color: colors.warning }
      default: return { icon: <FaLightbulb />, bg: colors.surfaceHover, color: colors.primary }
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>
          <FaBrain size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>Loading AI insights...</p>
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
              <FaRobot />
            </AIBadge>
            <div>
              <Title>AI Dashboard</Title>
              <Subtitle>Your personalized productivity insights</Subtitle>
            </div>
          </TitleGroup>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            <FaSync className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </HeaderTop>
      </Header>

      <StatusBanner 
        $enabled={aiStatus?.enabled}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <StatusDot $enabled={aiStatus?.enabled} />
        <StatusText $enabled={aiStatus?.enabled}>
          {aiStatus?.enabled 
            ? `AI is active • Using ${aiStatus?.model || 'Gemini'}`
            : 'AI features are currently disabled'}
        </StatusText>
        {fromCache && cacheInfo && (
          <span style={{ 
            marginLeft: 'auto', 
            fontSize: 12, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            color: aiStatus?.enabled ? '#065f46' : '#92400e',
            opacity: 0.8
          }}>
            <FaDatabase size={10} />
            Cached • Data unchanged {cacheInfo.ageMinutes > 0 ? `(${cacheInfo.ageMinutes}m ago)` : ''}
          </span>
        )}
      </StatusBanner>

      {/* Metrics Overview */}
      <Grid>
        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricIcon $bg={colors.primaryGradient} $color="white">
            <FaTasks />
          </MetricIcon>
          <MetricValue>{insights?.summary?.totalTasks || 0}</MetricValue>
          <MetricLabel>Active Tasks</MetricLabel>
        </MetricCard>

        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <MetricIcon $bg={colors.successBg} $color={colors.success}>
            <FaCheckCircle />
          </MetricIcon>
          <MetricValue>{insights?.summary?.completedThisWeek || 0}</MetricValue>
          <MetricLabel>Completed This Week</MetricLabel>
          {insights?.summary?.completedThisWeek > 0 && (
            <MetricTrend $positive>
              <FaChartLine /> Great progress!
            </MetricTrend>
          )}
        </MetricCard>

        <MetricCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <MetricIcon $bg={colors.warningBg} $color={colors.warning}>
            <FaFireAlt />
          </MetricIcon>
          <MetricValue>{insights?.summary?.urgentTasks || atRiskTasks.length}</MetricValue>
          <MetricLabel>Needs Attention</MetricLabel>
        </MetricCard>
      </Grid>

      {/* Main Content Grid */}
      <Grid>
        {/* Daily Insights */}
        <InsightsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <CardHeader>
            <CardTitle>
              <FaBrain /> Daily Insights
            </CardTitle>
          </CardHeader>
          
          {/* Top Priority & Risk Alert */}
          {(insights?.topPriority || insights?.riskAlert) && (
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {insights?.topPriority && (
                <div style={{
                  background: colors.primaryGradient,
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <FaLightbulb /> <strong>Top Priority:</strong> {insights.topPriority}
                </div>
              )}
              {insights?.riskAlert && (
                <div style={{
                  background: colors.dangerBg,
                  color: colors.danger,
                  padding: '12px 16px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: `1px solid ${colors.danger}20`
                }}>
                  <FaExclamationTriangle /> <strong>Risk:</strong> {insights.riskAlert}
                </div>
              )}
            </div>
          )}
          
          {/* Motivational Note */}
          {insights?.motivationalNote && (
            <div style={{
              background: colors.successBg,
              color: '#065f46',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid #a7f3d0'
            }}>
              <FaCheckCircle /> {insights.motivationalNote}
            </div>
          )}
          
          {insights?.insights?.length > 0 ? (
            <InsightsList>
              {insights.insights.slice(0, 4).map((insight, i) => {
                const iconProps = getIconForInsight(insight.type)
                return (
                  <InsightItem key={i}>
                    <InsightIcon $bg={iconProps.bg} $color={iconProps.color}>
                      {iconProps.icon}
                    </InsightIcon>
                    <InsightContent>
                      <InsightTitle>{insight.title || 'Insight'}</InsightTitle>
                      <InsightDescription>{insight.message}</InsightDescription>
                      <InsightMeta>
                        {insight.taskName && (
                          <MetaTag>
                            <FaTasks /> {insight.taskName}
                          </MetaTag>
                        )}
                        {insight.dueIn && (
                          <MetaTag>
                            <FaCalendarAlt /> Due in {insight.dueIn}
                          </MetaTag>
                        )}
                      </InsightMeta>
                    </InsightContent>
                  </InsightItem>
                )
              })}
            </InsightsList>
          ) : (
            <EmptyState>
              <FaLightbulb size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>No insights available yet. Start working on tasks to get personalized recommendations!</p>
            </EmptyState>
          )}
        </InsightsCard>

        {/* At Risk Tasks */}
        <RiskCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CardHeader>
            <CardTitle>
              <FaExclamationTriangle style={{ color: colors.danger }} /> At Risk
            </CardTitle>
          </CardHeader>
          
          {atRiskTasks.length > 0 ? (
            <TaskList>
              {atRiskTasks.map(task => (
                <TaskItem key={task._id} to={`/tasks/${task._id}`}>
                  <TaskInfo>
                    <TaskPriority $priority={task.priority} />
                    <TaskTitle>{task.title}</TaskTitle>
                  </TaskInfo>
                  <TaskConfidence>{task.aiConfidence || 50}%</TaskConfidence>
                </TaskItem>
              ))}
            </TaskList>
          ) : (
            <EmptyState>
              <FaCheckCircle size={24} style={{ marginBottom: 8, color: colors.success }} />
              <p>All tasks are on track!</p>
            </EmptyState>
          )}
        </RiskCard>
      </Grid>

      {/* AI Recommendations */}
      {insights?.recommendations?.length > 0 && (
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginTop: 24 }}
        >
          <CardHeader>
            <CardTitle>
              <FaLightbulb /> AI Recommendations
            </CardTitle>
          </CardHeader>
          
          <RecommendationsGrid>
            {insights.recommendations.slice(0, 4).map((rec, i) => (
              <RecommendationCard
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <RecHeader>
                  <RecIcon 
                    $bg={rec.priority === 'critical' ? colors.dangerBg : rec.priority === 'high' ? colors.warningBg : colors.successBg}
                    $color={rec.priority === 'critical' ? colors.danger : rec.priority === 'high' ? colors.warning : colors.success}
                  >
                    <FaLightbulb />
                  </RecIcon>
                  <div>
                    <RecTitle>{rec.title || 'Recommendation'}</RecTitle>
                    <RecPriority $priority={rec.priority}>{rec.priority}</RecPriority>
                  </div>
                </RecHeader>
                <RecDescription>{rec.message}</RecDescription>
                {rec.taskId && (
                  <RecAction to={`/tasks/${rec.taskId}`}>
                    View Task <FaArrowRight />
                  </RecAction>
                )}
              </RecommendationCard>
            ))}
          </RecommendationsGrid>
        </Card>
      )}
    </PageContainer>
  )
}
