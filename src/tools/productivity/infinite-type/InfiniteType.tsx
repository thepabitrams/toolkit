// src/tools/productivity/infinite-type/InfiniteType.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { MdWarningAmber } from 'react-icons/md';
import { FiCopy } from 'react-icons/fi';
import { spring, stagger } from '@/config/motion';
import { useInfiniteType } from './useInfiniteType';
import { Controls } from './Controls';
import { Viewport } from './Viewport';

const RESIZE_THRESHOLD_PX = 20;
const TOOLKIT_URL = 'https://toolkit.pabitramohansingh.com/';

const workspaceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: stagger.standard } },
};

const workspaceCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.standard },
};

function formatElapsedTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const InfiniteType: React.FC = (): React.JSX.Element => {
  const {
    sessionState,
    characterPool,
    setCharacterPool,
    startSession,
    stopSession,
    isSessionActive,
    handleCharacterInput,
    handleBackspace,
    handleEnterKey,
  } = useInfiniteType();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [charWidth, setCharWidth] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [, setTick] = useState(0);
  const initialContainerWidthRef = useRef(0);
  const hasWarnedAboutResizeRef = useRef(false);

  const activeLineIndex = sessionState.lines.length - 1;
  const activeTypedLength = sessionState.lines[activeLineIndex]?.typedText.length ?? 0;

  const maxCharsPerLine = useMemo(() => {
    if (containerWidth <= 0 || charWidth <= 0) return 40;
    return Math.max(1, Math.floor(containerWidth / charWidth));
  }, [containerWidth, charWidth]);

  useEffect(() => {
    if (isSessionActive) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isSessionActive]);

  useEffect(() => {
    if (!isSessionActive) return;
    const intervalId = setInterval(() => setTick((previousTick) => previousTick + 1), 1000);
    return () => clearInterval(intervalId);
  }, [isSessionActive]);

  useEffect(() => {
    if (!isSessionActive || initialContainerWidthRef.current === 0) return;
    if (Math.abs(containerWidth - initialContainerWidthRef.current) > RESIZE_THRESHOLD_PX) {
      stopSession();
      if (!hasWarnedAboutResizeRef.current) {
        hasWarnedAboutResizeRef.current = true;
        alert('Screen size changed. Session stopped. Press Start to continue.');
      }
    }
  }, [containerWidth, isSessionActive, stopSession]);

  useEffect(() => {
    if (!isSessionActive) return;
    const inputElement = inputRef.current;
    const containerElement = containerRef.current;
    if (!inputElement || !containerElement) return;
    
    const activeLineElement = containerElement.lastElementChild as HTMLElement | null;
    if (!activeLineElement) return;

    const animationFrameId = requestAnimationFrame(() => {
      const rect = activeLineElement.getBoundingClientRect();
      inputElement.style.transform = `translate(${rect.left}px, ${Math.max(0, rect.top)}px)`;
    });
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeLineIndex, activeTypedLength, isSessionActive]);

  const handleStart = () => {
    let measuredContainerWidth = containerWidth;
    let measuredCharWidth = charWidth;

    if (containerRef.current) {
      const measuredWidth = containerRef.current.getBoundingClientRect().width;
      if (measuredWidth > 0) measuredContainerWidth = measuredWidth;
    }
    if (probeRef.current) {
      const measuredWidth = probeRef.current.getBoundingClientRect().width;
      if (measuredWidth > 0) measuredCharWidth = measuredWidth;
    }

    if (measuredContainerWidth > 0 && measuredCharWidth > 0) {
      setContainerWidth(measuredContainerWidth);
      setCharWidth(measuredCharWidth);
    }

    const computedMaxChars = (measuredContainerWidth > 0 && measuredCharWidth > 0)
        ? Math.max(1, Math.floor(measuredContainerWidth / measuredCharWidth))
        : 40;

    initialContainerWidthRef.current = measuredContainerWidth;
    hasWarnedAboutResizeRef.current = false;
    startSession(computedMaxChars);
    inputRef.current?.focus({ preventScroll: true });
  };

  const elapsedMilliseconds = sessionState.firstKeystrokeTimestamp > 0 ? Date.now() - sessionState.firstKeystrokeTimestamp : 0;
  const elapsedMinutes = elapsedMilliseconds / 60000;
  const charsPerMinute = elapsedMinutes > 0 ? Math.round(sessionState.correctCharacters / elapsedMinutes) : 0;
  const accuracy = sessionState.totalKeysPressed === 0 ? 100 : (sessionState.correctCharacters / sessionState.totalKeysPressed) * 100;

  const statistics = {
    charsPerMinute,
    accuracyPercentage: accuracy.toFixed(1),
    totalKeys: sessionState.totalKeysPressed,
    totalErrors: sessionState.missedCharacters,
    elapsedTime: formatElapsedTime(elapsedMilliseconds),
  };

  const handleCopy = async () => {
    const payloadText = [
      `CPM: ${statistics.charsPerMinute}`,
      `Acc: ${statistics.accuracyPercentage}%`,
      `Keys: ${statistics.totalKeys}`,
      `Errors: ${statistics.totalErrors}`,
      `Time: ${statistics.elapsedTime}`,
      '',
      `Pool: ${characterPool}`,
      '',
      'InfiniteType By PabitraMS',
      'Generated by toolpabitrams',
      TOOLKIT_URL,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(payloadText);
      alert('Stats copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleInputEvent = (event: React.FormEvent<HTMLInputElement>) => {
    if (!isSessionActive) return;
    const inputElement = event.currentTarget;
    const inputValue = inputElement.value;
    if (inputValue.length > 0) {
      for (let i = 0; i < inputValue.length; i++) {
        handleCharacterInput(inputValue[i]);
      }
      inputElement.value = '';
    }
  };

  const handleKeyDownEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSessionActive) return;
    const key = event.key;
    if (key === 'Escape') { stopSession(); return; }
    if (key === 'Backspace') { event.preventDefault(); handleBackspace(); return; }
    if (key === 'Enter') { event.preventDefault(); handleEnterKey(maxCharsPerLine); return; }
  };

  return (
    <div className="w-full py-6 px-4 sm:px-6 lg:px-8" onClick={() => isSessionActive && inputRef.current?.focus({ preventScroll: true })}>
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
        style={{ position: 'fixed', top: 0, left: 0, width: '1px', height: '1px', opacity: 0, border: 'none', outline: 'none', padding: 0, margin: 0, fontSize: '16px', zIndex: -1, pointerEvents: 'none' }}
        onInput={handleInputEvent}
        onKeyDown={handleKeyDownEvent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <div className="max-w-4xl mx-auto space-y-4">
        <motion.div variants={workspaceContainerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.div variants={workspaceCardVariants}>
            <Controls
              characterPool={characterPool}
              isSessionActive={isSessionActive}
              onPoolChange={setCharacterPool}
              onStart={handleStart}
              onStop={stopSession}
              onCopyStats={handleCopy}
              statistics={statistics}
            />
          </motion.div>

          <motion.div variants={workspaceCardVariants}>
            <Viewport
              sessionState={sessionState}
              isSessionActive={isSessionActive}
              isFocused={isFocused}
              containerRef={containerRef}
              probeRef={probeRef}
              onContainerWidth={setContainerWidth}
              onCharWidth={setCharWidth}
            />
          </motion.div>

          <motion.div variants={workspaceCardVariants}>
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
              {isSessionActive
                ? 'Type. Backspace to fix. Enter at the end for a new line. Escape to stop.'
                : 'Configure above and press Start.'}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};