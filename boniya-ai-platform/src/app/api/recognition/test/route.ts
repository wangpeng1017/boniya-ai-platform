import { NextRequest, NextResponse } from 'next/server'
import { baiduOCR } from '@/lib/ocr/baidu-ocr'
import { BaiduSpeechRecognition } from '@/lib/speech/speech-recognition'
import { competitorAnalysisAI } from '@/lib/ai/competitor-analysis-ai'

// 测试识别服务状态
export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      services: {
        ocr: { available: false, message: '', error: null as string | null },
        speech: { available: false, message: '', error: null as string | null },
        ai: { available: false, message: '', error: null as string | null }
      },
      overall_status: 'unknown'
    }

    // 测试OCR服务
    try {
      const ocrStatus = await baiduOCR.checkStatus()
      results.services.ocr = {
        available: ocrStatus.available,
        message: ocrStatus.message,
        error: null
      }
    } catch (error) {
      results.services.ocr = {
        available: false,
        message: '服务检查失败',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }

    // 测试语音识别服务
    try {
      const speechService = new BaiduSpeechRecognition()
      const speechStatus = await speechService.checkStatus()
      results.services.speech = {
        available: speechStatus.available,
        message: speechStatus.message,
        error: null
      }
    } catch (error) {
      results.services.speech = {
        available: false,
        message: '服务检查失败',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }

    // 测试AI解析服务
    try {
      const testText = "喜旺蒜香烤肠160克7.9元"
      const aiResult = await competitorAnalysisAI.parseRawText(testText)
      results.services.ai = {
        available: aiResult.confidence > 0,
        message: aiResult.confidence > 0 ? 'AI解析服务正常' : 'AI解析服务异常',
        error: null
      }
    } catch (error) {
      results.services.ai = {
        available: false,
        message: '服务检查失败',
        error: error instanceof Error ? error.message : '未知错误'
      }
    }

    // 计算整体状态
    const allAvailable = Object.values(results.services).every(service => service.available)
    const someAvailable = Object.values(results.services).some(service => service.available)
    
    results.overall_status = allAvailable ? 'healthy' : someAvailable ? 'partial' : 'unhealthy'

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Recognition services test error:', error)
    return NextResponse.json({
      success: false,
      error: '服务状态检查失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 测试完整的识别流程
export async function POST(request: NextRequest) {
  try {
    const { testType, testData } = await request.json()

    if (!testType || !testData) {
      return NextResponse.json({
        success: false,
        error: '请提供测试类型和测试数据'
      }, { status: 400 })
    }

    const results = {
      test_type: testType,
      timestamp: new Date().toISOString(),
      steps: {
        recognition: { success: false, data: null as any, error: null as string | null },
        parsing: { success: false, data: null as any, error: null as string | null }
      },
      overall_success: false
    }

    // 根据测试类型执行不同的识别流程
    if (testType === 'ocr') {
      // 测试OCR识别
      try {
        const ocrResult = await baiduOCR.recognizeText(testData, {
          language_type: 'CHN_ENG',
          detect_direction: true,
          probability: true
        })

        results.steps.recognition = {
          success: ocrResult.success,
          data: {
            text: ocrResult.text,
            confidence: ocrResult.confidence,
            word_count: ocrResult.words.length
          },
          error: ocrResult.error || null
        }

        // 如果OCR成功，尝试AI解析
        if (ocrResult.success && ocrResult.text) {
          try {
            const parsedData = await competitorAnalysisAI.parseRawText(ocrResult.text)
            results.steps.parsing = {
              success: parsedData.confidence > 0,
              data: parsedData,
              error: null
            }
          } catch (parseError) {
            results.steps.parsing = {
              success: false,
              data: null,
              error: parseError instanceof Error ? parseError.message : '解析失败'
            }
          }
        }

      } catch (error) {
        results.steps.recognition = {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : 'OCR识别失败'
        }
      }

    } else if (testType === 'speech') {
      // 测试语音识别
      try {
        const speechService = new BaiduSpeechRecognition()
        const speechResult = await speechService.recognizeSpeech(testData, 'wav', 16000)

        results.steps.recognition = {
          success: speechResult.success,
          data: {
            text: speechResult.text,
            confidence: speechResult.confidence,
            word_count: speechResult.text.split(/\s+/).length
          },
          error: speechResult.error || null
        }

        // 如果语音识别成功，尝试AI解析
        if (speechResult.success && speechResult.text) {
          try {
            const parsedData = await competitorAnalysisAI.parseRawText(speechResult.text)
            results.steps.parsing = {
              success: parsedData.confidence > 0,
              data: parsedData,
              error: null
            }
          } catch (parseError) {
            results.steps.parsing = {
              success: false,
              data: null,
              error: parseError instanceof Error ? parseError.message : '解析失败'
            }
          }
        }

      } catch (error) {
        results.steps.recognition = {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : '语音识别失败'
        }
      }

    } else if (testType === 'text') {
      // 测试纯文本解析
      try {
        const parsedData = await competitorAnalysisAI.parseRawText(testData)
        results.steps.parsing = {
          success: parsedData.confidence > 0,
          data: parsedData,
          error: null
        }
        
        // 文本解析不需要识别步骤
        results.steps.recognition = {
          success: true,
          data: { text: testData, confidence: 1.0, word_count: testData.length },
          error: null
        }

      } catch (error) {
        results.steps.parsing = {
          success: false,
          data: null,
          error: error instanceof Error ? error.message : '文本解析失败'
        }
      }

    } else {
      return NextResponse.json({
        success: false,
        error: '不支持的测试类型，支持: ocr, speech, text'
      }, { status: 400 })
    }

    // 计算整体成功状态
    results.overall_success = results.steps.recognition.success && 
                             (results.steps.parsing.success || testType === 'ocr' || testType === 'speech')

    return NextResponse.json({
      success: true,
      data: results
    })

  } catch (error) {
    console.error('Recognition test error:', error)
    return NextResponse.json({
      success: false,
      error: '识别测试失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
