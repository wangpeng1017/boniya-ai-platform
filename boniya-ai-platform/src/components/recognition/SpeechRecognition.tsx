'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Upload, Loader2, CheckCircle, AlertCircle, Square } from 'lucide-react'

interface SpeechResult {
  text: string
  confidence: number
  word_count: number
}

interface ParsedData {
  brand: string
  product_name: string
  specifications: string
  price: number
  confidence: number
  parsing_notes: string
}

interface SpeechRecognitionProps {
  onResult?: (result: { text: string; parsedData?: ParsedData }) => void
  autoParsePrice?: boolean
}

export default function SpeechRecognitionComponent({ 
  onResult, 
  autoParsePrice = true 
}: SpeechRecognitionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ speech: SpeechResult; parsed?: ParsedData } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [interimText, setInterimText] = useState('')
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // 检查浏览器是否支持Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsWebSpeechSupported(!!SpeechRecognition)
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'zh-CN'
      }
    }
  }, [])

  const startWebSpeechRecognition = () => {
    if (!recognitionRef.current) return

    setIsRecording(true)
    setError(null)
    setResult(null)
    setInterimText('')

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setInterimText(interimTranscript)

      if (finalTranscript) {
        handleSpeechResult({
          text: finalTranscript,
          confidence: event.results[0][0].confidence || 0.8,
          word_count: finalTranscript.split(/\s+/).length
        })
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      setError(`语音识别错误: ${event.error}`)
      setIsRecording(false)
    }

    recognitionRef.current.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current.start()
  }

  const stopWebSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsRecording(false)
  }

  const handleSpeechResult = async (speechResult: SpeechResult) => {
    setIsProcessing(true)
    
    try {
      // 如果需要自动解析价格信息
      let parsedData = null
      if (autoParsePrice && speechResult.text) {
        const response = await fetch('/api/competitor-price/process-raw-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rawTexts: [speechResult.text],
            sourceType: 'stt',
            locationText: '语音录入'
          })
        })

        const data = await response.json()
        if (data.success && data.data.results[0]) {
          parsedData = data.data.results[0].structured_data
        }
      }

      const resultData = {
        speech: speechResult,
        parsed: parsedData
      }
      
      setResult(resultData)
      
      // 回调给父组件
      if (onResult) {
        onResult({
          text: speechResult.text,
          parsedData: parsedData
        })
      }
    } catch (err) {
      console.error('语音结果处理错误:', err)
      setError('处理语音结果时出错')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAudioFileUpload = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('audio', file)
      formData.append('autoParsePrice', autoParsePrice.toString())

      const response = await fetch('/api/speech/recognize', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const resultData = {
          speech: data.data.speech_result,
          parsed: data.data.parsed_data
        }
        setResult(resultData)
        
        // 回调给父组件
        if (onResult) {
          onResult({
            text: data.data.speech_result.text,
            parsedData: data.data.parsed_data
          })
        }
      } else {
        setError(data.error || '语音识别失败')
      }
    } catch (err) {
      console.error('音频文件上传错误:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAudioFileUpload(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5 text-green-600" />
          <span>语音识别</span>
        </CardTitle>
        <CardDescription>
          实时语音录入或上传音频文件识别竞品价格信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 录音按钮 */}
        <div className="flex space-x-3">
          {isWebSpeechSupported ? (
            <Button 
              onClick={isRecording ? stopWebSpeechRecognition : startWebSpeechRecognition}
              disabled={isProcessing}
              variant={isRecording ? "destructive" : "default"}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  停止录音
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  开始录音
                </>
              )}
            </Button>
          ) : (
            <Button disabled className="flex-1">
              <MicOff className="h-4 w-4 mr-2" />
              浏览器不支持实时语音
            </Button>
          )}
          
          <Button 
            onClick={triggerFileUpload}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            上传音频文件
          </Button>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 实时识别状态 */}
        {isRecording && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-green-700 font-medium">正在录音...</span>
            </div>
            {interimText && (
              <div className="text-sm text-green-600">
                <span className="font-medium">实时识别:</span> {interimText}
              </div>
            )}
          </div>
        )}

        {/* 处理状态 */}
        {isProcessing && (
          <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
            <span className="text-blue-700">正在处理语音...</span>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* 识别结果 */}
        {result && (
          <div className="space-y-4">
            {/* 语音识别结果 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium text-green-800">识别成功</span>
                <span className="ml-auto text-sm text-green-600">
                  置信度: {(result.speech.confidence * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-800">识别文字:</span>
                  <div className="mt-1 p-3 bg-white rounded border text-sm">
                    {result.speech.text || '未识别到语音'}
                  </div>
                </div>
                
                <div className="text-xs text-green-600">
                  识别到 {result.speech.word_count} 个词
                </div>
              </div>
            </div>

            {/* 解析结果 */}
            {result.parsed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="font-medium text-blue-800">AI解析结果</span>
                  <span className="ml-auto text-sm text-blue-600">
                    置信度: {(result.parsed.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">品牌:</span>
                    <div className="text-blue-700">{result.parsed.brand}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">商品名称:</span>
                    <div className="text-blue-700">{result.parsed.product_name}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">规格:</span>
                    <div className="text-blue-700">{result.parsed.specifications || '未知'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">价格:</span>
                    <div className="text-blue-700 font-bold">
                      {result.parsed.price ? `¥${result.parsed.price}` : '未识别'}
                    </div>
                  </div>
                </div>
                
                {result.parsed.parsing_notes && (
                  <div className="mt-3 text-xs text-blue-600">
                    <span className="font-medium">解析说明:</span> {result.parsed.parsing_notes}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 实时录音：点击"开始录音"按钮，说话后自动识别</p>
          <p>• 音频文件：支持 WAV、MP3、M4A、AMR 格式</p>
          <p>• 文件大小不超过 10MB</p>
          <p>• 建议在安静环境下录音，语速适中</p>
          <p>• 自动解析商品名称、价格、规格等信息</p>
        </div>
      </CardContent>
    </Card>
  )
}
