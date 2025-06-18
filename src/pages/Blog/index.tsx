import { useState } from 'react'
import posts from '../../data/posts.json'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'

interface Post {
  id: number
  title: string
  excerpt: string
  content: string
}

export default function Blog() {
  const [selected, setSelected] = useState<Post | null>(null)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Blog</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {(posts as Post[]).map(p => (
          <Card key={p.id} title={p.title} onClick={() => setSelected(p)}>
            <p>{p.excerpt}</p>
          </Card>
        ))}
      </div>
      {selected && (
        <Modal open={true} onClose={() => setSelected(null)} title={selected.title}>
          <p className="whitespace-pre-line">{selected.content}</p>
        </Modal>
      )}
    </div>
  )
}
