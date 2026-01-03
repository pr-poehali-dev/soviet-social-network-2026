import { useState } from 'react';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('feed');
  
  const profile: UserProfile = {
    name: 'Иванов Владимир',
    factory: 'ПАО "Северсталь"',
    position: 'Мастер смены',
    badges: ['Ударник труда', 'Победитель соревнования', 'Новатор'],
    achievements: 12,
    records: ['Перевыполнение плана на 150%', 'Лучший по профессии 2025']
  };

  const posts: Post[] = [
    {
      id: 1,
      author: 'Петрова Анна',
      factory: 'Камаз',
      content: 'Наш цех перевыполнил квартальный план на 135%! Слава труду! 🏭',
      likes: 234,
      achievement: 'Ударник труда',
      timestamp: '2 часа назад'
    },
    {
      id: 2,
      author: 'Сидоров Игорь',
      factory: 'Уралмаш',
      content: 'Новая линия по производству турбин запущена досрочно. Вперёд к новым высотам!',
      likes: 189,
      timestamp: '5 часов назад'
    },
    {
      id: 3,
      author: 'Козлова Мария',
      factory: 'Норильский никель',
      content: 'Завершили реконструкцию второго цеха. Производительность выросла на 40%! 💪',
      likes: 312,
      achievement: 'Новатор производства',
      timestamp: '8 часов назад'
    }
  ];

  const factories = [
    { name: 'Северсталь', score: 9845, position: 1 },
    { name: 'Камаз', score: 9723, position: 2 },
    { name: 'Уралмаш', score: 9651, position: 3 },
    { name: 'Норильский никель', score: 9502, position: 4 }
  ];

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
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="font-bold">
                <Icon name="Bell" size={18} className="mr-1" />
                Уведомления
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-secondary font-bold">
                <Icon name="User" size={18} className="mr-1" />
                Профиль
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
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">ВИ</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Поделись трудовым достижением, товарищ!" 
                    className="w-full px-4 py-3 border-2 border-primary rounded-md font-medium"
                  />
                </div>
                <Button className="soviet-badge text-foreground font-bold px-6">
                  Опубликовать
                </Button>
              </div>
            </Card>

            {posts.map(post => (
              <Card key={post.id} className="propaganda-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                      {post.author.split(' ').map(n => n[0]).join('')}
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
                      <Button variant="outline" size="sm" className="font-medium border-2">
                        <Icon name="ThumbsUp" size={16} className="mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="outline" size="sm" className="font-medium border-2">
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        Комментарии
                      </Button>
                      <Button variant="outline" size="sm" className="font-medium border-2">
                        <Icon name="Share2" size={16} className="mr-2" />
                        Поделиться
                      </Button>
                    </div>
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
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-4xl font-bold">
                      ВИ
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