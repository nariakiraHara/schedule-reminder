import { Todo } from '../types/todo';
import { storage } from './storage';

/**
 * ブラウザ通知の許可をリクエスト
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知機能をサポートしていません');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

/**
 * Web Audio APIを使って通知音を生成・再生
 */
const playNotificationSound = () => {
  try {
    // AudioContextを作成
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // 2つの音を順番に鳴らす
    const times = [0, 0.15];
    const frequencies = [800, 1000];

    times.forEach((time, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 周波数を設定（ピッ、ピッという音）
      oscillator.frequency.value = frequencies[index];
      oscillator.type = 'sine';

      // 音量のエンベロープ（徐々に減衰）
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.15);

      // 音を再生
      oscillator.start(audioContext.currentTime + time);
      oscillator.stop(audioContext.currentTime + time + 0.15);
    });
  } catch (error) {
    console.error('通知音の再生に失敗しました:', error);
  }
};

/**
 * デスクトップ通知を表示
 */
export const showNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
    });

    // 通知音を再生
    playNotificationSound();

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

/**
 * 10分前通知が必要なスケジュールをチェックして通知
 */
export const checkAndNotify = () => {
  console.log('[通知チェック] 開始:', new Date().toLocaleTimeString());
  const todos = storage.getTodos();
  const now = new Date();
  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

  console.log(`[通知チェック] スケジュール数: ${todos.length}`);

  todos.forEach(todo => {
    if (todo.completed) {
      return;
    }

    // 開始時間の10分前通知をチェック
    if (!todo.notifiedStart) {
      const startDate = new Date(todo.startDate);
      const diffMinutes = Math.ceil((startDate.getTime() - now.getTime()) / (60 * 1000));

      console.log(`[開始通知チェック] "${todo.title}": 残り${diffMinutes}分, 通知済み: ${todo.notifiedStart}`);

      if (startDate <= tenMinutesLater && startDate > now) {
        const remainingMinutes = Math.ceil((startDate.getTime() - now.getTime()) / (60 * 1000));

        console.log(`[開始通知] 通知を送信: "${todo.title}" (あと${remainingMinutes}分)`);

        showNotification(
          '🚀 スケジュールの開始時間が近づいています',
          `「${todo.title}」の開始まであと${remainingMinutes}分です`
        );

        // 開始通知済みフラグを立てる
        storage.updateTodo(todo.id, { notifiedStart: true });
      }
    }

    // 終了時間の10分前通知をチェック（終了時間が設定されている場合のみ）
    if (todo.endDate && !todo.notifiedEnd) {
      const endDate = new Date(todo.endDate);
      const diffMinutes = Math.ceil((endDate.getTime() - now.getTime()) / (60 * 1000));

      console.log(`[終了通知チェック] "${todo.title}": 残り${diffMinutes}分, 通知済み: ${todo.notifiedEnd}`);

      if (endDate <= tenMinutesLater && endDate > now) {
        const remainingMinutes = Math.ceil((endDate.getTime() - now.getTime()) / (60 * 1000));

        console.log(`[終了通知] 通知を送信: "${todo.title}" (あと${remainingMinutes}分)`);

        showNotification(
          '⏰ スケジュールの終了時間が近づいています',
          `「${todo.title}」の終了まであと${remainingMinutes}分です`
        );

        // 終了通知済みフラグを立てる
        storage.updateTodo(todo.id, { notifiedEnd: true });
      }
    }
  });
};

/**
 * 通知チェックを開始（1分ごと）
 */
export const startNotificationCheck = (): NodeJS.Timeout => {
  // 初回実行
  checkAndNotify();

  // 1分ごとにチェック
  return setInterval(() => {
    checkAndNotify();
  }, 60 * 1000); // 60秒
};

/**
 * 通知チェックを停止
 */
export const stopNotificationCheck = (intervalId: NodeJS.Timeout) => {
  clearInterval(intervalId);
};
