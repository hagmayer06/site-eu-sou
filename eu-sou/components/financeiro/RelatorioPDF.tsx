'use client'

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { LancamentoRow, ConfiguracaoIgrejaRow, CategoriaFinanceiroRow } from '@/lib/database.types'
import { formatarReais } from '@/lib/financeiroQueries'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#555',
    marginBottom: 3,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeader: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 5,
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
  },
  totalRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: 5,
  },
  footer: {
    marginTop: 40,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
})

interface RelatorioPDFProps {
  config: ConfiguracaoIgrejaRow | null
  lancamentos: LancamentoRow[]
  categorias: Map<string, string> // id -> nome
  dataInicio: string
  dataFim: string
  titulo: string
}

export function RelatorioPDF({
  config,
  lancamentos,
  categorias,
  dataInicio,
  dataFim,
  titulo,
}: RelatorioPDFProps) {
  // Calcular totais por categoria
  const totaisPorCategoria = new Map<string, number>()
  let totalGeral = 0

  lancamentos.forEach((l) => {
    const categoria = categorias.get(l.categoria_id) || 'Sem categoria'
    const atual = totaisPorCategoria.get(categoria) || 0
    totaisPorCategoria.set(categoria, atual + l.valor)
    totalGeral += l.valor
  })

  return (
    <Document title={`${titulo} - ${new Date().toLocaleDateString('pt-BR')}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>{config?.nome_igreja || 'Igreja Eu Sou'}</Text>
          <Text style={styles.subtitle}>
            CNPJ: {config?.cnpj || '—'}
          </Text>
          <Text style={styles.subtitle}>
            {titulo}
          </Text>
          <Text style={styles.subtitle}>
            Período: {new Date(dataInicio).toLocaleDateString('pt-BR')} até{' '}
            {new Date(dataFim).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        {/* Lançamentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lançamentos</Text>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '12%' }]}>Data</Text>
              <Text style={[styles.tableCell, { width: '8%' }]}>Tipo</Text>
              <Text style={[styles.tableCell, { width: '22%' }]}>Categoria</Text>
              <Text style={[styles.tableCell, { width: '38%' }]}>Descrição</Text>
              <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>Valor</Text>
              <Text style={[styles.tableCell, { width: '8%' }]}>Status</Text>
            </View>

            {/* Data Rows */}
            {lancamentos.map((l, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '12%' }]}>
                  {new Date(l.data).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {l.tipo === 'entrada' ? 'E' : 'S'}
                </Text>
                <Text style={[styles.tableCell, { width: '22%' }]}>
                  {categorias.get(l.categoria_id) || '—'}
                </Text>
                <Text style={[styles.tableCell, { width: '38%' }]}>
                  {l.descricao.substring(0, 40)}
                </Text>
                <Text style={[styles.tableCell, { width: '12%', textAlign: 'right' }]}>
                  {formatarReais(l.valor)}
                </Text>
                <Text style={[styles.tableCell, { width: '8%' }]}>
                  {l.status.substring(0, 3)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totais por Categoria */}
        {totaisPorCategoria.size > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Totais por Categoria</Text>
            <View style={styles.table}>
              {/* Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { width: '70%' }]}>Categoria</Text>
                <Text style={[styles.tableCell, { width: '30%', textAlign: 'right' }]}>
                  Total
                </Text>
              </View>

              {/* Rows */}
              {Array.from(totaisPorCategoria.entries()).map(([categoria, total], idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '70%' }]}>{categoria}</Text>
                  <Text style={[styles.tableCell, { width: '30%', textAlign: 'right' }]}>
                    {formatarReais(total)}
                  </Text>
                </View>
              ))}

              {/* Total Row */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, { width: '70%' }]}>TOTAL GERAL</Text>
                <Text style={[styles.tableCell, { width: '30%', textAlign: 'right' }]}>
                  {formatarReais(totalGeral)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Gerado em {new Date().toLocaleString('pt-BR')}</Text>
        </View>
      </Page>
    </Document>
  )
}
