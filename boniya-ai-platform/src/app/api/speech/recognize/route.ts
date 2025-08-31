import { NextRequest, NextResponse } from 'next/server'
import { BaiduSpeechRecognition } from '@/lib/speech/speech-recognition'
import { competitorAnalysisAI } from '@/lib/ai/competitor-analysis-ai'

// 语音识别API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audio = formData.get('audio') as File
    const autoParsePrice = formData.get('autoParsePrice') === 'true'
    const format = formData.get('format') as string || 'wav'
    const rate = parseInt(formData.get('rate') as string || '16000')

    if (!audio) {
      return NextResponse.json({
        success: false,
        error: '请上传音频文件'
      }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/amr']
    if (!allowedTypes.includes(audio.type)) {
      return NextResponse.json({
        success: false,
        error: '不支持的音频格式，请上传 WAV、MP3、M4A 或 AMR 格式的音频'
      }, { status: 400 })
    }

    // 验证文件大小 (最大10MB)
    if (audio.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: '音频文件过大，请上传小于10MB的音频'
      }, { status: 400 })
    }

    // 将音频转换为base64
    const arrayBuffer = await audio.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const audioBase64 = `data:${audio.type};base64,${base64}`

    // 确定音频格式
    let audioFormat: 'wav' | 'pcm' | 'amr' | 'm4a' = 'wav'
    if (audio.type.includes('m4a') || audio.type.includes('mp4')) {
      audioFormat = 'm4a'
    } else if (audio.type.includes('amr')) {
      audioFormat = 'amr'
    } else if (audio.type.includes('wav')) {
      audioFormat = 'wav'
    }

    // 执行语音识别
    const speechService = new BaiduSpeechRecognition()
    const speechResult = await speechService.recognizeSpeech(
      audioBase64,
      audioFormat,
      rate as 8000 | 16000
    )

    if (!speechResult.success) {
      return NextResponse.json({
        success: false,
        error: speechResult.error || '语音识别失败'
      }, { status: 500 })
    }

    // 如果需要自动解析价格信息
    let parsedData = null
    if (autoParsePrice && speechResult.text) {
      try {
        parsedData = await competitorAnalysisAI.parseRawText(speechResult.text)
      } catch (parseError) {
        console.error('价格信息解析失败:', parseError)
        // 解析失败不影响语音识别结果返回
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        speech_result: {
          text: speechResult.text,
          confidence: speechResult.confidence,
          word_count: speechResult.text.split(/\s+/).length
        },
        parsed_data: parsedData,
        processing_info: {
          audio_size: audio.size,
          audio_type: audio.type,
          audio_format: audioFormat,
          sample_rate: rate,
          auto_parsed: autoParsePrice && parsedData !== null
        }
      }
    })

  } catch (error) {
    console.error('语音识别API错误:', error)
    return NextResponse.json({
      success: false,
      error: '语音识别服务暂时不可用，请稍后重试'
    }, { status: 500 })
  }
}

// 获取语音识别服务状态
export async function GET() {
  try {
    const speechService = new BaiduSpeechRecognition()
    const status = await speechService.checkStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        service_status: status,
        supported_formats: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/amr'],
        max_file_size: '10MB',
        sample_rates: [8000, 16000],
        features: [
          {
            name: '实时语音识别',
            description: '支持浏览器实时语音输入',
            available: true
          },
          {
            name: '音频文件识别',
            description: '支持上传音频文件进行识别',
            available: true
          },
          {
            name: '自动价格解析',
            description: '识别结果自动解析为结构化价格信息',
            available: true
          }
        ]
      }
    })
  } catch (error) {
    console.error('获取语音识别服务状态失败:', error)
    return NextResponse.json({
      success: false,
      error: '无法获取语音识别服务状态'
    }, { status: 500 })
  }
}
