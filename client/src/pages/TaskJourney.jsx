import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaArrowLeft, FaCalendar, FaClock, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import api from '../lib/api'
import Confidence from '../components/Confidence'
import StatusBadge from '../components/StatusBadge'

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 32px 72px;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 24px;
  
  &:hover {
    color: #0f172a;
  }
`

const Header = styled.div`
  margin-bottom: 32px;
`

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
`

const Subtitle = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 14px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  
  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`

const CardTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`

const Stat = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
`

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
`

const ProgressBar = styled.div`
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
`

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`

const Timeline = styled.div`
  position: relative;
  padding-left: 24px;
  
  &::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e2e8f0;
  }
`

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 24px;
  
  &:last-child {
    padding-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -20px;
    top: 4px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.$isLatest ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : '#cbd5e1'};
    border: 2px solid white;
    box-shadow: 0 0 0 2px ${props => props.$isLatest ? '#3b82f6' : '#e2e8f0'};
  }
`

const TimelineDate = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`

const TimelineContent = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 12px;
`

const TimelineAuthor = styled.span`
  font-weight: 600;
  color: #0f172a;
`

const TimelineNote = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
`

const TimelineProgress = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.$delta > 0 ? '#dcfce7' : props.$delta < 0 ? '#fef2f2' : '#f1f5f9'};
  color: ${props => props.$delta > 0 ? '#166534' : props.$delta < 0 ? '#991b1b' : '#64748b'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 8px;
`

const BlockerList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`

const BlockerChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fef2f2;
  color: #991b1b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
`

const RecommendationList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const Recommendation = styled.li`
  padding: 12px;
  background: ${props => {
    if (props.$priority === 'critical') return '#fef2f2'
    if (props.$priority === 'high') return '#fffbeb'
    return '#f0fdf4'
  }};
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #334155;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const RecommendationPriority = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
  background: ${props => {
    if (props.$priority === 'critical') return '#dc2626'
    if (props.$priority === 'high') return '#f59e0b'
    return '#22c55e'
  }};
  color: white;
`

const RiskBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  background: ${props => {
    if (props.$risk === 'Critical' || props.$risk === 'High') return '#fef2f2'
    if (props.$risk === 'Medium') return '#fffbeb'
    return '#f0fdf4'
  }};
  color: ${props => {
    if (props.$risk === 'Critical' || props.$risk === 'High') return '#991b1b'
    if (props.$risk === 'Medium') return '#92400e'
    return '#166534'
  }};
  border: 1px solid ${props => {
    if (props.$risk === 'Critical' || props.$risk === 'High') return '#fecaca'
    if (props.$risk === 'Medium') return '#fde68a'
    return '#bbf7d0'
  }};
`

const Empty = styled.div`
  text-align: center;
  padding: 32px;
  color: #94a3b8;
`

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 600;
`

export default function TaskJourney() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const res = await api.get(`/api/daily-updates/task/${id}/journey`)
        setData(res.data)
      } catch (err) {
        console.error('Failed to fetch journey', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJourney()
  }, [id])

  if (loading) return <PageContainer><Empty>Loading journey...</Empty></PageContainer>
  if (!data) return <PageContainer><Empty>Failed to load task journey</Empty></PageContainer>

  const { task, journey, aiAnalysis } = data

  return (
    <PageContainer>
      <BackLink to={`/tasks/${id}`}>
        <FaArrowLeft /> Back to Task
      </BackLink>

      <Header>
        <Title>{task.title}</Title>
        <Subtitle>
          {task.project?.name} • Assigned to {task.assignee?.name || 'Unassigned'}
        </Subtitle>
        <MetaRow>
          <StatusBadge status={task.status} />
          <Chip style={{ textTransform: 'capitalize' }}>Priority: {task.priority}</Chip>
          {task.dueDate && (
            <Chip>
              <FaCalendar size={10} />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Chip>
          )}
        </MetaRow>
      </Header>

      <Grid>
        {/* Left: Timeline */}
        <div>
          <Card>
            <CardTitle>
              <FaClock /> Progress Timeline
            </CardTitle>
            
            <ProgressBar>
              <ProgressFill $progress={task.progress || 0} />
            </ProgressBar>
            <div style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginBottom: 24 }}>
              {task.progress || 0}% Complete
            </div>

            {journey.timeline.length === 0 ? (
              <Empty>No updates yet</Empty>
            ) : (
              <Timeline>
                {journey.timeline.slice().reverse().map((item, idx) => (
                  <TimelineItem key={idx} $isLatest={idx === 0}>
                    <TimelineDate>
                      {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TimelineDate>
                    <TimelineContent>
                      <TimelineAuthor>{item.author}</TimelineAuthor>
                      {item.note && <TimelineNote>{item.note}</TimelineNote>}
                      {item.progress != null && (
                        <TimelineProgress $delta={item.progressDelta}>
                          <FaChartLine size={10} />
                          {item.progress}%
                          {item.progressDelta !== 0 && (
                            <span>({item.progressDelta > 0 ? '+' : ''}{item.progressDelta}%)</span>
                          )}
                        </TimelineProgress>
                      )}
                      {item.blockers.length > 0 && (
                        <BlockerList>
                          {item.blockers.map((b, i) => (
                            <BlockerChip key={i}>
                              <FaExclamationTriangle size={10} /> {b}
                            </BlockerChip>
                          ))}
                        </BlockerList>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </Card>
        </div>

        {/* Right: Stats & AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <CardTitle>Journey Summary</CardTitle>
            <StatGrid>
              <Stat>
                <StatValue>{journey.summary.totalUpdates}</StatValue>
                <StatLabel>Updates</StatLabel>
              </Stat>
              <Stat>
                <StatValue>{journey.summary.daysActive}</StatValue>
                <StatLabel>Days Active</StatLabel>
              </Stat>
              <Stat>
                <StatValue>{journey.summary.velocity}%</StatValue>
                <StatLabel>Avg Progress/Update</StatLabel>
              </Stat>
              <Stat>
                <StatValue>{journey.summary.allBlockers.length}</StatValue>
                <StatLabel>Total Blockers</StatLabel>
              </Stat>
            </StatGrid>

            {journey.summary.allBlockers.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>All Blockers Encountered</div>
                <BlockerList>
                  {journey.summary.allBlockers.map((b, i) => (
                    <BlockerChip key={i}>
                      <FaExclamationTriangle size={10} /> {b}
                    </BlockerChip>
                  ))}
                </BlockerList>
              </>
            )}
          </Card>

          <Card>
            <CardTitle>AI Analysis</CardTitle>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Confidence Score</div>
                <Confidence value={aiAnalysis?.score || 0} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Risk Level</div>
                <RiskBadge $risk={aiAnalysis?.riskLevel}>
                  {aiAnalysis?.riskLevel || 'Unknown'}
                </RiskBadge>
              </div>
            </div>

            {aiAnalysis?.analysis && (
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                {aiAnalysis.analysis.progressDelta >= 0 
                  ? `On track with ${aiAnalysis.analysis.daysRemaining} days remaining`
                  : `${Math.abs(aiAnalysis.analysis.progressDelta)}% behind schedule`
                }
              </div>
            )}

            {aiAnalysis?.recommendations?.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Recommendations</div>
                <RecommendationList>
                  {aiAnalysis.recommendations.map((rec, i) => (
                    <Recommendation key={i} $priority={rec.priority}>
                      <RecommendationPriority $priority={rec.priority}>
                        {rec.priority}
                      </RecommendationPriority>
                      {rec.message}
                    </Recommendation>
                  ))}
                </RecommendationList>
              </>
            )}
          </Card>
        </div>
      </Grid>
    </PageContainer>
  )
}
