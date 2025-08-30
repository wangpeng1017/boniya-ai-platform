#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
京东评论爬虫模块
基于JDComment_Spider项目，适配波尼亚AI平台
"""

import requests
import json
import time
import random
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from fake_useragent import UserAgent
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JDCommentSpider:
    """京东评论爬虫类"""
    
    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.base_url = "https://club.jd.com/comment/productPageComments.action"
        self.headers = {
            'User-Agent': self.ua.random,
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://item.jd.com/',
            'X-Requested-With': 'XMLHttpRequest'
        }
        self.session.headers.update(self.headers)
        
        # 请求间隔控制（秒）
        self.min_delay = 1
        self.max_delay = 3
        
    def get_comments(self, product_id: str, max_pages: int = 10, days_limit: int = 30) -> List[Dict]:
        """
        获取商品评论数据
        
        Args:
            product_id: 京东商品ID
            max_pages: 最大爬取页数
            days_limit: 只获取最近N天的评论
            
        Returns:
            评论数据列表
        """
        comments = []
        cutoff_date = datetime.now() - timedelta(days=days_limit)
        
        logger.info(f"开始爬取商品 {product_id} 的评论，最大页数: {max_pages}，时间限制: {days_limit}天")
        
        for page in range(1, max_pages + 1):
            try:
                page_comments = self._get_page_comments(product_id, page)
                
                if not page_comments:
                    logger.info(f"第 {page} 页没有评论数据，停止爬取")
                    break
                
                # 检查评论时间，如果超出时间限制则停止
                valid_comments = []
                for comment in page_comments:
                    comment_time = self._parse_comment_time(comment.get('creationTime', ''))
                    if comment_time and comment_time >= cutoff_date:
                        valid_comments.append(comment)
                    elif comment_time and comment_time < cutoff_date:
                        logger.info(f"评论时间 {comment_time} 超出限制，停止爬取")
                        return comments + valid_comments
                
                comments.extend(valid_comments)
                logger.info(f"第 {page} 页获取到 {len(valid_comments)} 条有效评论")
                
                # 随机延迟，避免被反爬
                delay = random.uniform(self.min_delay, self.max_delay)
                time.sleep(delay)
                
            except Exception as e:
                logger.error(f"爬取第 {page} 页时出错: {str(e)}")
                continue
        
        logger.info(f"总共获取到 {len(comments)} 条评论")
        return comments
    
    def _get_page_comments(self, product_id: str, page: int) -> List[Dict]:
        """获取单页评论数据"""
        params = {
            'callback': f'fetchJSON_comment98vv{random.randint(1000, 9999)}',
            'productId': product_id,
            'score': 0,  # 0=全部, 1=差评, 2=中评, 3=好评
            'sortType': 5,  # 5=推荐排序, 6=时间排序
            'page': page - 1,  # 京东页码从0开始
            'pageSize': 10,
            'isShadowSku': 0,
            'fold': 1
        }
        
        try:
            # 更新User-Agent
            self.session.headers['User-Agent'] = self.ua.random
            
            response = self.session.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()
            
            # 解析JSONP响应
            content = response.text
            json_start = content.find('(') + 1
            json_end = content.rfind(')')
            json_str = content[json_start:json_end]
            
            data = json.loads(json_str)
            
            if 'comments' in data:
                return self._parse_comments(data['comments'])
            else:
                logger.warning(f"第 {page} 页响应中没有评论数据")
                return []
                
        except requests.RequestException as e:
            logger.error(f"请求第 {page} 页失败: {str(e)}")
            return []
        except json.JSONDecodeError as e:
            logger.error(f"解析第 {page} 页JSON失败: {str(e)}")
            return []
    
    def _parse_comments(self, raw_comments: List[Dict]) -> List[Dict]:
        """解析评论数据"""
        parsed_comments = []
        
        for comment in raw_comments:
            try:
                parsed_comment = {
                    'comment_id': comment.get('id', ''),
                    'user_id': comment.get('nickname', ''),
                    'comment_content': comment.get('content', ''),
                    'comment_time': comment.get('creationTime', ''),
                    'star_rating': comment.get('score', 0),
                    'useful_vote_count': comment.get('usefulVoteCount', 0),
                    'reply_count': comment.get('replyCount', 0),
                    'user_level': comment.get('userLevelId', ''),
                    'user_level_name': comment.get('userLevelName', ''),
                    'phone_model': comment.get('referenceInfo', ''),
                    'product_color': comment.get('productColor', ''),
                    'product_size': comment.get('productSize', ''),
                    'is_mobile': comment.get('isMobile', False),
                    'is_purchased': comment.get('isTop', True),
                    # 图片信息
                    'images': [img.get('imgUrl', '') for img in comment.get('images', [])],
                    # 原始数据（用于调试）
                    'raw_data': comment
                }
                
                # 清理和验证数据
                parsed_comment = self._clean_comment_data(parsed_comment)
                parsed_comments.append(parsed_comment)
                
            except Exception as e:
                logger.error(f"解析评论数据失败: {str(e)}")
                continue
        
        return parsed_comments
    
    def _clean_comment_data(self, comment: Dict) -> Dict:
        """清理和验证评论数据"""
        # 清理评论内容
        if comment['comment_content']:
            comment['comment_content'] = re.sub(r'<[^>]+>', '', comment['comment_content'])
            comment['comment_content'] = comment['comment_content'].strip()
        
        # 验证星级评分
        if not isinstance(comment['star_rating'], int) or comment['star_rating'] < 1:
            comment['star_rating'] = 5  # 默认好评
        
        # 清理手机型号信息
        if comment['phone_model']:
            comment['phone_model'] = comment['phone_model'].replace('来自京东', '').strip()
        
        return comment
    
    def _parse_comment_time(self, time_str: str) -> Optional[datetime]:
        """解析评论时间"""
        if not time_str:
            return None
        
        try:
            # 京东时间格式: "2024-08-29 14:30:25"
            return datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            try:
                # 尝试其他格式
                return datetime.strptime(time_str, "%Y-%m-%d")
            except ValueError:
                logger.warning(f"无法解析时间格式: {time_str}")
                return None
    
    def get_product_info(self, product_id: str) -> Dict:
        """获取商品基本信息"""
        try:
            # 商品详情页URL
            product_url = f"https://item.jd.com/{product_id}.html"
            
            response = self.session.get(product_url, timeout=10)
            response.raise_for_status()
            
            # 这里可以解析商品标题、价格等基本信息
            # 简化实现，返回基本结构
            return {
                'product_id': product_id,
                'product_url': product_url,
                'title': f'商品{product_id}',  # 实际应该从页面解析
                'price': 0.0,  # 实际应该从API获取
                'status': 'active'
            }
            
        except Exception as e:
            logger.error(f"获取商品信息失败: {str(e)}")
            return {
                'product_id': product_id,
                'product_url': f"https://item.jd.com/{product_id}.html",
                'title': f'商品{product_id}',
                'price': 0.0,
                'status': 'unknown'
            }

# 简单的情感分析函数
def analyze_sentiment(text: str) -> str:
    """简单的情感分析"""
    if not text:
        return 'neutral'
    
    positive_words = ['好', '棒', '赞', '满意', '喜欢', '推荐', '优秀', '完美', '不错']
    negative_words = ['差', '坏', '烂', '垃圾', '失望', '后悔', '问题', '投诉', '退货']
    
    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

def extract_keywords(text: str) -> List[str]:
    """简单的关键词提取"""
    if not text:
        return []
    
    # 简单的关键词列表
    keywords = ['包装', '质量', '味道', '价格', '物流', '服务', '新鲜', '好吃', '满意', '推荐']
    
    found_keywords = []
    for keyword in keywords:
        if keyword in text:
            found_keywords.append(keyword)
    
    return found_keywords

if __name__ == "__main__":
    # 测试代码
    spider = JDCommentSpider()
    comments = spider.get_comments("10032280299715", max_pages=2, days_limit=30)
    
    for comment in comments[:3]:  # 显示前3条评论
        print(f"用户: {comment['user_id']}")
        print(f"内容: {comment['comment_content']}")
        print(f"评分: {comment['star_rating']}")
        print(f"时间: {comment['comment_time']}")
        print("-" * 50)
