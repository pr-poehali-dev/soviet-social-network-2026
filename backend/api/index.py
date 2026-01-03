import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """API для работы с постами, лайками, комментариями советской соцсети"""
    
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    params = event.get('queryStringParameters') or {}
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        action = params.get('action', '')
        
        # Получить все посты
        if method == 'GET' and action == 'posts':
            cur.execute("""
                SELECT p.*, u.display_name, u.factory, u.avatar_emoji
                FROM posts p
                JOIN users u ON p.user_id = u.id
                ORDER BY p.created_at DESC
            """)
            posts = cur.fetchall()
            
            result = []
            for post in posts:
                result.append({
                    'id': post['id'],
                    'author': post['display_name'],
                    'factory': post['factory'],
                    'content': post['content'],
                    'achievement': post['achievement_badge'],
                    'likes': post['likes_count'],
                    'commentsCount': post['comments_count'],
                    'timestamp': format_timestamp(post['created_at']),
                    'avatarEmoji': post['avatar_emoji']
                })
            
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'posts': result}),
                'isBase64Encoded': False
            }
        
        # Получить профиль пользователя
        elif method == 'GET' and action == 'profile':
            user_id = params.get('userId')
            if not user_id:
                raise ValueError('userId is required')
            
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            cur.execute("SELECT badge_name FROM user_badges WHERE user_id = %s", (user_id,))
            badges = [row['badge_name'] for row in cur.fetchall()]
            
            cur.execute("SELECT record_text FROM user_records WHERE user_id = %s", (user_id,))
            records = [row['record_text'] for row in cur.fetchall()]
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'badges': badges,
                    'records': records
                }),
                'isBase64Encoded': False
            }
        
        # Создать новый пост
        elif method == 'POST' and action == 'create_post':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('userId')
            content = body.get('content', '').strip()
            achievement = body.get('achievement')
            
            if not user_id or not content:
                raise ValueError('userId and content are required')
            
            cur.execute(
                "INSERT INTO posts (user_id, content, achievement_badge) VALUES (%s, %s, %s) RETURNING id",
                (user_id, content, achievement)
            )
            post_id = cur.fetchone()['id']
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'postId': post_id}),
                'isBase64Encoded': False
            }
        
        # Поставить/убрать лайк
        elif method == 'POST' and action == 'toggle_like':
            body = json.loads(event.get('body', '{}'))
            post_id = body.get('postId')
            user_id = body.get('userId')
            
            if not post_id or not user_id:
                raise ValueError('postId and userId are required')
            
            cur.execute("SELECT id FROM likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
            existing_like = cur.fetchone()
            
            if existing_like:
                cur.execute("DELETE FROM likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
                cur.execute("UPDATE posts SET likes_count = likes_count - 1 WHERE id = %s", (post_id,))
                liked = False
            else:
                cur.execute("INSERT INTO likes (post_id, user_id) VALUES (%s, %s)", (post_id, user_id))
                cur.execute("UPDATE posts SET likes_count = likes_count + 1 WHERE id = %s", (post_id,))
                liked = True
            
            cur.execute("SELECT likes_count FROM posts WHERE id = %s", (post_id,))
            likes_count = cur.fetchone()['likes_count']
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'liked': liked, 'likesCount': likes_count}),
                'isBase64Encoded': False
            }
        
        # Добавить комментарий
        elif method == 'POST' and action == 'add_comment':
            body = json.loads(event.get('body', '{}'))
            post_id = body.get('postId')
            user_id = body.get('userId')
            content = body.get('content', '').strip()
            
            if not post_id or not user_id or not content:
                raise ValueError('postId, userId and content are required')
            
            cur.execute(
                "INSERT INTO comments (post_id, user_id, content) VALUES (%s, %s, %s) RETURNING id",
                (post_id, user_id, content)
            )
            comment_id = cur.fetchone()['id']
            
            cur.execute("UPDATE posts SET comments_count = comments_count + 1 WHERE id = %s", (post_id,))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'commentId': comment_id}),
                'isBase64Encoded': False
            }
        
        # Получить комментарии поста
        elif method == 'GET' and action == 'comments':
            post_id = params.get('postId')
            if not post_id:
                raise ValueError('postId is required')
            
            cur.execute("""
                SELECT c.*, u.display_name, u.avatar_emoji
                FROM comments c
                JOIN users u ON c.user_id = u.id
                WHERE c.post_id = %s
                ORDER BY c.created_at ASC
            """, (post_id,))
            comments = cur.fetchall()
            
            result = []
            for comment in comments:
                result.append({
                    'id': comment['id'],
                    'author': comment['display_name'],
                    'content': comment['content'],
                    'timestamp': format_timestamp(comment['created_at']),
                    'avatarEmoji': comment['avatar_emoji']
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'comments': result}),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def format_timestamp(dt):
    """Форматирование времени в человекочитаемый вид"""
    if not dt:
        return ''
    
    now = datetime.now()
    diff = now - dt
    
    if diff.days > 0:
        if diff.days == 1:
            return '1 день назад'
        elif diff.days < 7:
            return f'{diff.days} дня назад' if diff.days < 5 else f'{diff.days} дней назад'
        else:
            return dt.strftime('%d.%m.%Y')
    
    hours = diff.seconds // 3600
    if hours > 0:
        if hours == 1:
            return '1 час назад'
        elif hours < 5:
            return f'{hours} часа назад'
        else:
            return f'{hours} часов назад'
    
    minutes = diff.seconds // 60
    if minutes > 0:
        if minutes == 1:
            return '1 минуту назад'
        elif minutes < 5:
            return f'{minutes} минуты назад'
        else:
            return f'{minutes} минут назад'
    
    return 'только что'
