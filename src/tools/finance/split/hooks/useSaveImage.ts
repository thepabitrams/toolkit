// src/tools/finance/split/hooks/useSaveImage.ts
import { useCallback } from 'react';
import type { Transaction } from '../utils/settlement';
import { split } from '../config/split-config';

interface UseSaveImageProps {
  currency: string;
  totalExpense: number;
  perPersonShare: number;
  groupMembers: string[];
  settlementTransactions: Transaction[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useSaveImage({
  currency,
  totalExpense,
  perPersonShare,
  groupMembers,
  settlementTransactions,
  onSuccess,
  onError,
}: UseSaveImageProps) {
  const saveImage = useCallback(async () => {
    try {
      const exportCanvas = document.createElement('canvas');
      const canvasContext = exportCanvas.getContext('2d');

      if (!canvasContext) {
        onError('Canvas not supported');
        return;
      }

      const exportWidth = 800;
      const leftMargin = 60;
      const rightMargin = 60;
      const maxTextWidth = exportWidth - leftMargin - rightMargin;

      const membersString = groupMembers.join(', ');
      canvasContext.font = '16px system-ui, -apple-system, sans-serif';
      const membersLines = Math.ceil(canvasContext.measureText(membersString).width / maxTextWidth) || 1;
      
      const paddingTop = 60;
      const titleHeight = 70;
      const totalsHeight = 60;
      const dividerSpacing = 30;
      const groupHeaderHeight = 35;
      const membersHeight = membersLines * 24;
      const transactionsHeaderHeight = 35;
      const transactionsHeight = settlementTransactions.length * 45;
      const footerHeight = 110;
      const paddingBottom = 40;

      const calculatedHeight =
        paddingTop +
        titleHeight +
        totalsHeight +
        dividerSpacing +
        groupHeaderHeight +
        membersHeight +
        dividerSpacing +
        transactionsHeaderHeight +
        transactionsHeight +
        dividerSpacing +
        footerHeight +
        paddingBottom;

      exportCanvas.width = exportWidth;
      exportCanvas.height = calculatedHeight;

      canvasContext.fillStyle = '#ffffff';
      canvasContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      canvasContext.textAlign = 'left';
      canvasContext.textBaseline = 'top';

      const drawDivider = (yPosition: number) => {
        canvasContext.strokeStyle = '#E5E7EB';
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.moveTo(leftMargin, yPosition);
        canvasContext.lineTo(exportWidth - rightMargin, yPosition);
        canvasContext.stroke();
      };

      let currentY = paddingTop;

      canvasContext.fillStyle = '#202124';
      canvasContext.font = 'bold 32px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('BILL SPLIT SUMMARY', leftMargin, currentY);
      currentY += titleHeight;

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '16px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('Total Spent:', leftMargin, currentY);
      
      canvasContext.fillStyle = '#1A73E8';
      canvasContext.font = 'bold 18px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(`${currency} ${totalExpense.toFixed(2)}`, leftMargin + 160, currentY);
      currentY += 30;

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '16px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('Per Person:', leftMargin, currentY);
      
      canvasContext.fillStyle = '#1A73E8';
      canvasContext.font = 'bold 18px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(`${currency} ${perPersonShare.toFixed(2)}`, leftMargin + 160, currentY);
      currentY += totalsHeight;

      drawDivider(currentY);
      currentY += dividerSpacing;

      canvasContext.fillStyle = '#202124';
      canvasContext.font = 'bold 18px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(`Group Members (${groupMembers.length})`, leftMargin, currentY);
      currentY += groupHeaderHeight;

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '16px system-ui, -apple-system, sans-serif';
      
      let lineBuffer = '';
      for (const character of membersString) {
        const testLine = lineBuffer + character;
        if (canvasContext.measureText(testLine).width > maxTextWidth) {
          canvasContext.fillText(lineBuffer, leftMargin, currentY);
          currentY += 24;
          lineBuffer = character;
        } else {
          lineBuffer = testLine;
        }
      }
      if (lineBuffer) {
        canvasContext.fillText(lineBuffer, leftMargin, currentY);
        currentY += membersHeight;
      } else {
        currentY += membersHeight;
      }

      drawDivider(currentY);
      currentY += dividerSpacing;

      canvasContext.fillStyle = '#202124';
      canvasContext.font = 'bold 18px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(`Transactions (${settlementTransactions.length})`, leftMargin, currentY);
      currentY += transactionsHeaderHeight;

      if (settlementTransactions.length === 0) {
        canvasContext.fillStyle = '#1A73E8';
        canvasContext.font = '16px system-ui, -apple-system, sans-serif';
        canvasContext.fillText('All settled. Everyone is even.', leftMargin, currentY);
        currentY += 45;
      } else {
        for (const transaction of settlementTransactions) {
          canvasContext.fillStyle = '#202124';
          canvasContext.font = 'bold 16px system-ui, -apple-system, sans-serif';
          canvasContext.fillText(transaction.fromMember, leftMargin, currentY);

          canvasContext.fillStyle = '#5F6368';
          canvasContext.font = '16px system-ui, -apple-system, sans-serif';
          canvasContext.fillText('→', leftMargin + 150, currentY);

          canvasContext.fillStyle = '#202124';
          canvasContext.font = 'bold 16px system-ui, -apple-system, sans-serif';
          canvasContext.fillText(transaction.toMember, leftMargin + 200, currentY);

          canvasContext.fillStyle = '#1A73E8';
          canvasContext.font = 'bold 18px system-ui, -apple-system, sans-serif';
          canvasContext.textAlign = 'right';
          canvasContext.fillText(`${currency} ${transaction.transactionAmount.toFixed(2)}`, exportWidth - rightMargin, currentY);
          canvasContext.textAlign = 'left';

          currentY += 45;
        }
      }

      drawDivider(currentY);
      currentY += dividerSpacing;

      canvasContext.fillStyle = '#1A73E8';
      canvasContext.font = 'bold 16px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(split.appName, leftMargin, currentY);
      currentY += 25;

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '14px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(`Created by ${split.authorName}`, leftMargin, currentY);
      currentY += 20;

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '14px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(split.url, leftMargin, currentY);
      currentY += 20;

      canvasContext.fillStyle = '#9AA0A6';
      canvasContext.font = '14px system-ui, -apple-system, sans-serif';
      const currentDateString = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
      canvasContext.fillText(currentDateString, leftMargin, currentY);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.download = `toolkit-split-${Date.now()}.png`;
      downloadAnchor.href = exportCanvas.toDataURL('image/png');
      downloadAnchor.click();

      onSuccess('Image saved');
    } catch (error) {
      console.error('Save image failed:', error);
      onError('Failed to save');
    }
  }, [currency, totalExpense, perPersonShare, groupMembers, settlementTransactions, onSuccess, onError]);

  return { saveImage };
}