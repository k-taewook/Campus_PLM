import { useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * 사용자 활동을 감지하여 세션을 유지하는 커스텀 훅
 * - 마우스 이동, 클릭, 키보드 입력 등을 감지
 * - 5분마다 세션 체크 API 호출하여 세션 연장
 * - 30분 동안 활동 없으면 자동으로 세션 만료
 */
export const useSessionKeepAlive = () => {
  const lastActivityRef = useRef<number>(Date.now());
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 활동 감지 이벤트들
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // 활동 감지 핸들러
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // 세션 체크 및 연장
    const checkSession = async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const THIRTY_MINUTES = 30 * 60 * 1000; // 30분

      // 30분 이상 활동이 없었다면 세션 체크 중단
      if (timeSinceLastActivity > THIRTY_MINUTES) {
        console.log('30분 이상 활동 없음 - 세션 체크 중단');
        return;
      }

      // 활동이 있었다면 세션 체크 API 호출하여 세션 연장
      try {
        await api.get('/auth/check');
        console.log('세션 연장됨 - 마지막 활동:', Math.floor(timeSinceLastActivity / 1000), '초 전');
      } catch (error) {
        console.error('세션 체크 실패:', error);
        // 401 에러는 인터셉터에서 처리됨
      }
    };

    // 이벤트 리스너 등록
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // 5분마다 세션 체크
    sessionCheckIntervalRef.current = setInterval(checkSession, 5 * 60 * 1000);

    // 즉시 한 번 체크
    checkSession();

    // 클린업
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });

      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, []);
};
