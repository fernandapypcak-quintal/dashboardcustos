import React from 'react'
import { X } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import { fmt } from '../../utils.js'

export default function PainelDetalhe({ conta, onClose }) {
  if (!conta) return null
  const venc = conta.vencimento ? new Date(conta.vencimento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'

  return (
    <>
      <div className="painel-overlay" onClick={onClose} />
      <div className="painel-lateral">
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E8E8E2', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9E9E8E', marginBottom: 6 }}>
              Detalhe da Conta
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0D0D0D', lineHeight: 1.3 }}>
              {conta.nome}
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4, color: '#9E9E8E' }}>
            <X size={18} />
          </button>
        </div>

        {/* Valor destaque */}
        <div style={{ padding: '20px 24px', background: '#FAFAF8', borderBottom: '1px solid #E8E8E2' }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 6 }}>
            Valor
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: '#0D0D0D' }}>
            {fmt(conta.valor)}
          </div>
        </div>

        {/* Dados */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Row label="Status"><StatusBadge status={conta.status} /></Row>
          <Row label="Fornecedor">{conta.fornecedor}</Row>
          <Row label="Vencimento">{venc}</Row>
          <Row label="Categoria">{conta.categoria}</Row>
          <Row label="Centro de Custo">{conta.centro}</Row>
          {conta.observacao && (
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 6 }}>Observação</div>
              <div style={{ fontSize: 13.5, color: '#4A4A3A', background: '#F5F5EE', borderRadius: 6, padding: '10px 12px', lineHeight: 1.5 }}>
                {conta.observacao}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Row({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8A7A', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: '#0D0D0D' }}>{children}</div>
    </div>
  )
}
