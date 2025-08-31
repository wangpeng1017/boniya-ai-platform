'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, FileImage, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface OCRResult {
  text: string
  confidence: number
  word_count: number
  words: any[]
}

interface ParsedData {
  brand: string
  product_name: string
  specifications: string
  price: number
  confidence: number
  parsing_notes: string
}

interface OCRUploadProps {
  onResult?: (result: { text: string; parsedData?: ParsedData }) => void
  autoParsePrice?: boolean
  recognitionType?: 'basic' | 'accurate'
}

export default function OCRUpload({ 
  onResult, 
  autoParsePrice = true, 
  recognitionType = 'basic' 
}: OCRUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ ocr: OCRResult; parsed?: ParsedData } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    // 显示图片预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', recognitionType)
      formData.append('autoParsePrice', autoParsePrice.toString())

      const response = await fetch('/api/ocr/recognize', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        const resultData = {
          ocr: data.data.ocr_result,
          parsed: data.data.parsed_data
        }
        setResult(resultData)
        
        // 回调给父组件
        if (onResult) {
          onResult({
            text: data.data.ocr_result.text,
            parsedData: data.data.parsed_data
          })
        }
      } else {
        setError(data.error || 'OCR识别失败')
      }
    } catch (err) {
      console.error('OCR上传错误:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const triggerCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileImage className="h-5 w-5 text-blue-600" />
          <span>图片文字识别</span>
        </CardTitle>
        <CardDescription>
          上传图片或拍照识别竞品价格信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 上传按钮 */}
        <div className="flex space-x-3">
          <Button 
            onClick={triggerFileUpload}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            选择图片
          </Button>
          
          <Button 
            onClick={triggerCameraCapture}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            拍照识别
          </Button>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />

        {/* 处理状态 */}
        {isProcessing && (
          <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
            <span className="text-blue-700">正在识别图片中的文字...</span>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* 图片预览 */}
        {previewImage && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">图片预览</h4>
            <div className="relative">
              <img 
                src={previewImage} 
                alt="上传的图片" 
                className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
              />
            </div>
          </div>
        )}

        {/* 识别结果 */}
        {result && (
          <div className="space-y-4">
            {/* OCR结果 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-medium text-green-800">识别成功</span>
                <span className="ml-auto text-sm text-green-600">
                  置信度: {(result.ocr.confidence * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-green-800">识别文字:</span>
                  <div className="mt-1 p-3 bg-white rounded border text-sm">
                    {result.ocr.text || '未识别到文字'}
                  </div>
                </div>
                
                <div className="text-xs text-green-600">
                  识别到 {result.ocr.word_count} 个文字块
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
          <p>• 支持 JPG、PNG、BMP 格式图片</p>
          <p>• 图片大小不超过 4MB</p>
          <p>• 建议图片清晰，文字水平放置</p>
          <p>• 自动解析商品名称、价格、规格等信息</p>
        </div>
      </CardContent>
    </Card>
  )
}
