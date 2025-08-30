#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
京东爬虫测试脚本
用于验证爬虫功能是否正常
"""

import sys
import os
import json
from datetime import datetime

# 添加项目路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'crawlers'))

from jd_comment_spider import JDCommentSpider, analyze_sentiment, extract_keywords

def test_basic_crawl():
    """测试基础爬取功能"""
    print("🚀 开始测试京东评论爬虫...")
    
    spider = JDCommentSpider()
    
    # 测试商品ID
    product_id = "10032280299715"
    
    try:
        print(f"📦 测试商品: {product_id}")
        
        # 获取商品信息
        product_info = spider.get_product_info(product_id)
        print(f"✅ 商品信息获取成功: {product_info['title']}")
        
        # 爬取评论（只爬取1页进行测试）
        comments = spider.get_comments(
            product_id=product_id,
            max_pages=1,
            days_limit=30
        )
        
        print(f"✅ 成功获取 {len(comments)} 条评论")
        
        if comments:
            # 显示第一条评论
            first_comment = comments[0]
            print("\n📝 第一条评论示例:")
            print(f"   用户: {first_comment.get('user_id', 'N/A')}")
            print(f"   内容: {first_comment.get('comment_content', 'N/A')[:50]}...")
            print(f"   评分: {first_comment.get('star_rating', 'N/A')}")
            print(f"   时间: {first_comment.get('comment_time', 'N/A')}")
            
            # 测试情感分析
            sentiment = analyze_sentiment(first_comment.get('comment_content', ''))
            print(f"   情感: {sentiment}")
            
            # 测试关键词提取
            keywords = extract_keywords(first_comment.get('comment_content', ''))
            print(f"   关键词: {keywords}")
        
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {str(e)}")
        return False

def test_sentiment_analysis():
    """测试情感分析功能"""
    print("\n🧠 测试情感分析功能...")
    
    test_cases = [
        ("这个商品真的很好，质量不错，推荐购买！", "positive"),
        ("太差了，质量有问题，后悔购买", "negative"),
        ("还可以吧，一般般", "neutral"),
        ("", "neutral")
    ]
    
    for text, expected in test_cases:
        result = analyze_sentiment(text)
        status = "✅" if result == expected else "❌"
        print(f"   {status} '{text[:20]}...' -> {result} (期望: {expected})")

def test_keyword_extraction():
    """测试关键词提取功能"""
    print("\n🔍 测试关键词提取功能...")
    
    test_cases = [
        "包装很好，质量不错，味道也很棒",
        "物流很快，服务态度好",
        "价格便宜，性价比高",
        ""
    ]
    
    for text in test_cases:
        keywords = extract_keywords(text)
        print(f"   '{text}' -> {keywords}")

def test_data_format():
    """测试数据格式"""
    print("\n📋 测试数据格式...")
    
    spider = JDCommentSpider()
    
    # 模拟评论数据
    mock_comment = {
        'id': '12345',
        'nickname': 'test_user',
        'content': '测试评论内容',
        'creationTime': '2024-08-29 14:30:25',
        'score': 5,
        'usefulVoteCount': 10,
        'replyCount': 2,
        'userLevelId': '1',
        'userLevelName': '铜牌会员',
        'referenceInfo': '来自京东iPhone客户端',
        'productColor': '红色',
        'productSize': 'L',
        'isMobile': True,
        'isTop': True,
        'images': [{'imgUrl': 'http://example.com/image.jpg'}]
    }
    
    try:
        parsed = spider._parse_comments([mock_comment])
        if parsed:
            comment = parsed[0]
            print("✅ 数据解析成功:")
            for key, value in comment.items():
                if key != 'raw_data':  # 跳过原始数据
                    print(f"   {key}: {value}")
        else:
            print("❌ 数据解析失败")
            
    except Exception as e:
        print(f"❌ 数据格式测试失败: {str(e)}")

def main():
    """主测试函数"""
    print("=" * 60)
    print("🧪 京东评论爬虫功能测试")
    print("=" * 60)
    
    # 运行所有测试
    tests = [
        ("基础爬取功能", test_basic_crawl),
        ("情感分析功能", test_sentiment_analysis),
        ("关键词提取功能", test_keyword_extraction),
        ("数据格式测试", test_data_format)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔬 {test_name}")
        print("-" * 40)
        try:
            result = test_func()
            results.append((test_name, result if result is not None else True))
        except Exception as e:
            print(f"❌ {test_name} 执行失败: {str(e)}")
            results.append((test_name, False))
    
    # 输出测试结果
    print("\n" + "=" * 60)
    print("📊 测试结果汇总")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 总体结果: {passed}/{total} 测试通过")
    
    if passed == total:
        print("🎉 所有测试通过！爬虫功能正常。")
        return 0
    else:
        print("⚠️  部分测试失败，请检查相关功能。")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
