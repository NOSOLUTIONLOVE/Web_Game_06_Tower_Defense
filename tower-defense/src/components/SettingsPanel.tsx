/**
 * SettingsPanel - 设置弹窗
 *
 * - 音效开关
 * - 重置全部进度（带二次确认）
 * - 关于信息
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { useGameStore } from '../store/useGameStore';
import { Trash2, Volume2 } from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const audioEnabled = useGameStore((s) => s.audioEnabled);
  const setAudioEnabled = useGameStore((s) => s.setAudioEnabled);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = (): void => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetProgress();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>游戏设置与数据管理</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 音效开关 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="audio-toggle" className="text-sm">
                音效
              </Label>
            </div>
            <Switch
              id="audio-toggle"
              checked={audioEnabled}
              onCheckedChange={(v) => setAudioEnabled(v)}
            />
          </div>

          {/* 重置进度 */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">重置进度</div>
                <div className="text-xs text-muted-foreground mt-1">
                  清除所有关卡解锁与最佳分
                </div>
              </div>
              <Button
                variant={confirmReset ? 'destructive' : 'outline'}
                size="sm"
                onClick={handleReset}
                className="gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {confirmReset ? '再次点击确认' : '重置'}
              </Button>
            </div>
          </div>

          {/* 关于 */}
          <div className="border-t border-white/10 pt-4 text-xs text-muted-foreground space-y-1">
            <div>塔防 v0.1.0 · 像素风</div>
            <div>5 关卡 · 3 塔 · 5 敌人</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
