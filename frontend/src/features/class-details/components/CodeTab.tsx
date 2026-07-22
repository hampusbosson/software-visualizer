import Editor from '@monaco-editor/react'
import type { OnMount } from '@monaco-editor/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CopyIcon } from '../../../assets/icons'
import { fetchClassSourceCode } from '../api/fetch-code'
import type { ClassDetailsViewModel, MethodJumpTarget } from '../types/class-details'
import type { SourceCodeResponse } from '../types/source-code'

type CodeTabProps = {
  analysisId: string
  methodJumpTarget: MethodJumpTarget | null
  nodeId: string
  viewModel: ClassDetailsViewModel
}

type SourceCodeState =
  | {
      status: 'loading'
    }
  | {
      status: 'success'
      response: SourceCodeResponse
    }
  | {
      status: 'error'
      message: string
    }

type CopyState = 'idle' | 'copied' | 'error'

export function CodeTab({
  analysisId,
  methodJumpTarget,
  nodeId,
  viewModel,
}: CodeTabProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null)
  const methodHighlightRef = useRef<ReturnType<
    Parameters<OnMount>[0]['createDecorationsCollection']
  > | null>(null)
  const [sourceCodeState, setSourceCodeState] = useState<SourceCodeState>({
    status: 'loading',
  })
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let isCurrentRequest = true

    fetchClassSourceCode(analysisId, nodeId)
      .then((response) => {
        if (!isCurrentRequest) {
          return
        }

        setSourceCodeState({ status: 'success', response })
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return
        }

        setSourceCodeState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Could not load source code',
        })
      })

    return () => {
      isCurrentRequest = false
    }
  }, [analysisId, loadAttempt, nodeId])

  function retryLoad() {
    setSourceCodeState({ status: 'loading' })
    setLoadAttempt((currentAttempt) => currentAttempt + 1)
  }

  async function copySourceCode() {
    if (sourceCodeState.status !== 'success') {
      return
    }

    try {
      await navigator.clipboard.writeText(sourceCodeState.response.sourceCode)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  useEffect(() => {
    if (copyState === 'idle') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState('idle')
    }, 1800)

    return () => window.clearTimeout(timeoutId)
  }, [copyState])

  const centerMethodInEditor = useCallback((
    startLineNumber: number,
    endLineNumber: number,
  ) => {
    const editor = editorRef.current

    if (!editor) {
      return
    }

    const layoutHeight = editor.getLayoutInfo().height
    const methodTop = editor.getTopForLineNumber(startLineNumber)
    const lineAfterMethodTop = editor.getTopForLineNumber(endLineNumber + 1)
    const methodBottom =
      lineAfterMethodTop > methodTop
        ? lineAfterMethodTop
        : editor.getBottomForLineNumber(endLineNumber)
    const methodMiddle = methodTop + (methodBottom - methodTop) / 2

    editor.setScrollTop(Math.max(0, methodMiddle - layoutHeight / 2))
  }, [])

  const jumpToMethod = useCallback((target: MethodJumpTarget) => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const model = editor?.getModel()

    if (!editor || !monaco || !model || target.startLine < 1) {
      return
    }

    const lineCount = model.getLineCount()
    const startLineNumber = clampLineNumber(target.startLine, lineCount)
    const endLineNumber = clampLineNumber(
      Math.max(target.endLine, target.startLine),
      lineCount,
    )
    const endColumn = model.getLineMaxColumn(endLineNumber)

    methodHighlightRef.current?.set([
      {
        range: new monaco.Range(
          startLineNumber,
          1,
          endLineNumber,
          endColumn,
        ),
        options: {
          className: 'monaco-method-highlight',
          isWholeLine: true,
          linesDecorationsClassName: 'monaco-method-highlight-glyph',
          overviewRuler: {
            color: '#38bdf8',
            position: monaco.editor.OverviewRulerLane.Center,
          },
        },
      },
    ])

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        centerMethodInEditor(startLineNumber, endLineNumber)
        editor.focus()
      })
    })
  }, [centerMethodInEditor])

  useEffect(() => {
    if (sourceCodeState.status !== 'success' || !methodJumpTarget) {
      return
    }

    jumpToMethod(methodJumpTarget)
  }, [jumpToMethod, methodJumpTarget, sourceCodeState.status])

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    methodHighlightRef.current = editor.createDecorationsCollection()

    if (methodJumpTarget && sourceCodeState.status === 'success') {
      jumpToMethod(methodJumpTarget)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#090d14]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-[#0c111a] px-3 py-2">
          <div className="min-w-0">
            <p className="truncate font-mono text-xs text-slate-300">
              {sourceCodeState.status === 'success'
                ? sourceCodeState.response.fileName
                : `${viewModel.label}.java`}
            </p>
            {sourceCodeState.status === 'success' ? (
              <p className="mt-0.5 truncate font-mono text-[11px] text-slate-600">
                {sourceCodeState.response.sourcePath}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[11px] text-slate-600">
              {copyState === 'copied'
                ? 'copied'
                : copyState === 'error'
                  ? 'copy failed'
                  : sourceCodeState.status === 'loading'
                    ? 'loading'
                    : 'read only'}
            </span>

            {sourceCodeState.status === 'success' ? (
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200"
                onClick={copySourceCode}
                title="Copy file"
                type="button"
                aria-label="Copy source code"
              >
                <CopyIcon />
              </button>
            ) : null}
          </div>
        </div>

        {sourceCodeState.status === 'loading' ? (
          <div className="flex flex-1 items-center justify-center px-4 text-xs text-slate-500">
            Loading source code…
          </div>
        ) : null}

        {sourceCodeState.status === 'error' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <p className="text-sm text-slate-300">Could not load source code</p>
            <p className="max-w-[280px] text-xs leading-5 text-slate-600">
              {sourceCodeState.message}
            </p>
            <button
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
              onClick={retryLoad}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : null}

        {sourceCodeState.status === 'success' ? (
          <CodeViewer
            onEditorMount={handleEditorMount}
            sourceCode={sourceCodeState.response.sourceCode}
          />
        ) : null}
      </div>
    </div>
  )
}

type CodeViewerProps = {
  onEditorMount: OnMount
  sourceCode: string
}

function CodeViewer({ onEditorMount, sourceCode }: CodeViewerProps) {
  return (
    <Editor
      height="100%"
      language="java"
      onMount={onEditorMount}
      value={sourceCode}
      theme="vs-dark"
      options={{
        automaticLayout: true,
        folding: true,
        fontSize: 13,
        lineNumbers: 'on',
        minimap: {
          enabled: false,
        },
        readOnly: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
    />
  )
}

function clampLineNumber(lineNumber: number, lineCount: number) {
  return Math.min(Math.max(lineNumber, 1), lineCount)
}
