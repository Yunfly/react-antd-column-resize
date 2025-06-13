import React, { memo, useEffect, useRef, useState } from 'react';
import type { ResizeCallbackData } from 'react-resizable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './style/global.css';
import './style/index.css';
import { ResizableHeaderCellProps } from './types';

const ResizableHeaderCell = (props: ResizableHeaderCellProps): JSX.Element => {
  const {
    width,
    minWidth,
    maxWidth,
    cellKey,
    onResize: onResizeCallback,
    children,
    onClick,
    rowSpan,
    style,
    colSpan,
    scope,
    className,
    ...restProps
  } = props as ResizableHeaderCellProps;

  const [interWidth, setInterWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);

  const thRef = useRef<HTMLTableHeaderCellElement>(null);

  useEffect(() => {
    setInterWidth(width);
    if (!width && thRef.current) {
      setInterWidth(thRef.current.clientWidth - 8);
    }
  }, [width]);

  useEffect(() => {
    if (thRef.current && !width) {
      onResizeCallback?.(cellKey, thRef.current.clientWidth - 8);
    }
  }, [thRef]);

  const toggleColumnResizeStyles = (active: boolean) => {
    try {
      const bodyStyle = document.body?.style;
      const htmlStyle = document.documentElement?.style;

      if (bodyStyle && htmlStyle) {
        bodyStyle.userSelect = active ? 'none' : '';
        bodyStyle.pointerEvents = active ? 'none' : '';
        htmlStyle.cursor = active ? 'col-resize' : '';
      }
    } catch (error) {
      console.error(
        'An error occurred while toggling column resize styles:',
        error,
      );
    }
  };
  const diffWidth = (width: number): number => {
    let viceWidth = width;
    if (viceWidth >= maxWidth) viceWidth = maxWidth;
    if (viceWidth <= minWidth) viceWidth = minWidth;
    return viceWidth;
  };

  const onResizeStart = (_: any, data: ResizeCallbackData) => {
    // const startWidth = diffWidth(data?.size?.width);
    const startWidth = diffWidth(data?.node?.parentElement?.clientWidth ?? 0);
    toggleColumnResizeStyles(true);
    setIsResizing(true);
    setInterWidth(startWidth);
  };

  const onResize = (_: any, data: ResizeCallbackData) => {
    const nowWidth = diffWidth(data?.size?.width);
    setInterWidth(nowWidth);
  };

  const onResizeStop = () => {
    toggleColumnResizeStyles(false);
    setIsResizing(false);
    if (interWidth === width) return;
    const nowWidth = diffWidth(interWidth);
    nowWidth !== interWidth && setInterWidth(nowWidth);
    onResizeCallback?.(cellKey, nowWidth);
  };

  return (
    <th
      ref={thRef}
      scope={scope}
      colSpan={colSpan}
      rowSpan={rowSpan}
      onClick={onClick}
      className={`resizable-container ${className}`}
      style={{
        ...style,
        overflow: 'unset',
      }}
    >
      <Resizable
        width={interWidth}
        height={0}
        className="resizable-box"
        minConstraints={[minWidth, 50]}
        maxConstraints={[maxWidth, 50]}
        handle={
          <div className="resizable-handler">
            <div className="resizable-line" />
          </div>
        }
        // draggableOpts={{ enableUserSelectHack: false }}
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
      >
        <div
          style={{
            height: '100%',
            width: isResizing ? interWidth : undefined,
            minWidth: `${interWidth} !important`,
          }}
        ></div>
      </Resizable>
      <div {...restProps} className="resizable-title">
        {children}
      </div>
    </th>
  );
};

export default memo(ResizableHeaderCell);
