import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

import PerfilForm from './PerfilForm'

const perfil = {
  id: 'u1',
  nome: 'Fulano',
  telefone: null,
  data_nascimento: null,
  cep: '',
  rua: '',
  bairro: '',
  cidade: '',
  uf: '',
  foto_url: null,
}

describe('PerfilForm', () => {
  it('renderiza campos de perfil com nome e botão de salvar', () => {
    render(<PerfilForm perfil={perfil as any} />)
    expect(screen.getByPlaceholderText(/seu nome completo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })
})
