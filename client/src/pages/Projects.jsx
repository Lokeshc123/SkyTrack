import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styled from 'styled-components'

const Card = styled.div`
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 16px; box-shadow: 0 10px 20px var(--shadow);
`
const Grid = styled.div`
  display: grid; 
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 32px 72px;
`
const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0;
`
const Row = styled.div`display: grid; gap: 10px; grid-template-columns: 1fr 160px 1fr auto;`
const Input = styled.input`
  border: 1px solid var(--border); 
  border-radius: 10px; 
  padding: 10px 12px;
  background: var(--input-bg);
  color: var(--text);
  &:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-light);
  }
`
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 14px;`
const Th = styled.th`text-align: left; padding: 12px; background: var(--surface-alt); color: var(--text); font-weight: 600;`
const Td = styled.td`padding: 12px; border-top: 1px solid var(--border); color: var(--text);`
const TRow = styled.tr`
  &:hover td {
    background: var(--surface-hover);
  }
`
const Button = styled.button`
  background: var(--primary); color: white;
  border: 1px solid transparent; border-radius: 10px; padding: 10px 14px; cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  &:hover {
    background: var(--primary-hover);
  }
`

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [desc, setDesc] = useState('')
  const [error, setError] = useState('')

  const isManager = useMemo(() => ['manager', 'admin'].includes(user?.role), [user])

  useEffect(() => {
    api.get('/api/projects').then(res => setProjects(res.data))
  }, [])

  const createProject = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/api/projects', { name, key, description: desc })
      setProjects([res.data, ...projects])
      setName(''); setKey(''); setDesc('')
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed')
    }
  }

  return (
    <Grid>
      <Title>Projects</Title>

      {isManager && (
        <Card as="form" onSubmit={createProject}>
          <Row>
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input placeholder="KEY" value={key} onChange={e => setKey(e.target.value.toUpperCase())} required />
            <Input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
            <Button type="submit">Create</Button>
          </Row>
          {error && <div style={{ color: 'var(--danger)', fontSize:12, marginTop:8 }}>{error}</div>}
        </Card>
      )}

      <Card>
        <Table>
          <thead><tr><Th>Name</Th><Th>Key</Th><Th>Owner</Th><Th>Status</Th></tr></thead>
          <tbody>
            {projects.map(p => (
              <TRow key={p._id}>
                <Td>{p.name}</Td>
                <Td>{p.key}</Td>
                <Td>{p.owner?.name || 'Unknown'}</Td>
                <Td className="capitalize">{p.status}</Td>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </Grid>
  )
}
