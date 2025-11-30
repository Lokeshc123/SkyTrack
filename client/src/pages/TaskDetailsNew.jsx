import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { 
  FaChartLine, FaCalendarAlt, FaUser, FaFolder, FaFlag, 
  FaClock, FaExclamationTriangle, FaLightbulb, FaRobot,
  FaArrowLeft, FaMagic, FaCheckCircle
} from 'react-icons/fa'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${colors.textSecondary};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  transition: color 0.2s;
  
  &:hover { color: ${colors.text}; }
`

const Header = styled.div`
  margin-bottom: 24px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: ${colors.text};
  line-height: 1.3;
`

const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.textSecondary};
  
  svg { color: ${colors.textMuted}; }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: ${colors.primaryGradient};
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 10px -1px rgba(59, 130, 246, 0.3);
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  
  @media (max-width: 1024px) {
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

const CardSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.textSecondary};
`

/* ===== Progress Section ===== */
const ProgressSection = styled.div`
  margin-bottom: 24px;
`

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const ProgressLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
`

const ProgressValue = styled.span`
  font-size: 24px;
  font-weight: 800;
  background: ${colors.primaryGradient};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`

const ProgressBar = styled.div`
  height: 12px;
  background: ${colors.borderLight};
  border-radius: 6px;
  overflow: hidden;
`

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${colors.primaryGradient};
  border-radius: 6px;
`

/* ===== Stats Grid ===== */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`

const StatCard = styled.div`
  background: ${props => props.$bg || colors.surfaceHover};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: ${props => props.$color || colors.text};
`

const StatLabel = styled.div`
  font-size: 11px;
  color: ${colors.textSecondary};
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

/* ===== AI Insights ===== */
const AICard = styled(Card)`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid ${colors.border};
`

const AIHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`

const AIIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
`

const RiskBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  border: 1px solid ${props => props.$border};
`

const ScoreCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    ${colors.primary} ${props => props.$score * 3.6}deg,
    ${colors.borderLight} ${props => props.$score * 3.6}deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: white;
  }
`

const ScoreValue = styled.span`
  position: relative;
  font-size: 20px;
  font-weight: 800;
  color: ${colors.text};
`

const RecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`

const Recommendation = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid ${colors.border};
`

const RecIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  font-size: 12px;
  flex-shrink: 0;
`

const RecContent = styled.div`
  flex: 1;
`

const RecPriority = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: ${props => {
    if (props.$priority === 'critical') return colors.danger
    if (props.$priority === 'high') return colors.warning
    return colors.success
  }};
  color: white;
`

const RecMessage = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${colors.textSecondary};
  line-height: 1.4;
`

/* ===== Description ===== */
const Description = styled.div`
  font-size: 14px;
  color: ${colors.textSecondary};
  line-height: 1.7;
  white-space: pre-wrap;
`

/* ===== Blockers ===== */
const BlockerList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`

const BlockerChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: ${colors.dangerBg};
  color: ${colors.danger};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
`

/* ===== Daily Update Form ===== */
const FormCard = styled(Card)`
  position: sticky;
  top: 100px;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const RangeInput = styled.input`
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: ${colors.borderLight};
  border-radius: 3px;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`

const RangeValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.primary};
  min-width: 45px;
  text-align: right;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`

const Button = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: ${colors.primaryGradient};
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }
  ` : `
    background: white;
    color: ${colors.textSecondary};
    border: 1px solid ${colors.border};
    
    &:hover {
      background: ${colors.surfaceHover};
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const EnhanceButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  padding: 10px 12px;
  background: ${colors.dangerBg};
  color: ${colors.danger};
  border-radius: 8px;
  font-size: 13px;
`

const SuccessMessage = styled(motion.div)`
  padding: 10px 12px;
  background: ${colors.successBg};
  color: ${colors.success};
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.textSecondary};
`

/* ===== Component ===== */
export default function TaskDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState('')
  const [blockers, setBlockers] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/api/tasks/${id}`)
        setTask(res.data)
        
        // Fetch AI analysis
        try {
          const aiRes = await api.get(`/api/notifications/task-confidence/${id}`)
          setAiAnalysis(aiRes.data)
        } catch (e) {
          console.log('AI analysis not available')
        }
      } catch (err) {
        console.error('Failed to fetch task', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTask()
  }, [id])

  const handleEnhance = async () => {
    if (!note.trim()) return
    setEnhancing(true)
    try {
      const res = await api.post('/api/ai/enhance-update', { 
        updateText: note,
        taskTitle: task.title 
      })
      if (res.data.enhancedText) {
        setNote(res.data.enhancedText)
      }
    } catch (err) {
      console.error('Failed to enhance', err)
    } finally {
      setEnhancing(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)
    
    try {
      const payload = {
        task: id,
        note: note || undefined,
        progress: progress !== '' ? Number(progress) : undefined,
        blockers: blockers ? blockers.split(',').map(s => s.trim()).filter(Boolean) : undefined
      }
      
      const res = await api.post('/api/daily-updates/new-update', payload)
      setTask(res.data.task)
      setNote('')
      setProgress('')
      setBlockers('')
      setSuccess(true)
      
      // Refresh AI analysis
      const aiRes = await api.get(`/api/notifications/task-confidence/${id}`)
      setAiAnalysis(aiRes.data)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit update')
    } finally {
      setSubmitting(false)
    }
  }

  const getRiskStyles = (risk) => {
    const styles = {
      Low: { bg: colors.successBg, color: '#065f46', border: '#a7f3d0' },
      Medium: { bg: colors.warningBg, color: '#92400e', border: '#fde68a' },
      High: { bg: colors.dangerBg, color: '#991b1b', border: '#fecaca' },
      Critical: { bg: colors.dangerBg, color: '#991b1b', border: '#fecaca' }
    }
    return styles[risk] || styles.Low
  }

  if (loading) return <Loading>Loading task...</Loading>
  if (!task) return <Loading>Task not found</Loading>

  const riskStyles = aiAnalysis ? getRiskStyles(aiAnalysis.riskLevel) : getRiskStyles('Low')
  const daysLeft = task.dueDate ? Math.max(0, Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))) : null

  return (
    <PageContainer>
      <BackLink to="/tasks">
        <FaArrowLeft /> Back to Tasks
      </BackLink>

      <Header>
        <TitleRow>
          <div>
            <Title>{task.title}</Title>
            <HeaderMeta>
              <StatusBadge status={task.status} />
              <MetaItem>
                <FaFolder /> {task.project?.name || 'No Project'}
              </MetaItem>
              <MetaItem>
                <FaUser /> {task.assignee?.name || 'Unassigned'}
              </MetaItem>
              {task.dueDate && (
                <MetaItem>
                  <FaCalendarAlt /> Due {new Date(task.dueDate).toLocaleDateString()}
                </MetaItem>
              )}
              <MetaItem>
                <FaFlag style={{ color: task.priority === 'urgent' ? colors.danger : task.priority === 'high' ? colors.warning : colors.textMuted }} />
                <span style={{ textTransform: 'capitalize' }}>{task.priority}</span>
              </MetaItem>
            </HeaderMeta>
          </div>
          <ActionButtons>
            <PrimaryButton to={`/tasks/${id}/journey`}>
              <FaChartLine /> View Journey
            </PrimaryButton>
          </ActionButtons>
        </TitleRow>
      </Header>

      <Grid>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Progress Card */}
          <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressSection>
              <ProgressHeader>
                <ProgressLabel>Overall Progress</ProgressLabel>
                <ProgressValue>{task.progress || 0}%</ProgressValue>
              </ProgressHeader>
              <ProgressBar>
                <ProgressFill 
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress || 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </ProgressBar>
            </ProgressSection>

            <StatsGrid>
              <StatCard $bg={colors.surfaceHover}>
                <StatValue>{daysLeft ?? '—'}</StatValue>
                <StatLabel>Days Left</StatLabel>
              </StatCard>
              <StatCard $bg={colors.surfaceHover}>
                <StatValue $color={colors.primary}>{aiAnalysis?.score || task.aiConfidence || 0}</StatValue>
                <StatLabel>Confidence</StatLabel>
              </StatCard>
              <StatCard $bg={task.blockers?.length ? colors.dangerBg : colors.successBg}>
                <StatValue $color={task.blockers?.length ? colors.danger : colors.success}>
                  {task.blockers?.length || 0}
                </StatValue>
                <StatLabel>Blockers</StatLabel>
              </StatCard>
            </StatsGrid>

            <CardTitle style={{ marginBottom: 12 }}>
              <FaLightbulb /> Description
            </CardTitle>
            <Description>
              {task.description || 'No description provided for this task.'}
            </Description>

            {task.blockers?.length > 0 && (
              <>
                <CardTitle style={{ marginTop: 20, marginBottom: 12 }}>
                  <FaExclamationTriangle style={{ color: colors.danger }} /> Active Blockers
                </CardTitle>
                <BlockerList>
                  {task.blockers.map((b, i) => (
                    <BlockerChip key={i}>
                      <FaExclamationTriangle size={12} /> {b}
                    </BlockerChip>
                  ))}
                </BlockerList>
              </>
            )}
          </Card>

          {/* AI Insights Card */}
          {aiAnalysis && (
            <AICard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <AIHeader>
                <AIIcon>
                  <FaRobot />
                </AIIcon>
                <div>
                  <CardTitle style={{ marginBottom: 4 }}>AI Insights</CardTitle>
                  <CardSubtitle>
                    {aiAnalysis.analysis?.progressDelta >= 0 
                      ? 'You are on track' 
                      : `${Math.abs(aiAnalysis.analysis?.progressDelta || 0)}% behind schedule`}
                  </CardSubtitle>
                </div>
              </AIHeader>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                <ScoreCircle $score={aiAnalysis.score || 0}>
                  <ScoreValue>{aiAnalysis.score || 0}</ScoreValue>
                </ScoreCircle>
                <div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>Risk Level</div>
                  <RiskBadge 
                    $bg={riskStyles.bg} 
                    $color={riskStyles.color} 
                    $border={riskStyles.border}
                  >
                    {aiAnalysis.riskLevel || 'Unknown'}
                  </RiskBadge>
                </div>
              </div>

              {aiAnalysis.recommendations?.length > 0 && (
                <>
                  <CardTitle style={{ marginBottom: 12 }}>
                    <FaLightbulb /> Recommendations
                  </CardTitle>
                  <RecommendationList>
                    {aiAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                      <Recommendation key={i}>
                        <RecIcon 
                          $bg={rec.priority === 'critical' ? colors.dangerBg : rec.priority === 'high' ? colors.warningBg : colors.successBg}
                          $color={rec.priority === 'critical' ? colors.danger : rec.priority === 'high' ? colors.warning : colors.success}
                        >
                          <FaLightbulb />
                        </RecIcon>
                        <RecContent>
                          <RecPriority $priority={rec.priority}>{rec.priority}</RecPriority>
                          <RecMessage>{rec.message}</RecMessage>
                        </RecContent>
                      </Recommendation>
                    ))}
                  </RecommendationList>
                </>
              )}
            </AICard>
          )}
        </div>

        {/* Right Column - Daily Update Form */}
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CardHeader>
            <CardTitle>
              <FaClock /> Daily Update
            </CardTitle>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>What did you work on?</Label>
                <EnhanceButton 
                  type="button" 
                  onClick={handleEnhance}
                  disabled={!note.trim() || enhancing}
                >
                  <FaMagic /> {enhancing ? 'Enhancing...' : 'Enhance with AI'}
                </EnhanceButton>
              </div>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe what you accomplished today..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Progress Update</Label>
              <RangeContainer>
                <RangeInput
                  type="range"
                  min="0"
                  max="100"
                  value={progress || task.progress || 0}
                  onChange={(e) => setProgress(e.target.value)}
                />
                <RangeValue>{progress || task.progress || 0}%</RangeValue>
              </RangeContainer>
            </FormGroup>

            <FormGroup>
              <Label>Blockers (comma separated)</Label>
              <Input
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="e.g., waiting for API, need design review"
              />
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            {success && (
              <SuccessMessage
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <FaCheckCircle /> Update submitted successfully!
              </SuccessMessage>
            )}

            <ButtonGroup>
              <Button 
                type="button" 
                onClick={() => { setNote(''); setProgress(''); setBlockers(''); }}
              >
                Clear
              </Button>
              <Button type="submit" $primary disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Update'}
              </Button>
            </ButtonGroup>
          </Form>
        </FormCard>
      </Grid>
    </PageContainer>
  )
}
