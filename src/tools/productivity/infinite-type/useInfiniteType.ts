// src/tools/productivity/infinite-type/useInfiniteType.ts
import { useState, useCallback, useEffect } from 'react';

export interface TypingLine {
  targetText: string;
  typedText: string;
}

export interface TypingSession {
  lines: TypingLine[];
  totalKeysPressed: number;
  correctCharacters: number;
  missedCharacters: number;
  firstKeystrokeTimestamp: number;
}

export interface UseInfiniteTypeReturn {
  sessionState: TypingSession;
  characterPool: string;
  setCharacterPool: (pool: string) => void;
  startSession: (maxCharsPerLine: number) => void;
  stopSession: () => void;
  isSessionActive: boolean;
  handleCharacterInput: (character: string) => void;
  handleBackspace: () => void;
  handleEnterKey: (maxCharsPerLine: number) => void;
}

const DEFAULT_CHARACTER_POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
const randomBuffer = new Uint32Array(1);

function generateRandomCharacter(pool: string): string {
  crypto.getRandomValues(randomBuffer);
  return pool[randomBuffer[0] % pool.length] || 'a';
}

function generateRandomString(pool: string, count: number): string {
  let result = '';
  for (let i = 0; i < count; i++) result += generateRandomCharacter(pool);
  return result;
}

function createNewLine(pool: string, maxChars: number): TypingLine {
  return {
    targetText: generateRandomString(pool, maxChars),
    typedText: '',
  };
}

export function useInfiniteType(): UseInfiniteTypeReturn {
  const [characterPool, setCharacterPool] = useState<string>(DEFAULT_CHARACTER_POOL);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  
  const [sessionState, setSessionState] = useState<TypingSession>({
    lines: [],
    totalKeysPressed: 0,
    correctCharacters: 0,
    missedCharacters: 0,
    firstKeystrokeTimestamp: 0,
  });

  useEffect(() => {
    const savedConfiguration = localStorage.getItem('infinite_type_config');
    if (savedConfiguration) {
      try {
        const parsedConfig = JSON.parse(savedConfiguration);
        if (typeof parsedConfig.characterPool === 'string') setCharacterPool(parsedConfig.characterPool);
      } catch (error) {
        console.warn('Failed to load typing configuration:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('infinite_type_config', JSON.stringify({ characterPool }));
  }, [characterPool]);

  const startSession = useCallback((maxChars: number) => {
    const activePool = characterPool.length > 0 ? characterPool : DEFAULT_CHARACTER_POOL;
    setSessionState({
      lines: [createNewLine(activePool, maxChars)],
      totalKeysPressed: 0,
      correctCharacters: 0,
      missedCharacters: 0,
      firstKeystrokeTimestamp: 0,
    });
    setIsSessionActive(true);
  }, [characterPool]);

  const stopSession = useCallback(() => {
    setIsSessionActive(false);
  }, []);

  const handleCharacterInput = useCallback((inputCharacter: string) => {
    if (!isSessionActive) return;

    setSessionState((previousState) => {
      const { lines, totalKeysPressed, correctCharacters, missedCharacters, firstKeystrokeTimestamp } = previousState;
      if (lines.length === 0) return previousState;

      const activeLineIndex = lines.length - 1;
      const activeLine = lines[activeLineIndex];
      
      if (activeLine.typedText.length >= activeLine.targetText.length) return previousState;

      const expectedCharacter = activeLine.targetText[activeLine.typedText.length];
      const isCharacterCorrect = inputCharacter === expectedCharacter;
      
      const updatedLines = [...lines];
      updatedLines[activeLineIndex] = {
        ...activeLine,
        typedText: activeLine.typedText + inputCharacter,
      };

      return {
        ...previousState,
        lines: updatedLines,
        totalKeysPressed: totalKeysPressed + 1,
        correctCharacters: correctCharacters + (isCharacterCorrect ? 1 : 0),
        missedCharacters: missedCharacters + (isCharacterCorrect ? 0 : 1),
        firstKeystrokeTimestamp: firstKeystrokeTimestamp === 0 ? Date.now() : firstKeystrokeTimestamp,
      };
    });
  }, [isSessionActive]);

  const handleBackspace = useCallback(() => {
    if (!isSessionActive) return;

    setSessionState((previousState) => {
      const { lines } = previousState;
      if (lines.length === 0) return previousState;

      const activeLineIndex = lines.length - 1;
      const activeLine = lines[activeLineIndex];

      if (activeLine.typedText.length > 0) {
        const updatedLines = [...lines];
        updatedLines[activeLineIndex] = {
          ...activeLine,
          typedText: activeLine.typedText.slice(0, -1),
        };
        return { ...previousState, lines: updatedLines };
      }

      if (lines.length > 1) {
        return { ...previousState, lines: lines.slice(0, -1) };
      }

      return previousState;
    });
  }, [isSessionActive]);

  const handleEnterKey = useCallback((maxChars: number) => {
    if (!isSessionActive) return;

    const activePool = characterPool.length > 0 ? characterPool : DEFAULT_CHARACTER_POOL;
    
    setSessionState((previousState) => {
      const { lines } = previousState;
      if (lines.length === 0) return previousState;

      const activeLineIndex = lines.length - 1;
      const activeLine = lines[activeLineIndex];

      if (activeLine.typedText.length < activeLine.targetText.length) return previousState;

      return {
        ...previousState,
        lines: [...lines, createNewLine(activePool, maxChars)],
      };
    });
  }, [isSessionActive, characterPool]);

  return {
    sessionState,
    characterPool,
    setCharacterPool,
    startSession,
    stopSession,
    isSessionActive,
    handleCharacterInput,
    handleBackspace,
    handleEnterKey,
  };
}