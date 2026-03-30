'use client'

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Line,
} from '@react-pdf/renderer'
import type { ConfiguracaoIgrejaRow, LancamentoRow } from '@/lib/database.types'
import { formatarReais } from '@/lib/financeiroQueries'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 2,
    color: '#333',
  },
  content: {
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    marginLeft: 10,
    marginBottom: 8,
  },
  table: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 10,
    paddingHorizontal: 5,
  },
  totalRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    marginTop: 10,
  },
  signatures: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureLine: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '40%',
    textAlign: 'center',
    fontSize: 9,
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
  paragraph: {
    textAlign: 'justify',
    marginBottom: 10,
    lineHeight: 1.5,
  },
})

interface DeclaracaoPDFProps {
  config: ConfiguracaoIgrejaRow | null
  nomeMembro: string
  ano: number
  lancamentos: LancamentoRow[]
  categoriasPorLancamento: Map<string, string> // lancamento_id -> categoria_nome
}

export function DeclaracaoPDF({
  config,
  nomeMembro,
  ano,
  lancamentos,
  categoriasPorLancamento,
}: DeclaracaoPDFProps) {
  // Filtrar apenas confirmados do ano
  const contributosConfirmados = lancamentos.filter(
    (l) => l.status === 'confirmado' && new Date(l.data).getFullYear() === ano
  )

  const totalConfirmado = contributosConfirmados.reduce((sum, l) => sum + l.valor, 0)

  // Agrupar por tipo de contribuição
  const titulosPorTipo = new Map<string, number>()
  const ofertasPorTipo = new Map<string, number>()

  contributosConfirmados.forEach((l) => {
    const tipo = l.descricao.includes('dízimo') ? 'Dízimo' : 'Oferta'
    const valor = l.valor

    if (tipo === 'Dízimo') {
      const atual = titulosPorTipo.get('Dízimo') || 0
      titulosPorTipo.set('Dízimo', atual + valor)
    } else {
      const atual = ofertasPorTipo.get('Oferta') || 0
      ofertasPorTipo.set('Oferta', atual + valor)
    }
  })

  const totalDizimo = titulosPorTipo.get('Dízimo') || 0
  const totalOferta = ofertasPorTipo.get('Oferta') || 0

  return (
    <Document
      title={`Declaracao_${nomeMembro.replace(/\s+/g, '_')}_${ano}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>{config?.nome_igreja || 'Igreja Eu Sou'}</Text>
          <Text style={styles.subtitle}>
            DECLARAÇÃO DE CONTRIBUIÇÃO ANUAL
          </Text>
          <Text style={styles.subtitle}>
            Exercício {ano}
          </Text>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Declarante:</Text>
            <Text style={styles.value}>{nomeMembro}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Entidade:</Text>
            <Text style={styles.value}>
              {config?.nome_igreja || 'Igreja Eu Sou'} (CNPJ: {config?.cnpj || '—'})
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Período:</Text>
            <Text style={styles.value}>01/01/{ano} a 31/12/{ano}</Text>
          </View>

          {/* Parágrafo declaratório */}
          <Text style={styles.paragraph}>
            Declaro, para os devidos fins legais, que a pessoa acima mencionada realizou contribuições
            financeiras (dízimos e ofertas) a esta instituição religiosa no período acima especificado,
            conforme demonstrado no resumo abaixo.
          </Text>

          {/* Tabela de Contribuições */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '60%' }]}>Tipo de Contribuição</Text>
              <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>
                Valor (R$)
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '60%' }]}>Dízimo</Text>
              <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>
                {formatarReais(totalDizimo)}
              </Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '60%' }]}>Oferta</Text>
              <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>
                {formatarReais(totalOferta)}
              </Text>
            </View>

            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, { width: '60%' }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { width: '40%', textAlign: 'right' }]}>
                {formatarReais(totalConfirmado)}
              </Text>
            </View>
          </View>

          {/* Informação adicional */}
          <Text style={[styles.paragraph, { marginTop: 20 }]}>
            A presente declaração é fornecida exclusivamente para fins de comprovação de contribuições
            financeiras realizadas à instituição, não representando, por si só, qualquer benefício
            fiscal ou isenção tributária.
          </Text>
        </View>

        {/* Assinaturas */}
        <View style={styles.signatures}>
          <View style={styles.signatureLine}>
            <Text>Assinatura do Declarante</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>Assinatura do Tesoureiro</Text>
          </View>
        </View>

        {/* Data */}
        <Text style={styles.footer}>
          Emitida em {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </Page>
    </Document>
  )
}
