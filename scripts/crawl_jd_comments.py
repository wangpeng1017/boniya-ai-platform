#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
京东评论爬虫执行脚本
用于被Next.js API调用
"""

import sys
import json
import argparse
import os
from datetime import datetime

# 添加项目路径到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'crawlers'))

from jd_comment_spider import JDCommentSpider, analyze_sentiment, extract_keywords

def main():
    parser = argparse.ArgumentParser(description='京东评论爬虫')
    parser.add_argument('--product_id', required=True, help='京东商品ID')
    parser.add_argument('--max_pages', type=int, default=10, help='最大爬取页数')
    parser.add_argument('--days_limit', type=int, default=30, help='时间限制（天）')
    parser.add_argument('--task_id', type=int, help='任务ID')
    
    args = parser.parse_args()
    
    try:
        # 创建爬虫实例
        spider = JDCommentSpider()
        
        # 爬取评论
        comments = spider.get_comments(
            product_id=args.product_id,
            max_pages=args.max_pages,
            days_limit=args.days_limit
        )
        
        # 处理评论数据
        processed_comments = []
        for comment in comments:
            # 添加情感分析和关键词提取
            comment['sentiment'] = analyze_sentiment(comment['comment_content'])
            comment['keywords'] = extract_keywords(comment['comment_content'])
            processed_comments.append(comment)
        
        # 输出结果（JSON格式，供Node.js解析）
        result = {
            'success': True,
            'task_id': args.task_id,
            'product_id': args.product_id,
            'total_comments': len(processed_comments),
            'processed_comments': len(processed_comments),
            'comments': processed_comments,
            'crawl_time': datetime.now().isoformat()
        }
        
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # 输出错误信息
        error_result = {
            'success': False,
            'task_id': args.task_id,
            'product_id': args.product_id,
            'error': str(e),
            'crawl_time': datetime.now().isoformat()
        }
        
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == '__main__':
    main()
