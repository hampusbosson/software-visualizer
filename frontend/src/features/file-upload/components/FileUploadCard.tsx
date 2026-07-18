import { useRef, useState } from 'react'
import type { DragEvent } from 'react'

import { CloseIcon, UploadIcon, ZipFileIcon } from '../../../assets/icons'
import { Button } from '../../../components/ui/button'
import type { UploadState } from '../../../types/file-upload'
import type { GraphResponse } from '../../../types/graph'
import { analyzeFile } from '../api/upload-file'

type FileUploadCardProps = {
  onAnalysisComplete: (graphResponse: GraphResponse) => void
}

export function FileUploadCard({ onAnalysisComplete }: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileSize = file ? formatFileSize(file.size) : null

  function selectFile(nextFile: File | undefined) {
    if (!nextFile) {
      return
    }

    setFile(nextFile)
    setErrorMessage(null)
    setUploadState('idle')
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    selectFile(event.dataTransfer.files[0])
  }

  function openFileDialog() {
    inputRef.current?.click()
  }

  function clearFile() {
    setFile(null)
    setErrorMessage(null)
    setUploadState('idle')

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  async function handleAnalyze() {
    if (!file) {
      return
    }

    setErrorMessage(null)
    setUploadState('uploading')

    try {
      const graphResponse = await analyzeFile(file)
      setUploadState('success')
      onAnalysisComplete(graphResponse)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      setUploadState('error')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[448px] space-y-3">
      <div
        className="group flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-600/80 bg-[#0d1117] px-6 py-8 text-center transition hover:border-slate-400 hover:bg-[#111823]"
        onClick={openFileDialog}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            openFileDialog()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".zip,application/zip"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />

        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-600 bg-[#151b24] text-slate-300">
          <UploadIcon />
        </div>

        <h2 className="text-base font-semibold text-white">Upload files</h2>
        <p className="mt-1 text-sm text-slate-400">
          Supported formats: .zip · Max file size: 50 MB
        </p>

        <Button className="mt-5 h-9 rounded-lg bg-white px-4 text-slate-950 hover:bg-slate-200">
          Browse files
        </Button>
      </div>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-[#0d1117] p-3 shadow-xl shadow-black/10">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-100">
            <ZipFileIcon />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-white">{file.name}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {uploadState === 'uploading' ? 'Uploading…' : fileSize}
            </p>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <button
              className="transition hover:text-white"
              onClick={clearFile}
              type="button"
              aria-label="Remove file"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ) : null}

      {file ? (
        <Button
          className="h-10 w-full rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/40 hover:from-cyan-300 hover:to-blue-400"
          disabled={uploadState === 'uploading'}
          onClick={() => void handleAnalyze()}
        >
          {uploadState === 'uploading' ? 'Analyzing…' : 'Analyze'}
        </Button>
      ) : null}

      {uploadState === 'error' && errorMessage ? (
        <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
