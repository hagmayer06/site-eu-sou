import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const BUCKET = 'avatares'

function getExtFromMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return null
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const userId = formData.get('userId') as string | null
  const file = formData.get('file') as File | null

  if (!userId) return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
  if (!file) return NextResponse.json({ error: 'file é obrigatório' }, { status: 400 })

  const ext = getExtFromMime(file.type)
  if (!ext) return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })

  const filePath = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, file, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('upload avatar falhou', uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60 * 60)

  if (signedError) {
    console.error('createSignedUrl falhou', signedError)
    return NextResponse.json({ error: signedError.message }, { status: 500 })
  }

  await supabaseAdmin
    .from('perfis')
    .update({ foto_url: filePath })
    .eq('id', userId)

  return NextResponse.json({ path: filePath, signedUrl: signedData.signedUrl })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path')

  if (!path) {
    return NextResponse.json({ error: 'path é obrigatório' }, { status: 400 })
  }

  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60)

  if (signedError) {
    console.error('createSignedUrl falhou', signedError)
    return NextResponse.json({ error: signedError.message }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: signedData.signedUrl })
}