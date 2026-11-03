// src/tools/finance/split/hooks/useSaveImage.ts
import { useCallback } from 'react';
import type { Transaction } from '../utils/settlement';

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
      const headerHeight = 160;
      const footerHeight = 160;
      const transactionRowHeight = 60;
      
      const dynamicBodyHeight = Math.max(150, settlementTransactions.length * transactionRowHeight);
      const totalExportHeight = headerHeight + dynamicBodyHeight + footerHeight;

      exportCanvas.width = exportWidth;
      exportCanvas.height = totalExportHeight;

      canvasContext.fillStyle = '#ffffff';
      canvasContext.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      const leftMargin = 50;
      const rightMargin = 50;
      const contentWidth = exportWidth - leftMargin - rightMargin;

      canvasContext.textAlign = 'left';
      canvasContext.fillStyle = '#202124';
      canvasContext.font = 'bold 32px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('Bill Split Summary', leftMargin, 70);

      const currentDateString = new Date().toLocaleString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false
      });
      
      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '15px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(currentDateString, leftMargin, 100);

      const totalsY = 140;

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '14px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('Total Spent', leftMargin, totalsY);
      canvasContext.fillText('Per Person', leftMargin + 200, totalsY);

      canvasContext.fillStyle = '#1A73E8';
      canvasContext.font = 'bold 24px system-ui, -apple-system, sans-serif';
      canvasContext.fillText(`${currency} ${totalExpense.toFixed(2)}`, leftMargin, totalsY + 30);
      canvasContext.fillText(`${currency} ${perPersonShare.toFixed(2)}`, leftMargin + 200, totalsY + 30);

      canvasContext.strokeStyle = '#E5E7EB';
      canvasContext.lineWidth = 1;
      canvasContext.beginPath();
      canvasContext.moveTo(leftMargin, 200);
      canvasContext.lineTo(exportWidth - rightMargin, 200);
      canvasContext.stroke();

      let currentY = 240;

      if (settlementTransactions.length === 0) {
        canvasContext.fillStyle = '#5F6368';
        canvasContext.font = '16px system-ui, -apple-system, sans-serif';
        canvasContext.fillText('All settled. Everyone is even.', leftMargin, currentY);
      } else {
        for (const [transactionIndex, transaction] of settlementTransactions.entries()) {
          if (transactionIndex % 2 === 0) {
            canvasContext.fillStyle = '#F8F9FA';
            canvasContext.fillRect(leftMargin - 10, currentY - 25, contentWidth + 20, 46);
          }

          canvasContext.fillStyle = '#202124';
          canvasContext.font = 'bold 16px system-ui, -apple-system, sans-serif';
          canvasContext.fillText(transaction.fromMember, leftMargin, currentY);

          canvasContext.fillStyle = '#5F6368';
          canvasContext.font = '16px system-ui, -apple-system, sans-serif';
          canvasContext.fillText('pays', leftMargin + 150, currentY);

          canvasContext.fillStyle = '#202124';
          canvasContext.font = 'bold 16px system-ui, -apple-system, sans-serif';
          canvasContext.fillText(transaction.toMember, leftMargin + 210, currentY);

          canvasContext.fillStyle = '#1A73E8';
          canvasContext.font = 'bold 18px system-ui, -apple-system, sans-serif';
          canvasContext.textAlign = 'right';
          canvasContext.fillText(`${currency} ${transaction.transactionAmount.toFixed(2)}`, exportWidth - rightMargin, currentY);
          canvasContext.textAlign = 'left'; 

          currentY += transactionRowHeight;
        }
      }

      const footerStartY = totalExportHeight - footerHeight + 30;

      canvasContext.strokeStyle = '#E5E7EB';
      canvasContext.lineWidth = 1;
      canvasContext.beginPath();
      canvasContext.moveTo(leftMargin, footerStartY - 20);
      canvasContext.lineTo(exportWidth - rightMargin, footerStartY - 20);
      canvasContext.stroke();

      canvasContext.fillStyle = '#1A73E8';
      canvasContext.font = 'bold 16px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('ToolKit', leftMargin, footerStartY + 10);

      canvasContext.fillStyle = '#5F6368';
      canvasContext.font = '13px system-ui, -apple-system, sans-serif';
      canvasContext.fillText('Created by Pabitra Mohan Singh', leftMargin, footerStartY + 30);
      canvasContext.fillText('toolkit.pabitramohansingh.com/split', leftMargin, footerStartY + 50);

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