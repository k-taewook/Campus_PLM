import { useState } from 'react';
import { Settings as SettingsIcon, User, Shield, Bell, Palette, Database, Download, Upload, Keyboard, Monitor, Globe, Code, Zap, Sliders } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { useProjects } from '../contexts/ProjectContext';
import ActivityHistory from './ActivityHistory';

export default function Settings() {
  const { currentUser } = useProjects();
  const [activeTab, setActiveTab] = useState('profile');
  
  // 프로필 설정
  const [profileSettings, setProfileSettings] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: '',
    avatar: ''
  });

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    teamInvitations: true,
    documentChanges: false,
    fileUploads: true
  });

  // 시스템 설정
  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    language: 'ko',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD'
  });

  // 작업 환경 설정
  const [workspaceSettings, setWorkspaceSettings] = useState({
    autoSave: true,
    autoSaveInterval: 30,
    showKeyboardShortcuts: true,
    compactMode: false,
    enableAnimations: true,
    showMinimap: false,
    taskDefaultView: 'kanban',
    defaultTaskPriority: 'medium'
  });

  // 개발자 설정
  const [developerSettings, setDeveloperSettings] = useState({
    enableDebugMode: false,
    showAPILogs: false,
    enableBetaFeatures: false,
    customCSS: '',
    webhookURL: '',
    apiTimeout: 30
  });

  // 접근성 설정
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    reducedMotion: false,
    fontSize: 16,
    lineHeight: 1.5,
    focusVisible: true,
    screenReaderSupport: false
  });

  const handleProfileUpdate = () => {
    console.log('프로필 업데이트:', profileSettings);
    // 실제 환경에서는 API 호출
  };

  const handleNotificationUpdate = () => {
    console.log('알림 설정 업데이트:', notificationSettings);
    // 실제 환경에서는 API 호출
  };

  const handleSystemUpdate = () => {
    console.log('시스템 설정 업데이트:', systemSettings);
    // 실제 환경에서는 API 호출
  };

  const handleExportData = () => {
    console.log('데이터 내보내기 시작');
    // 실제 환경에서는 데이터 내보내기 로직
  };

  const handleImportData = () => {
    console.log('데이터 가져오기 시작');
    // 실제 환경에서는 데이터 가져오기 로직
  };

  if (!currentUser) {
    return (
      <div className="flex-1 p-8 bg-background">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-8 h-8 text-gray-600" />
        <div>
          <h1 className="mb-2">설정</h1>
          <p className="text-muted-foreground">
            시스템 및 개인 설정을 관리하세요
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex overflow-x-auto mb-8">
          <TabsList className="grid w-full grid-cols-8 min-w-max">
            <TabsTrigger value="profile" className="flex items-center gap-2 whitespace-nowrap">
              <User className="w-4 h-4" />
              프로필
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 whitespace-nowrap">
              <Bell className="w-4 h-4" />
              알림
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2 whitespace-nowrap">
              <Palette className="w-4 h-4" />
              테마
            </TabsTrigger>
            <TabsTrigger value="workspace" className="flex items-center gap-2 whitespace-nowrap">
              <Monitor className="w-4 h-4" />
              작업환경
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2 whitespace-nowrap">
              <Globe className="w-4 h-4" />
              접근성
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 whitespace-nowrap">
              <Shield className="w-4 h-4" />
              보안
            </TabsTrigger>
            <TabsTrigger value="developer" className="flex items-center gap-2 whitespace-nowrap">
              <Code className="w-4 h-4" />
              개발자
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2 whitespace-nowrap">
              <Database className="w-4 h-4" />
              데이터
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>프로필 설정</CardTitle>
              <CardDescription>
                개인 정보를 관리하고 업데이트하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">소개</Label>
                <Textarea
                  id="bio"
                  value={profileSettings.bio}
                  onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                  placeholder="간단한 자기소개를 작성하세요"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  {currentUser?.role || 'member'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  가입일: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '알 수 없음'}
                </span>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileUpdate}>
                  프로필 업데이트
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                받고 싶은 알림을 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">이메일 알림</Label>
                    <p className="text-sm text-muted-foreground">이메일로 알림을 받습니다</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, emailNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="projectUpdates">프로젝트 업데이트</Label>
                    <p className="text-sm text-muted-foreground">프로젝트 상태 변경 시 알림</p>
                  </div>
                  <Switch
                    id="projectUpdates"
                    checked={notificationSettings.projectUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, projectUpdates: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="teamInvitations">팀 초대</Label>
                    <p className="text-sm text-muted-foreground">팀 초대 시 알림</p>
                  </div>
                  <Switch
                    id="teamInvitations"
                    checked={notificationSettings.teamInvitations}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, teamInvitations: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="documentChanges">문서 변경</Label>
                    <p className="text-sm text-muted-foreground">문서 수정 시 알림</p>
                  </div>
                  <Switch
                    id="documentChanges"
                    checked={notificationSettings.documentChanges}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, documentChanges: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="fileUploads">파일 업로드</Label>
                    <p className="text-sm text-muted-foreground">파일 업로드 시 알림</p>
                  </div>
                  <Switch
                    id="fileUploads"
                    checked={notificationSettings.fileUploads}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, fileUploads: checked})
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationUpdate}>
                  알림 설정 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>테마 및 표시 설정</CardTitle>
              <CardDescription>
                시스템의 외관과 언어를 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="theme">테마</Label>
                  <Select 
                    value={systemSettings.theme} 
                    onValueChange={(value) => setSystemSettings({...systemSettings, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트</SelectItem>
                      <SelectItem value="dark">다크</SelectItem>
                      <SelectItem value="system">시스템 설정 따라가기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">언어</Label>
                  <Select 
                    value={systemSettings.language} 
                    onValueChange={(value) => setSystemSettings({...systemSettings, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">시간대</Label>
                  <Select 
                    value={systemSettings.timezone} 
                    onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">한국 표준시</SelectItem>
                      <SelectItem value="Asia/Tokyo">일본 표준시</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">날짜 형식</Label>
                  <Select 
                    value={systemSettings.dateFormat} 
                    onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">2024-03-15</SelectItem>
                      <SelectItem value="MM/DD/YYYY">03/15/2024</SelectItem>
                      <SelectItem value="DD/MM/YYYY">15/03/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSystemUpdate}>
                  설정 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>보안 설정</CardTitle>
              <CardDescription>
                계정 보안을 관리하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>비밀번호 변경</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    정기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.
                  </p>
                  <Button variant="outline">
                    비밀번호 변경
                  </Button>
                </div>

                <div>
                  <Label>2단계 인증</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    추가 보안을 위해 2단계 인증을 설정하세요.
                  </p>
                  <Button variant="outline">
                    2단계 인증 설정
                  </Button>
                </div>

                <div>
                  <Label>로그인 세션</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    현재 활성화된 세션을 확인하고 관리하세요.
                  </p>
                  <Button variant="outline">
                    세션 관리
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>작업 환경 설정</CardTitle>
                <CardDescription>
                  개인의 작업 스타일에 맞게 환경을 설정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSave">자동 저장</Label>
                      <p className="text-sm text-muted-foreground">변경 사항을 자동으로 저장합니다</p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={workspaceSettings.autoSave}
                      onCheckedChange={(checked) => 
                        setWorkspaceSettings({...workspaceSettings, autoSave: checked})
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="autoSaveInterval">자동 저장 간격 (초)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[workspaceSettings.autoSaveInterval]}
                        onValueChange={(value) => 
                          setWorkspaceSettings({...workspaceSettings, autoSaveInterval: value[0]})
                        }
                        max={300}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>10초</span>
                        <span>{workspaceSettings.autoSaveInterval}초</span>
                        <span>5분</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showKeyboardShortcuts">키보드 단축키 표시</Label>
                      <p className="text-sm text-muted-foreground">메뉴에서 키보드 단축키를 표시합니다</p>
                    </div>
                    <Switch
                      id="showKeyboardShortcuts"
                      checked={workspaceSettings.showKeyboardShortcuts}
                      onCheckedChange={(checked) => 
                        setWorkspaceSettings({...workspaceSettings, showKeyboardShortcuts: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compactMode">컴팩트 모드</Label>
                      <p className="text-sm text-muted-foreground">인터페이스를 더 작게 표시합니다</p>
                    </div>
                    <Switch
                      id="compactMode"
                      checked={workspaceSettings.compactMode}
                      onCheckedChange={(checked) => 
                        setWorkspaceSettings({...workspaceSettings, compactMode: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableAnimations">애니메이션 효과</Label>
                      <p className="text-sm text-muted-foreground">전환 효과와 애니메이션을 활성화합니다</p>
                    </div>
                    <Switch
                      id="enableAnimations"
                      checked={workspaceSettings.enableAnimations}
                      onCheckedChange={(checked) => 
                        setWorkspaceSettings({...workspaceSettings, enableAnimations: checked})
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="taskDefaultView">기본 태스크 보기</Label>
                    <Select 
                      value={workspaceSettings.taskDefaultView} 
                      onValueChange={(value) => setWorkspaceSettings({...workspaceSettings, taskDefaultView: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kanban">칸반 보드</SelectItem>
                        <SelectItem value="list">리스트</SelectItem>
                        <SelectItem value="calendar">캘린더</SelectItem>
                        <SelectItem value="timeline">타임라인</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="defaultTaskPriority">기본 태스크 우선순위</Label>
                    <Select 
                      value={workspaceSettings.defaultTaskPriority} 
                      onValueChange={(value) => setWorkspaceSettings({...workspaceSettings, defaultTaskPriority: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                        <SelectItem value="urgent">긴급</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => console.log('작업환경 설정 저장')}>
                    설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>접근성 설정</CardTitle>
              <CardDescription>
                모든 사용자가 편리하게 사용할 수 있도록 접근성을 개선합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="highContrast">고대비 모드</Label>
                    <p className="text-sm text-muted-foreground">텍스트와 배경의 대비를 높입니다</p>
                  </div>
                  <Switch
                    id="highContrast"
                    checked={accessibilitySettings.highContrast}
                    onCheckedChange={(checked) => 
                      setAccessibilitySettings({...accessibilitySettings, highContrast: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reducedMotion">동작 효과 줄이기</Label>
                    <p className="text-sm text-muted-foreground">애니메이션과 전환 효과를 줄입니다</p>
                  </div>
                  <Switch
                    id="reducedMotion"
                    checked={accessibilitySettings.reducedMotion}
                    onCheckedChange={(checked) => 
                      setAccessibilitySettings({...accessibilitySettings, reducedMotion: checked})
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="fontSize">글꼴 크기</Label>
                  <div className="mt-2">
                    <Slider
                      value={[accessibilitySettings.fontSize]}
                      onValueChange={(value) => 
                        setAccessibilitySettings({...accessibilitySettings, fontSize: value[0]})
                      }
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>12px</span>
                      <span>{accessibilitySettings.fontSize}px</span>
                      <span>24px</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="lineHeight">줄 높이</Label>
                  <div className="mt-2">
                    <Slider
                      value={[accessibilitySettings.lineHeight]}
                      onValueChange={(value) => 
                        setAccessibilitySettings({...accessibilitySettings, lineHeight: value[0]})
                      }
                      max={2.0}
                      min={1.0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1.0</span>
                      <span>{accessibilitySettings.lineHeight}</span>
                      <span>2.0</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="focusVisible">포커스 표시</Label>
                    <p className="text-sm text-muted-foreground">키보드 내비게이션 시 포커스를 명확히 표시합니다</p>
                  </div>
                  <Switch
                    id="focusVisible"
                    checked={accessibilitySettings.focusVisible}
                    onCheckedChange={(checked) => 
                      setAccessibilitySettings({...accessibilitySettings, focusVisible: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="screenReaderSupport">스크린 리더 지원</Label>
                    <p className="text-sm text-muted-foreground">스크린 리더를 위한 추가 정보를 제공합니다</p>
                  </div>
                  <Switch
                    id="screenReaderSupport"
                    checked={accessibilitySettings.screenReaderSupport}
                    onCheckedChange={(checked) => 
                      setAccessibilitySettings({...accessibilitySettings, screenReaderSupport: checked})
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => console.log('접근성 설정 저장')}>
                  설정 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle>개발자 설정</CardTitle>
              <CardDescription>
                고급 사용자를 위한 개발자 도구와 설정입니다. (주의: 잘못된 설정은 시스템에 영향을 줄 수 있습니다)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableDebugMode">디버그 모드</Label>
                    <p className="text-sm text-muted-foreground">개발자 콘솔에 디버그 정보를 표시합니다</p>
                  </div>
                  <Switch
                    id="enableDebugMode"
                    checked={developerSettings.enableDebugMode}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings({...developerSettings, enableDebugMode: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showAPILogs">API 로그 표시</Label>
                    <p className="text-sm text-muted-foreground">네트워크 요청과 응답을 콘솔에 표시합니다</p>
                  </div>
                  <Switch
                    id="showAPILogs"
                    checked={developerSettings.showAPILogs}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings({...developerSettings, showAPILogs: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableBetaFeatures">베타 기능 활성화</Label>
                    <p className="text-sm text-muted-foreground">아직 개발 중인 실험적 기능들을 활성화합니다</p>
                  </div>
                  <Switch
                    id="enableBetaFeatures"
                    checked={developerSettings.enableBetaFeatures}
                    onCheckedChange={(checked) => 
                      setDeveloperSettings({...developerSettings, enableBetaFeatures: checked})
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="customCSS">커스텀 CSS</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    인터페이스를 개인화하기 위한 CSS 코드를 입력하세요
                  </p>
                  <Textarea
                    id="customCSS"
                    value={developerSettings.customCSS}
                    onChange={(e) => setDeveloperSettings({...developerSettings, customCSS: e.target.value})}
                    placeholder="/* 여기에 CSS 코드를 입력하세요 */&#10;.custom-button {&#10;  background: #007bff;&#10;}"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="webhookURL">웹훅 URL</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    알림을 받을 웹훅 URL을 설정하세요
                  </p>
                  <Input
                    id="webhookURL"
                    value={developerSettings.webhookURL}
                    onChange={(e) => setDeveloperSettings({...developerSettings, webhookURL: e.target.value})}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div>
                  <Label htmlFor="apiTimeout">API 타임아웃 (초)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[developerSettings.apiTimeout]}
                      onValueChange={(value) => 
                        setDeveloperSettings({...developerSettings, apiTimeout: value[0]})
                      }
                      max={120}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>5초</span>
                      <span>{developerSettings.apiTimeout}초</span>
                      <span>2분</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">주의사항</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      개발자 설정은 시스템의 동작에 영향을 줄 수 있습니다. 변경 사항을 적용하기 전에 충분히 테스트하세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeveloperSettings({
                  enableDebugMode: false,
                  showAPILogs: false,
                  enableBetaFeatures: false,
                  customCSS: '',
                  webhookURL: '',
                  apiTimeout: 30
                })}>
                  초기화
                </Button>
                <Button onClick={() => console.log('개발자 설정 저장')}>
                  설정 저장
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>데이터 관리</CardTitle>
                <CardDescription>
                  데이터를 내보내거나 가져올 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>데이터 내보내기</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      모든 프로젝트, 문서, 파일 데이터를 내보냅니다.
                    </p>
                    <Button onClick={handleExportData} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      데이터 내보내기
                    </Button>
                  </div>

                  <div>
                    <Label>데이터 가져오기</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      백업된 데이터를 시스템으로 가져옵니다.
                    </p>
                    <Button onClick={handleImportData} variant="outline" className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      데이터 가져오기
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900">저장 용량</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">2.4 GB</p>
                    <p className="text-sm text-blue-700">/ 10 GB 사용됨</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">파일 수</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">1,247</p>
                    <p className="text-sm text-green-700">개 파일 업로드됨</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">백업 상태</span>
                    </div>
                    <p className="text-sm font-medium text-purple-600">최근 백업</p>
                    <p className="text-sm text-purple-700">2시간 전</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>전체 활동 히스토리</CardTitle>
                <CardDescription>
                  시스템의 모든 활동을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}