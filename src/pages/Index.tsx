import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Post {
  id: number;
  author: string;
  factory: string;
  content: string;
  likes: number;
  achievement?: string;
  timestamp: string;
}

interface UserProfile {
  name: string;
  factory: string;
  position: string;
  badges: string[];
  achievements: number;
  records: string[];
}

const API_URL = 'https://functions.poehali.dev/3562d4ac-7bb4-43b4-a019-d8eaaa7f34d4';
const AUTH_URL = 'https://functions.poehali.dev/af500d4d-f6bc-4514-9a77-d19498d7d575';

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState<{[key: number]: boolean}>({});
  const [postComments, setPostComments] = useState<{[key: number]: any[]}>({});
  const [newComment, setNewComment] = useState<{[key: number]: string}>({});
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    factory: '',
    position: '',
    badges: [],
    achievements: 0,
    records: []
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('sovietUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      loadPosts();
      loadProfile(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('sovietUser', JSON.stringify(data.user));
        loadPosts();
        loadProfile(data.user.id);
      } else {
        setLoginError(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      setLoginError('Ошибка соединения с сервером');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('sovietUser');
    setLoginForm({ username: '', password: '' });
  };

  const loadPosts = async () => {
    try {
      const response = await fetch(`${API_URL}?action=posts`);
      const data = await response.json();
      setPosts(data.posts || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      setLoading(false);
    }
  };

  const loadProfile = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=profile&userId=${userId}`);
      const data = await response.json();
      setProfile({
        name: data.user.display_name,
        factory: data.user.factory,
        position: data.user.position,
        badges: data.badges || [],
        achievements: data.user.achievements_count,
        records: data.records || []
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}?action=create_post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: newPostContent
        })
      });
      
      if (response.ok) {
        setNewPostContent('');
        loadPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=toggle_like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id
        })
      });
      
      if (response.ok) {
        loadPosts();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=comments&postId=${postId}`);
      const data = await response.json();
      setPostComments(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleToggleComments = (postId: number) => {
    const isVisible = !commentsVisible[postId];
    setCommentsVisible(prev => ({ ...prev, [postId]: isVisible }));
    if (isVisible && !postComments[postId]) {
      loadComments(postId);
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = newComment[postId]?.trim();
    if (!content) return;
    
    try {
      const response = await fetch(`${API_URL}?action=add_comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
          content
        })
      });
      
      if (response.ok) {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        loadComments(postId);
        loadPosts();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const factories = [
    { name: 'Северсталь', score: 9845, position: 1 },
    { name: 'Камаз', score: 9723, position: 2 },
    { name: 'Уралмаш', score: 9651, position: 3 },
    { name: 'Норильский никель', score: 9502, position: 4 }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen star-pattern flex items-center justify-center">
        <Card className="propaganda-card p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 soviet-badge rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              ⭐
            </div>
            <h1 className="text-4xl font-bold mb-2 text-primary">ТОВАРИЩ.СУ</h1>
            <p className="text-lg font-medium">Социальная сеть трудящихся СССР</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-bold mb-2">ЛОГИН ТОВАРИЩА</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 border-2 border-primary rounded-md font-medium"
                placeholder="Введите логин"
                required
              />
            </div>
            
            <div>
              <label className="block font-bold mb-2">ПАРОЛЬ</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-primary rounded-md font-medium"
                placeholder="Введите пароль"
                required
              />
            </div>
            
            {loginError && (
              <div className="p-3 bg-destructive/10 border-2 border-destructive rounded-md">
                <p className="text-destructive font-medium text-center">{loginError}</p>
              </div>
            )}
            
            <Button type="submit" className="w-full soviet-badge text-foreground font-bold py-3 text-lg">
              ВОЙТИ В СОЦСЕТЬ
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-accent text-accent-foreground rounded-lg text-center">
            <p className="text-sm font-medium">Вход только для членов трудовых коллективов</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen star-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⭐</div>
          <p className="text-xl font-bold">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen star-pattern">
      {/* Header */}
      <header className="soviet-border bg-primary text-primary-foreground py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 soviet-badge rounded-full flex items-center justify-center text-2xl">
                ⭐
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-wider">ТОВАРИЩ.СУ</h1>
                <p className="text-sm opacity-90">Социальная сеть трудящихся СССР</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-bold mr-2">{currentUser?.display_name}</span>
              <Button variant="outline" size="sm" className="border-2 border-secondary font-bold" onClick={handleLogout}>
                <Icon name="LogOut" size={18} className="mr-1" />
                Выход
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-12 bg-card border-2 border-primary">
            <TabsTrigger value="feed" className="font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📰 ЛЕНТА
            </TabsTrigger>
            <TabsTrigger value="profile" className="font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              👤 ПРОФИЛЬ
            </TabsTrigger>
            <TabsTrigger value="competition" className="font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🏆 СОРЕВНОВАНИЕ
            </TabsTrigger>
            <TabsTrigger value="gallery" className="font-bold text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🎨 ГАЛЕРЕЯ
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            <Card className="propaganda-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-2xl">
                    {currentUser?.avatar_emoji}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Поделись трудовым достижением, товарищ!" 
                    className="w-full px-4 py-3 border-2 border-primary rounded-md font-medium resize-none"
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="soviet-badge text-foreground font-bold px-6"
                >
                  Опубликовать
                </Button>
              </div>
            </Card>

            {posts.map(post => (
              <Card key={post.id} className="propaganda-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold text-2xl">
                      {(post as any).avatarEmoji || '⭐'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{post.author}</h3>
                      {post.achievement && (
                        <Badge className="soviet-badge text-foreground border-0">
                          ⭐ {post.achievement}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {post.factory} • {post.timestamp}
                    </p>
                    <p className="text-base mb-4 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-medium border-2"
                        onClick={() => handleToggleLike(post.id)}
                      >
                        <Icon name="ThumbsUp" size={16} className="mr-2" />
                        {post.likes}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-medium border-2"
                        onClick={() => handleToggleComments(post.id)}
                      >
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        {(post as any).commentsCount || 0}
                      </Button>
                    </div>
                    
                    {commentsVisible[post.id] && (
                      <div className="mt-4 space-y-3">
                        <div className="border-t-2 border-primary pt-4">
                          {postComments[post.id]?.map((comment: any) => (
                            <div key={comment.id} className="flex gap-3 mb-3 p-3 bg-card rounded-lg">
                              <div className="text-xl">{comment.avatarEmoji}</div>
                              <div className="flex-1">
                                <p className="font-bold text-sm">{comment.author}</p>
                                <p className="text-sm">{comment.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">{comment.timestamp}</p>
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex gap-2 mt-3">
                            <input
                              type="text"
                              value={newComment[post.id] || ''}
                              onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Написать комментарий..."
                              className="flex-1 px-3 py-2 border-2 border-primary rounded-md text-sm"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleAddComment(post.id)}
                              className="soviet-badge text-foreground font-bold"
                            >
                              Отправить
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="propaganda-card p-6 md:col-span-1">
                <div className="text-center mb-6">
                  <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-5xl font-bold">
                      {currentUser?.avatar_emoji}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                  <p className="text-muted-foreground font-medium">{profile.position}</p>
                  <p className="text-sm text-accent font-bold mt-1">{profile.factory}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-card rounded-lg border-2 border-secondary">
                    <span className="font-medium">Достижений</span>
                    <span className="text-2xl font-bold text-primary">{profile.achievements}</span>
                  </div>
                  <Button className="w-full soviet-badge text-foreground font-bold">
                    Редактировать профиль
                  </Button>
                </div>
              </Card>

              <Card className="propaganda-card p-6 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-3xl">🏅</span>
                  ТРУДОВЫЕ ЗНАЧКИ
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {profile.badges.map((badge, i) => (
                    <div key={i} className="soviet-badge p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">⭐</div>
                      <p className="font-bold text-foreground">{badge}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-3xl">📊</span>
                  ТРУДОВЫЕ РЕКОРДЫ
                </h3>
                <div className="space-y-3">
                  {profile.records.map((record, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border-2 border-accent">
                      <Icon name="Award" size={24} className="text-accent" />
                      <p className="font-medium">{record}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Competition Tab */}
          <TabsContent value="competition">
            <Card className="propaganda-card p-6">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-primary mb-2">ДОСКА ПОЧЁТА</h2>
                <p className="text-lg font-medium">Всесоюзное социалистическое соревнование 2026</p>
              </div>

              <div className="space-y-4">
                {factories.map((factory) => (
                  <div 
                    key={factory.position}
                    className={`flex items-center gap-4 p-5 rounded-lg border-3 ${
                      factory.position === 1 ? 'soviet-badge' : 'bg-card border-2 border-primary'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold border-2 ${
                      factory.position === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {factory.position}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{factory.name}</h3>
                      <p className="text-sm text-muted-foreground font-medium">Производственное объединение</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">{factory.score}</p>
                      <p className="text-sm text-muted-foreground font-medium">баллов</p>
                    </div>
                    {factory.position === 1 && (
                      <div className="text-5xl animate-pulse">
                        🏆
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-accent text-accent-foreground rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-2">ВПЕРЁД К ПОБЕДЕ КОММУНИЗМА!</h3>
                <p className="font-medium">Труд на благо народа — честь и доблесть советского человека</p>
              </div>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="propaganda-card p-0 overflow-hidden">
                <div className="h-64 bg-primary flex items-center justify-center">
                  <div className="text-center text-primary-foreground p-8">
                    <div className="text-6xl mb-4">⭐</div>
                    <h3 className="text-3xl font-bold mb-2">СЛАВА ТРУДУ!</h3>
                    <p className="text-xl">Построим светлое будущее</p>
                  </div>
                </div>
              </Card>

              <Card className="propaganda-card p-0 overflow-hidden">
                <div className="h-64 bg-accent flex items-center justify-center">
                  <div className="text-center text-accent-foreground p-8">
                    <div className="text-6xl mb-4">🏭</div>
                    <h3 className="text-3xl font-bold mb-2">ПЯТИЛЕТКУ — В ТРИ ГОДА!</h3>
                    <p className="text-xl">Перевыполним план</p>
                  </div>
                </div>
              </Card>

              <Card className="propaganda-card p-0 overflow-hidden">
                <div className="h-64 soviet-badge flex items-center justify-center">
                  <div className="text-center text-foreground p-8">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-3xl font-bold mb-2">К ЗВЁЗДАМ!</h3>
                    <p className="text-xl">Космос — наш дом</p>
                  </div>
                </div>
              </Card>

              <Card className="propaganda-card p-0 overflow-hidden">
                <div className="h-64 bg-secondary flex items-center justify-center">
                  <div className="text-center text-secondary-foreground p-8">
                    <div className="text-6xl mb-4">⚙️</div>
                    <h3 className="text-3xl font-bold mb-2">УДАРНИК ТРУДА</h3>
                    <p className="text-xl">Образец для подражания</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;