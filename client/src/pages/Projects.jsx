import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styled from 'styled-components'

const Card = styled.div`
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.04);
`
const Grid = styled.div`display: grid; gap: 16px;`
const Row = styled.div`display: grid; gap: 10px; grid-template-columns: 1fr 160px 1fr auto;`
const Input = styled.input`border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px;`
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 14px;`
const Th = styled.th`text-align: left; padding: 12px; background: #f3f4f6;`
const Td = styled.td`padding: 12px; border-top: 1px solid var(--border);`
const Button = styled.button`
  background: var(--primary); color: var(--primary-contrast);
  border: 1px solid transparent; border-radius: 10px; padding: 10px 14px; cursor: pointer;
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
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Projects</h1>

      {isManager && (
        <Card as="form" onSubmit={createProject}>
          <Row>
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input placeholder="KEY" value={key} onChange={e => setKey(e.target.value.toUpperCase())} required />
            <Input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
            <Button type="submit">Create</Button>
          </Row>
          {error && <div style={{ color:'#dc2626', fontSize:12, marginTop:8 }}>{error}</div>}
        </Card>
      )}

      <Card>
        <Table>
          <thead><tr><Th>Name</Th><Th>Key</Th><Th>Owner</Th><Th>Status</Th></tr></thead>
          <tbody>
            {projects.map(p => (
              <tr key={p._id}>
                <Td>{p.name}</Td>
                <Td>{p.key}</Td>
                <Td>{String(p.owner)}</Td>
                <Td className="capitalize">{p.status}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Grid>
  )
}
